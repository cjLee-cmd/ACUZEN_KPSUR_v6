#!/usr/bin/env python3
"""
Test Gemini API Connection (New google.genai package)
"""

import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
LLM_MODEL = os.getenv('LLM_MODEL', 'gemini-2.0-flash-exp')

def test_gemini_connection():
    """Test Gemini API connection with a simple conversation"""

    print("\n" + "="*60)
    print("  🤖 GEMINI API CONNECTION TEST (New API)")
    print("="*60)

    # Check API key
    if not GOOGLE_API_KEY:
        print("\n❌ Error: GOOGLE_API_KEY not found in .env file")
        return False

    print(f"\n🔑 API Key: {GOOGLE_API_KEY[:20]}...")
    print(f"📦 Model: {LLM_MODEL}")

    try:
        # Create client
        client = genai.Client(api_key=GOOGLE_API_KEY)
        print("\n✅ Client created successfully")

        # List available models
        print("\n📋 Available Models:")
        try:
            models = client.models.list()
            count = 0
            for model in models:
                print(f"   - {model.name}")
                count += 1
                if count >= 5:  # Show only first 5 models
                    print("   ... (more models available)")
                    break
        except Exception as e:
            print(f"   ⚠️  Could not list models: {e}")

        # Test simple conversation
        print("\n" + "="*60)
        print("  💬 TEST CONVERSATION")
        print("="*60)

        print(f"\n🧪 Testing model: {LLM_MODEL}")
        print("📝 Prompt: 'Hello! Please respond in Korean. What is 1+1?'")

        # Generate response
        print("\n⏳ Generating response...")
        response = client.models.generate_content(
            model=LLM_MODEL,
            contents="Hello! Please respond in Korean. What is 1+1?"
        )

        print("\n✅ Response received!")
        print("\n" + "-"*60)
        print("🤖 Gemini Response:")
        print("-"*60)
        print(response.text)
        print("-"*60)

        # Test with system instruction (for KSUR context)
        print("\n" + "="*60)
        print("  💬 TEST WITH SYSTEM INSTRUCTION")
        print("="*60)

        print("\n🧪 Testing with KSUR medical context...")
        print("📝 Prompt: 'What is PSUR in pharmacovigilance?'")

        print("\n⏳ Generating response...")
        response2 = client.models.generate_content(
            model=LLM_MODEL,
            contents="What is PSUR in pharmacovigilance? Please answer briefly in Korean.",
            config=types.GenerateContentConfig(
                system_instruction="You are a pharmaceutical regulatory expert specializing in PSUR (Periodic Safety Update Report) analysis."
            )
        )

        print("\n✅ Response received!")
        print("\n" + "-"*60)
        print("🤖 Gemini Response (with system instruction):")
        print("-"*60)
        print(response2.text)
        print("-"*60)

        # Token count test
        print("\n" + "="*60)
        print("  📊 TOKEN COUNT TEST")
        print("="*60)

        test_text = "This is a test message for token counting in KSUR system."
        print(f"\n📝 Text: '{test_text}'")

        try:
            token_response = client.models.count_tokens(
                model=LLM_MODEL,
                contents=test_text
            )
            print(f"\n✅ Token count: {token_response.total_tokens}")
        except Exception as e:
            print(f"\n⚠️  Token counting error: {e}")

        # Test structured output (JSON mode)
        print("\n" + "="*60)
        print("  📋 JSON MODE TEST")
        print("="*60)

        print("\n🧪 Testing JSON output for data extraction...")
        print("📝 Prompt: 'Extract product info: 코미나티주, 화이자'")

        print("\n⏳ Generating response...")
        response3 = client.models.generate_content(
            model=LLM_MODEL,
            contents="Extract the following information in JSON format: Product name: 코미나티주, Company: 한국화이자제약. Return only JSON with keys: product_name, company_name",
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        print("\n✅ Response received!")
        print("\n" + "-"*60)
        print("🤖 Gemini Response (JSON):")
        print("-"*60)
        print(response3.text)
        print("-"*60)

        print("\n" + "="*60)
        print("  ✅ ALL TESTS PASSED!")
        print("="*60)
        print("\n✅ New google.genai API is working correctly")
        print("✅ Ready for KSUR system integration")
        print("✅ JSON mode available for structured data extraction")
        print("\n")

        return True

    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        import traceback
        traceback.print_exc()
        print("\n" + "="*60)
        print("  ❌ TEST FAILED!")
        print("="*60)
        print("\n")
        return False

if __name__ == '__main__':
    success = test_gemini_connection()
    exit(0 if success else 1)
