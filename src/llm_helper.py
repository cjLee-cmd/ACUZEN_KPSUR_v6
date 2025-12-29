#!/usr/bin/env python3
"""
KSUR LLM Helper Module
Provides unified interface for Gemini API integration
"""

import os
import time
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
DEFAULT_MODEL = os.getenv('LLM_MODEL', 'gemini-2.0-flash-exp')


class GeminiClient:
    """Unified Gemini API client for KSUR system"""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        Initialize Gemini client

        Args:
            api_key: Google API key (defaults to GOOGLE_API_KEY from .env)
            model: Model name (defaults to LLM_MODEL from .env)
        """
        self.api_key = api_key or GOOGLE_API_KEY
        self.model = model or DEFAULT_MODEL

        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found. Please set it in .env file.")

        self.client = genai.Client(api_key=self.api_key)

    def generate_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        json_mode: bool = False,
        max_retries: int = 3
    ) -> Dict[str, Any]:
        """
        Generate content using Gemini API

        Args:
            prompt: User prompt
            system_instruction: System instruction for context
            temperature: Sampling temperature (0.0-1.0)
            json_mode: Enable JSON output mode
            max_retries: Maximum retry attempts on failure

        Returns:
            Dict containing:
                - text: Generated text
                - input_tokens: Input token count
                - output_tokens: Output token count
                - total_tokens: Total token count
                - model: Model used
                - duration_ms: Generation duration in milliseconds
        """
        config_params = {
            "temperature": temperature,
        }

        if json_mode:
            config_params["response_mime_type"] = "application/json"

        if system_instruction:
            config_params["system_instruction"] = system_instruction

        config = types.GenerateContentConfig(**config_params)

        start_time = time.time()
        last_error = None

        for attempt in range(max_retries):
            try:
                # Count input tokens
                token_count_response = self.client.models.count_tokens(
                    model=self.model,
                    contents=prompt
                )
                input_tokens = token_count_response.total_tokens

                # Generate content
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=config
                )

                # Count output tokens
                output_tokens = len(response.text.split())  # Rough estimate

                duration_ms = int((time.time() - start_time) * 1000)

                return {
                    "text": response.text,
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "total_tokens": input_tokens + output_tokens,
                    "model": self.model,
                    "duration_ms": duration_ms,
                    "success": True
                }

            except Exception as e:
                last_error = e
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2  # Exponential backoff
                    time.sleep(wait_time)
                    continue

        # All retries failed
        return {
            "text": "",
            "error": str(last_error),
            "success": False,
            "duration_ms": int((time.time() - start_time) * 1000)
        }

    def classify_raw_id(self, filename: str, content_preview: str) -> Dict[str, Any]:
        """
        Classify document RAW ID from filename and content

        Args:
            filename: Original filename
            content_preview: First 500 chars of document content

        Returns:
            Dict with classification result including RAW ID
        """
        system_instruction = """You are a pharmaceutical document classification expert.
Classify documents into one of these RAW IDs:

Required Documents (10):
- CS_Summary: Case Summary
- PH_Literature: Published Literature
- PH_NonIntervention: Non-Interventional Study
- PH_Clinical: Clinical Trial
- PH_NonClinical: Non-Clinical Study
- Table_LineList: Line Listing
- Table_Summary: Summary Table
- Ref_IB: Investigator's Brochure
- Ref_RMP: Risk Management Plan
- Ref_Label: Product Label

Optional Documents (10):
- PH_Registry, PH_PostMarketing, PH_CaseControl, PH_Cohort, PH_MetaAnalysis,
  Ref_SPC, Ref_PI, Ref_CCDS, Ref_Previous, Other

Return only JSON with: {"raw_id": "XX_YYY", "confidence": 0.95, "reasoning": "..."}
"""

        prompt = f"""Classify this document:

Filename: {filename}
Content Preview: {content_preview}

Return classification in JSON format."""

        return self.generate_content(
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=0.3,
            json_mode=True
        )

    def convert_to_markdown(self, content: str, file_type: str) -> Dict[str, Any]:
        """
        Convert document content to markdown

        Args:
            content: Document content (text or base64)
            file_type: File type (pdf, docx, xlsx, txt)

        Returns:
            Dict with markdown conversion result
        """
        system_instruction = """You are a document conversion expert.
Convert the provided document content to clean, structured markdown.

Requirements:
- Preserve all headings, lists, tables
- Use proper markdown syntax
- Keep all important information
- Remove headers/footers/page numbers
- Maintain document structure"""

        prompt = f"""Convert this {file_type.upper()} document to markdown:

{content}

Return only the markdown content, no explanations."""

        return self.generate_content(
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=0.2
        )

    def extract_data(
        self,
        markdown_content: str,
        data_type: str,
        extraction_rules: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Extract structured data from markdown content

        Args:
            markdown_content: Markdown document content
            data_type: Type of data to extract (CS, PH, Table)
            extraction_rules: Optional specific extraction rules

        Returns:
            Dict with extracted data in JSON format
        """
        system_instruction = f"""You are a pharmaceutical data extraction expert.
Extract {data_type} data from the provided markdown document.

Follow these rules:
{extraction_rules or 'Extract all relevant fields based on document type'}

Return structured JSON with extracted data."""

        prompt = f"""Extract {data_type} data from this document:

{markdown_content}

Return only JSON with extracted data."""

        return self.generate_content(
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=0.2,
            json_mode=True
        )

    def qc_check(
        self,
        report_content: str,
        qc_model: str = "gemini-2.0-flash-thinking"
    ) -> Dict[str, Any]:
        """
        Perform Quality Check on report

        Args:
            report_content: Full report content
            qc_model: Model to use for QC (supports thinking models)

        Returns:
            Dict with QC results and issues found
        """
        system_instruction = """You are a pharmaceutical quality control expert.
Review the PSUR report for:
- Completeness
- Accuracy
- Consistency
- Regulatory compliance
- Data integrity

Return JSON with:
{
  "overall_status": "PASS/FAIL",
  "issues": [{"severity": "high/medium/low", "section": "...", "description": "...", "suggestion": "..."}],
  "score": 0-100,
  "summary": "..."
}
"""

        prompt = f"""Perform quality check on this PSUR report:

{report_content}

Return QC results in JSON format."""

        # Use specified QC model (may be different from default)
        original_model = self.model
        self.model = qc_model

        result = self.generate_content(
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=0.1,
            json_mode=True
        )

        # Restore original model
        self.model = original_model

        return result

    def count_tokens(self, text: str) -> int:
        """
        Count tokens in text

        Args:
            text: Text to count tokens for

        Returns:
            Token count
        """
        try:
            response = self.client.models.count_tokens(
                model=self.model,
                contents=text
            )
            return response.total_tokens
        except Exception as e:
            # Fallback to word count estimation
            return len(text.split())

    def estimate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """
        Estimate API cost in USD

        Args:
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens

        Returns:
            Estimated cost in USD
        """
        # Gemini 2.5 Pro pricing (as of 2025)
        # Input: $1.25 per 1M tokens
        # Output: $5.00 per 1M tokens

        input_cost = (input_tokens / 1_000_000) * 1.25
        output_cost = (output_tokens / 1_000_000) * 5.00

        return input_cost + output_cost


# Singleton instance for easy access
_default_client: Optional[GeminiClient] = None

def get_client() -> GeminiClient:
    """Get default Gemini client instance"""
    global _default_client
    if _default_client is None:
        _default_client = GeminiClient()
    return _default_client
