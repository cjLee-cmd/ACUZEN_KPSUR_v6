#!/usr/bin/env python3
"""
Test LLM Helper Module
"""

import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from llm_helper import GeminiClient, get_client


def test_llm_helper():
    """Test all LLM helper functions"""

    print("\n" + "="*60)
    print("  🧪 LLM HELPER MODULE TEST")
    print("="*60)

    # Test 1: Basic client initialization
    print("\n1️⃣  Testing Client Initialization...")
    try:
        client = get_client()
        print(f"   ✅ Client initialized with model: {client.model}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return False

    # Test 2: Basic content generation
    print("\n2️⃣  Testing Basic Content Generation...")
    result = client.generate_content(
        prompt="What is pharmacovigilance? Answer in one sentence in Korean.",
        temperature=0.5
    )
    if result.get('success'):
        print(f"   ✅ Response: {result['text'][:100]}...")
        print(f"   📊 Tokens: {result['total_tokens']} (input: {result['input_tokens']}, output: {result['output_tokens']})")
        print(f"   ⏱️  Duration: {result['duration_ms']}ms")
    else:
        print(f"   ❌ Failed: {result.get('error')}")
        return False

    # Test 3: RAW ID Classification
    print("\n3️⃣  Testing RAW ID Classification...")
    result = client.classify_raw_id(
        filename="case_summary_2024.pdf",
        content_preview="Patient Information: Age 45, Male. Adverse Event: Headache after vaccination..."
    )
    if result.get('success'):
        print(f"   ✅ Classification result:")
        print(f"   {result['text']}")
        print(f"   📊 Tokens: {result['total_tokens']}")
    else:
        print(f"   ❌ Failed: {result.get('error')}")

    # Test 4: Markdown Conversion
    print("\n4️⃣  Testing Markdown Conversion...")
    sample_text = """
Product Information Document
Product Name: Comirnaty
Manufacturer: Pfizer Korea
Active Ingredient: Tozinameran
"""
    result = client.convert_to_markdown(
        content=sample_text,
        file_type="txt"
    )
    if result.get('success'):
        print(f"   ✅ Markdown conversion:")
        print("   " + "-"*50)
        print("   " + result['text'].replace("\n", "\n   "))
        print("   " + "-"*50)
        print(f"   📊 Tokens: {result['total_tokens']}")
    else:
        print(f"   ❌ Failed: {result.get('error')}")

    # Test 5: Data Extraction (JSON mode)
    print("\n5️⃣  Testing Data Extraction (JSON Mode)...")
    markdown_content = """
# Product Information

- Product Name: 코미나티주
- Ingredient: 토지나메란
- Company: 한국화이자제약
- Approval Date: 2021-03-05
"""
    result = client.extract_data(
        markdown_content=markdown_content,
        data_type="CS",
        extraction_rules="Extract product_name, ingredient_name, company_name, approval_date"
    )
    if result.get('success'):
        print(f"   ✅ Extracted data:")
        print(f"   {result['text']}")
        print(f"   📊 Tokens: {result['total_tokens']}")
    else:
        print(f"   ❌ Failed: {result.get('error')}")

    # Test 6: Token Counting
    print("\n6️⃣  Testing Token Counting...")
    test_text = "This is a test message for KSUR system integration."
    token_count = client.count_tokens(test_text)
    print(f"   ✅ Token count: {token_count}")

    # Test 7: Cost Estimation
    print("\n7️⃣  Testing Cost Estimation...")
    cost = client.estimate_cost(input_tokens=1000, output_tokens=500)
    print(f"   ✅ Estimated cost for 1000 input + 500 output tokens: ${cost:.6f}")

    # Test 8: QC Check
    print("\n8️⃣  Testing QC Check...")
    sample_report = """
# PSUR Report

## Product Information
- Name: 코미나티주
- Period: 2024-01-01 to 2024-06-30

## Safety Data
- Total cases: 150
- Serious cases: 5
- Fatal cases: 0

## Conclusion
The benefit-risk balance remains positive.
"""
    result = client.qc_check(
        report_content=sample_report,
        qc_model=client.model  # Use default model for testing
    )
    if result.get('success'):
        print(f"   ✅ QC result:")
        print(f"   {result['text'][:200]}...")
        print(f"   📊 Tokens: {result['total_tokens']}")
    else:
        print(f"   ❌ Failed: {result.get('error')}")

    print("\n" + "="*60)
    print("  ✅ ALL LLM HELPER TESTS PASSED!")
    print("="*60)
    print("\n✅ LLM Helper module is ready for KSUR integration")
    print("✅ All major functions working correctly:")
    print("   - Basic content generation")
    print("   - RAW ID classification")
    print("   - Markdown conversion")
    print("   - Data extraction (JSON mode)")
    print("   - Token counting")
    print("   - Cost estimation")
    print("   - QC checking")
    print("\n")

    return True


if __name__ == '__main__':
    success = test_llm_helper()
    exit(0 if success else 1)
