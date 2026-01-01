#!/usr/bin/env python3
"""
PSUR 보고서 생성 - Google Gemini API 호출 스크립트
모델: gemini-3-flash-preview
"""

import os
import json
import requests
from pathlib import Path
from datetime import datetime

# 기본 경로 설정
BASE_DIR = Path(__file__).parent
CONTEXT_DIR = BASE_DIR / "01_Context"
OUTPUT_DIR = BASE_DIR / "05_Output"

# API 설정
API_KEY = "AIzaSyDPuqdY4s2tQ9qwyGSiLs6V0Xo2k_7xPF4"
MODEL = "models/gemini-3-flash-preview"  # 사용자 지정 모델

def read_file(filepath: Path) -> str:
    """파일 읽기"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def call_gemini_api(prompt: str, max_output_tokens: int = 8192) -> dict:
    """Gemini API 호출"""
    url = f"https://generativelanguage.googleapis.com/v1beta/{MODEL}:generateContent?key={API_KEY}"

    headers = {
        "Content-Type": "application/json"
    }

    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": max_output_tokens,
        }
    }

    print(f"\n[API 호출] 모델: {MODEL}, max_output_tokens: {max_output_tokens}")

    response = requests.post(url, headers=headers, json=payload, timeout=300)

    if response.status_code == 200:
        return response.json()
    else:
        error_info = response.json() if response.text else {"error": response.text}
        print(f"[오류] Status: {response.status_code}")
        print(f"[오류 상세] {json.dumps(error_info, indent=2, ensure_ascii=False)}")
        return {"error": error_info, "status_code": response.status_code}

def extract_text_from_response(response: dict) -> str:
    """응답에서 텍스트 추출"""
    try:
        candidates = response.get("candidates", [])
        if candidates:
            content = candidates[0].get("content", {})
            parts = content.get("parts", [])
            if parts:
                return parts[0].get("text", "")
    except Exception as e:
        print(f"[오류] 응답 파싱 실패: {e}")
    return ""

def run_psur_generation():
    """PSUR 생성 실행"""
    print("=" * 60)
    print("PSUR 보고서 생성 - Gemini API")
    print("=" * 60)

    # 1. 컨텍스트 파일 읽기
    context_file = CONTEXT_DIR / "PSUR_Generation_Context.md"
    rawdata_file = CONTEXT_DIR / "RawData_Definition.md"

    print(f"\n[1단계] 컨텍스트 파일 로딩...")
    context = read_file(context_file)
    print(f"  - PSUR_Generation_Context.md: {len(context)} 자")

    print(f"\n[2단계] RawData 정의서 로딩...")
    rawdata = read_file(rawdata_file)
    print(f"  - RawData_Definition.md: {len(rawdata)} 자")

    # 2. 프롬프트 구성
    prompt = f"""# PSUR 보고서 생성 요청

## 컨텍스트 (역할 및 지침)
{context}

## 사용자 입력 데이터 (RawData 정의서)
{rawdata}

---

## 실행 지시

위 컨텍스트와 데이터 정의서를 참조하여 다음 작업을 수행하세요:

1. **Phase 1 (데이터 준비)**: RawData 정의서에서 모든 변수 구조를 파악하세요.

2. **Phase 2 (1차 작성)**: 00_표지 섹션을 먼저 작성하세요.
   - 변수 치환 규칙을 정확히 적용
   - 형식은 마크다운으로 출력

3. 출력 형식:
```markdown
## 0. 표지

[완성된 표지 내용]

---
```

지금 00_표지 섹션을 작성해 주세요.
"""

    print(f"\n[3단계] 프롬프트 구성 완료")
    print(f"  - 총 프롬프트 길이: {len(prompt)} 자")

    # 3. API 호출 (토큰 제한 에러 시 증가)
    max_tokens_list = [8192, 16384, 32768, 65536, 131072]

    for max_tokens in max_tokens_list:
        print(f"\n[4단계] Gemini API 호출 (max_output_tokens: {max_tokens})...")

        response = call_gemini_api(prompt, max_tokens)

        # 에러 체크
        if "error" in response:
            error_msg = str(response.get("error", ""))
            if "token" in error_msg.lower() or "limit" in error_msg.lower():
                print(f"  - 토큰 제한 에러 발생, 다음 크기로 재시도...")
                continue
            else:
                print(f"  - API 오류: {error_msg}")
                break

        # 성공
        result_text = extract_text_from_response(response)
        if result_text:
            print(f"\n[5단계] 응답 수신 완료!")
            print(f"  - 응답 길이: {len(result_text)} 자")

            # 결과 저장
            OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
            output_file = OUTPUT_DIR / f"gemini_result_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"

            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(f"# Gemini API 응답 결과\n\n")
                f.write(f"**모델:** {MODEL}\n")
                f.write(f"**생성 시간:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write("---\n\n")
                f.write(result_text)

            print(f"  - 저장 완료: {output_file}")

            # 결과 미리보기 출력
            print("\n" + "=" * 60)
            print("응답 결과 (처음 2000자):")
            print("=" * 60)
            print(result_text[:2000])
            if len(result_text) > 2000:
                print(f"\n... (이하 {len(result_text) - 2000}자 생략)")

            return result_text
        else:
            print("  - 빈 응답 수신")
            break

    print("\n[실패] PSUR 생성에 실패했습니다.")
    return None

if __name__ == "__main__":
    run_psur_generation()
