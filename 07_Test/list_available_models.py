#!/usr/bin/env python3
"""
List All Available Gemini Models
"""

import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

def list_models():
    """List all available models"""

    print("\n" + "="*60)
    print("  📋 사용 가능한 Gemini 모델 목록")
    print("="*60)

    client = genai.Client(api_key=GOOGLE_API_KEY)

    print("\n🔍 모델 조회 중...\n")

    models = client.models.list()

    thinking_models = []
    generation_models = []
    embedding_models = []
    other_models = []

    for model in models:
        if 'thinking' in model.name.lower():
            thinking_models.append(model.name)
        elif 'embedding' in model.name.lower():
            embedding_models.append(model.name)
        elif 'gemini' in model.name.lower():
            generation_models.append(model.name)
        else:
            other_models.append(model.name)

    # Display Thinking Models
    print("🧠 Thinking 모델:")
    if thinking_models:
        for model in sorted(thinking_models):
            print(f"   ✅ {model}")
    else:
        print(f"   ❌ Thinking 모델 없음")

    # Display Generation Models
    print(f"\n💬 일반 생성 모델 (Gemini):")
    for model in sorted(generation_models):
        print(f"   ✅ {model}")

    # Display Embedding Models
    print(f"\n🔢 Embedding 모델:")
    for model in sorted(embedding_models):
        print(f"   ✅ {model}")

    # Display Other Models
    if other_models:
        print(f"\n📦 기타 모델:")
        for model in sorted(other_models):
            print(f"   ✅ {model}")

    print(f"\n📊 전체 모델 수: {len(list(models))}")
    print("="*60)
    print("\n")

if __name__ == '__main__':
    list_models()
