#!/usr/bin/env python3
"""
Test Gemini API Connection
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
LLM_MODEL = os.getenv('LLM_MODEL', 'gemini-2.0-flash-exp')

def test_gemini_connection():
    """Test Gemini API connection with a simple conversation"""

    print("\n" + "="*60)
    print("  🤖 GEMINI API CONNECTION TEST")
    print("="*60)

    # Check API key
    if not GOOGLE_API_KEY:
        print("\n❌ Error: GOOGLE_API_KEY not found in .env file")
        return False

    print(f"\n🔑 API Key: {GOOGLE_API_KEY[:20]}...")
    print(f"📦 Model: {LLM_MODEL}")

    try:
        # Configure API
        genai.configure(api_key=GOOGLE_API_KEY)
        print("\n✅ API configured successfully")

        # List available models
        print("\n📋 Available Models:")
        try:
            models = genai.list_models()
            count = 0
            for model in models:
                if 'generateContent' in model.supported_generation_methods:
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

        # Create model instance
        model = genai.GenerativeModel(LLM_MODEL)

        # Generate response
        print("\n⏳ Generating response...")
        response = model.generate_content("Hello! Please respond in Korean. What is 1+1?")

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

        model_with_instruction = genai.GenerativeModel(
            LLM_MODEL,
            system_instruction="You are a pharmaceutical regulatory expert specializing in PSUR (Periodic Safety Update Report) analysis."
        )

        print("\n⏳ Generating response...")
        response2 = model_with_instruction.generate_content(
            "What is PSUR in pharmacovigilance? Please answer briefly in Korean."
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
            token_count = model.count_tokens(test_text)
            print(f"\n✅ Token count: {token_count.total_tokens}")
        except Exception as e:
            print(f"\n⚠️  Token counting not available: {e}")

        print("\n" + "="*60)
        print("  ✅ ALL TESTS PASSED!")
        print("="*60)
        print("\n✅ Gemini API is working correctly")
        print("✅ Ready for KSUR system integration")
        print("\n")

        return True

    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        print("\n" + "="*60)
        print("  ❌ TEST FAILED!")
        print("="*60)
        print("\n")
        return False

if __name__ == '__main__':
    success = test_gemini_connection()
    exit(0 if success else 1)
