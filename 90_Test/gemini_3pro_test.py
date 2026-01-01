#!/usr/bin/env python3
"""
Gemini 3 Pro Preview - 전체 PSUR 보고서 생성 테스트
"""

import os
import json
import time
from datetime import datetime
from pathlib import Path
import requests

BASE_PATH = Path(__file__).parent
PROJECT_ROOT = BASE_PATH.parent

def load_env():
    env_path = PROJECT_ROOT / ".env"
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    value = value.strip('"').strip("'")
                    os.environ[key] = value
    return os.environ.get("GOOGLE_API_KEY")

API_KEY = load_env()
API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"

MODEL = "gemini-3-pro-preview"
MODEL_PRICING = {"input": 1.25, "output": 5.00}  # USD per 1M tokens

def read_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def read_all_templates():
    template_dir = BASE_PATH / "02_Templates"
    templates = {}
    for f in sorted(template_dir.glob("*.md")):
        templates[f.stem] = read_file(f)
    return templates

def call_gemini_api(prompt, max_output_tokens=65536):
    if not API_KEY:
        return {"success": False, "error": "API 키 없음"}

    url = f"{API_ENDPOINT}/{MODEL}:generateContent?key={API_KEY}"

    request_body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": max_output_tokens
        }
    }

    start_time = time.time()

    try:
        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json=request_body,
            timeout=900
        )

        duration = time.time() - start_time

        if response.status_code != 200:
            error_data = response.json()
            return {
                "success": False,
                "error": f"HTTP {response.status_code}: {error_data.get('error', {}).get('message', 'Unknown')}",
                "duration": duration
            }

        data = response.json()
        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        usage = data.get("usageMetadata", {})

        return {
            "success": True,
            "text": text,
            "input_tokens": usage.get("promptTokenCount", 0),
            "output_tokens": usage.get("candidatesTokenCount", 0),
            "duration": duration
        }

    except requests.exceptions.Timeout:
        return {"success": False, "error": "Timeout (15분 초과)", "duration": 900}
    except Exception as e:
        return {"success": False, "error": str(e), "duration": time.time() - start_time}

def calculate_cost(input_tokens, output_tokens):
    return (input_tokens / 1_000_000) * MODEL_PRICING["input"] + (output_tokens / 1_000_000) * MODEL_PRICING["output"]

def main():
    print("=" * 80)
    print(f"Gemini {MODEL} - 전체 PSUR 보고서 생성")
    print("=" * 80)
    print(f"시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"API Key: {'설정됨' if API_KEY else '없음'}")
    print()

    # 파일 읽기
    print("파일 읽는 중...")
    context_content = read_file(BASE_PATH / "01_Context" / "PSUR_Generation_Context.md")
    rawdata_content = read_file(BASE_PATH / "01_Context" / "RawData_Definition.md")
    templates = read_all_templates()
    templates_content = "\n\n---\n\n".join([f"### 템플릿: {name}\n\n{content}" for name, content in templates.items()])
    raw_data_content = read_file(BASE_PATH / "04_MainDocuement" / "total_MD.md")
    user_input_content = read_file(BASE_PATH / "04_MainDocuement" / "test_UserInput.md")

    print(f"  - Context: {len(context_content):,} 문자")
    print(f"  - RawData Definition: {len(rawdata_content):,} 문자")
    print(f"  - Templates ({len(templates)}개): {len(templates_content):,} 문자")
    print(f"  - RAW Data: {len(raw_data_content):,} 문자")
    print(f"  - User Input: {len(user_input_content):,} 문자")

    # 프롬프트 생성
    prompt = f"""# PSUR 보고서 생성 지시

{context_content}

---

## 데이터 정의서 (변수 추출 규칙)

{rawdata_content}

---

## 15개 섹션 템플릿

{templates_content}

---

## RAW 데이터 (원천 데이터)

{raw_data_content}

---

## 사용자 입력 데이터

{user_input_content}

---

# 작업 지시

위의 모든 자료를 활용하여 **완전한 PSUR 보고서**를 작성하세요.

## 작성 규칙:
1. **15개 섹션 전체**를 순서대로 작성 (00_표지 ~ 14_별첨)
2. 모든 변수 `[CS숫자]`, `[PH숫자]`, `[표숫자]`를 **실제 값으로 치환**
3. RAW 데이터에서 `#[Filename:]` 마커를 기준으로 데이터 추출
4. 데이터 정의서의 추출 방법과 지침을 정확히 준수
5. 사용자입력 데이터 우선 적용
6. 계산값 자동 도출 (예: CS3 = CS4 - 5년)
7. 식약처 가이드라인 형식 준수
8. 마크다운 형식으로 출력

## 출력 형식:
```markdown
# 유효기간 동안 수집된 안전관리에 관한 자료
# 글리빅사정(메만틴염산염)

[00. 표지]
...

[01. 목차]
...

... (15개 섹션 전체) ...

[14. 별첨]
...
```

지금 바로 전체 PSUR 보고서를 작성해주세요.
"""

    print(f"\n총 프롬프트: {len(prompt):,} 문자")
    print(f"\n{'='*60}")
    print(f"모델: {MODEL}")
    print(f"{'='*60}")
    print("요청 중... (최대 15분 대기)")

    result = call_gemini_api(prompt)

    output_dir = BASE_PATH / "05_Output" / "full_report"
    output_dir.mkdir(parents=True, exist_ok=True)

    if result["success"]:
        input_tokens = result["input_tokens"]
        output_tokens = result["output_tokens"]
        duration = result["duration"]
        cost = calculate_cost(input_tokens, output_tokens)

        print(f"\n✅ 성공!")
        print(f"   소요 시간: {duration:.2f}초 ({duration/60:.1f}분)")
        print(f"   입력 토큰: {input_tokens:,}")
        print(f"   출력 토큰: {output_tokens:,}")
        print(f"   총 토큰: {input_tokens + output_tokens:,}")
        print(f"   예상 비용: ${cost:.4f}")

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        response_file = output_dir / f"{MODEL}_full_report_{timestamp}.md"
        with open(response_file, 'w', encoding='utf-8') as f:
            f.write(f"# {MODEL} - 전체 PSUR 보고서\n\n")
            f.write(f"- 생성 시간: {datetime.now().isoformat()}\n")
            f.write(f"- 소요 시간: {duration:.2f}초 ({duration/60:.1f}분)\n")
            f.write(f"- 입력 토큰: {input_tokens:,}\n")
            f.write(f"- 출력 토큰: {output_tokens:,}\n")
            f.write(f"- 비용: ${cost:.4f}\n\n")
            f.write("---\n\n")
            f.write(result["text"])

        print(f"   저장: {response_file}")

        # JSON 요약
        summary = {
            "model": MODEL,
            "timestamp": datetime.now().isoformat(),
            "success": True,
            "duration_seconds": round(duration, 2),
            "duration_minutes": round(duration / 60, 2),
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": input_tokens + output_tokens,
            "cost_usd": round(cost, 4),
            "response_file": str(response_file.name),
            "response_length": len(result["text"])
        }
    else:
        print(f"\n❌ 실패: {result['error']}")
        summary = {
            "model": MODEL,
            "timestamp": datetime.now().isoformat(),
            "success": False,
            "error": result["error"],
            "duration_seconds": result.get("duration", 0)
        }

    summary_file = output_dir / f"{MODEL}_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"\n완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
