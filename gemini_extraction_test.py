#!/usr/bin/env python3
"""
Gemini Model Extraction Benchmark Script
- 여러 Gemini 모델에서 CS/PH/Table 데이터 추출 테스트
- 시간, 토큰, 비용 계산
"""

import os
import json
import time
from datetime import datetime
import requests
from pathlib import Path

def load_env_file():
    """Load API key from .env file"""
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    value = value.strip('"').strip("'")
                    os.environ[key] = value

# Load from .env file first
load_env_file()

# Google API 설정
API_KEY = os.environ.get("GOOGLE_API_KEY")
API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"

# 테스트할 모델 목록
MODELS = [
    "gemini-2.5-flash",
    "gemini-3-pro-preview",
    "gemini-3-flash-preview",
    "gemini-2.5-pro",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite"
]

# 모델별 가격 (USD per 1M tokens) - 2024년 12월 기준
MODEL_PRICING = {
    "gemini-2.5-flash": {"input": 0.075, "output": 0.30},
    "gemini-3-pro-preview": {"input": 1.25, "output": 5.00},
    "gemini-3-flash-preview": {"input": 0.10, "output": 0.40},
    "gemini-2.5-pro": {"input": 1.25, "output": 5.00},
    "gemini-flash-latest": {"input": 0.075, "output": 0.30},
    "gemini-2.5-flash-lite": {"input": 0.02, "output": 0.10},
    "gemini-2.0-flash-lite": {"input": 0.02, "output": 0.10}
}

def read_file(filepath):
    """파일 읽기"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def filter_user_input_fields(definition_content):
    """'사용자입력' Data Source 필드 제외"""
    lines = definition_content.split('\n')
    filtered_lines = []
    skip_section = False

    for i, line in enumerate(lines):
        # Data Source가 사용자입력인 섹션 감지
        if '**Data Source:**' in line and '사용자입력' in line:
            skip_section = True
        elif line.startswith('### ') and '.' in line:
            # 새 섹션 시작
            skip_section = False

        if not skip_section:
            filtered_lines.append(line)

    return '\n'.join(filtered_lines)

def call_gemini_api(model, prompt, max_output_tokens=8192):
    """Gemini API 호출"""
    if not API_KEY:
        return {
            "success": False,
            "error": "GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다."
        }

    url = f"{API_ENDPOINT}/{model}:generateContent?key={API_KEY}"

    request_body = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.1,
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
            timeout=300  # 5분 타임아웃
        )

        end_time = time.time()
        duration = end_time - start_time

        if response.status_code != 200:
            error_data = response.json()
            return {
                "success": False,
                "error": f"HTTP {response.status_code}: {error_data.get('error', {}).get('message', 'Unknown error')}",
                "duration": duration
            }

        data = response.json()

        # 응답 텍스트 추출
        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")

        # 토큰 사용량 추출
        usage = data.get("usageMetadata", {})
        input_tokens = usage.get("promptTokenCount", 0)
        output_tokens = usage.get("candidatesTokenCount", 0)

        return {
            "success": True,
            "text": text,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "duration": duration
        }

    except requests.exceptions.Timeout:
        return {
            "success": False,
            "error": "Request timeout (5분 초과)",
            "duration": 300
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "duration": time.time() - start_time
        }

def calculate_cost(model, input_tokens, output_tokens):
    """API 비용 계산"""
    pricing = MODEL_PRICING.get(model, {"input": 0.075, "output": 0.30})
    input_cost = (input_tokens / 1_000_000) * pricing["input"]
    output_cost = (output_tokens / 1_000_000) * pricing["output"]
    return input_cost + output_cost

def build_extraction_prompt(source_content, cs_definition, ph_definition, table_definition):
    """추출 프롬프트 생성"""
    prompt = f"""당신은 제약 문서 데이터 추출 전문가입니다.

아래 마크다운 문서에서 요청된 CS/PH/Table 데이터를 추출하세요.

## 소스 문서
{source_content[:50000]}

## 추출할 CS 데이터 정의
{cs_definition}

## 추출할 PH 데이터 정의
{ph_definition}

## 추출할 Table 데이터 정의
{table_definition}

## 추출 규칙
1. **데이터가 없으면 생성하지 마세요** → "DATA_NOT_FOUND" 반환
2. **충돌하는 데이터는 임의로 선택하지 마세요** → 모든 버전을 나열
3. **추측하거나 추정하지 마세요** → 문서에 있는 그대로만 추출
4. **'사용자입력'이 필요한 필드는 제외**하세요

## 응답 형식
```json
{{
  "CS_DATA": {{
    "CS0_성분명": "추출된 값" 또는 "DATA_NOT_FOUND",
    "CS1_브랜드명": "추출된 값" 또는 "DATA_NOT_FOUND",
    ...
  }},
  "PH_DATA": {{
    "PH4_원시자료서술문": "추출된 값" 또는 "DATA_NOT_FOUND",
    ...
  }},
  "TABLE_DATA": {{
    "표2_연도별판매량": "추출된 값" 또는 "DATA_NOT_FOUND",
    ...
  }}
}}
```

## 추출 결과:"""

    return prompt

def main():
    """메인 실행"""
    print("=" * 80)
    print("Gemini 모델별 데이터 추출 벤치마크")
    print("=" * 80)
    print(f"시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # 파일 경로
    base_path = "/Users/cjlee/Documents/진행중/ACUZEN/02_KSUR_v6"
    source_file = f"{base_path}/data/markdown/total_MD.md"
    cs_def_file = f"{base_path}/Ref/01_CSData_Definition.md"
    ph_def_file = f"{base_path}/Ref/02_PHData_Definition.md"
    table_def_file = f"{base_path}/Ref/03_TableData_Definition.md"

    # 파일 읽기
    print("파일 읽는 중...")
    source_content = read_file(source_file)
    cs_definition = filter_user_input_fields(read_file(cs_def_file))
    ph_definition = read_file(ph_def_file)
    table_definition = read_file(table_def_file)

    print(f"  - 소스 파일: {len(source_content):,} 문자")
    print(f"  - CS 정의 (사용자입력 제외): {len(cs_definition):,} 문자")
    print(f"  - PH 정의: {len(ph_definition):,} 문자")
    print(f"  - Table 정의: {len(table_definition):,} 문자")
    print()

    # 프롬프트 생성
    prompt = build_extraction_prompt(source_content, cs_definition, ph_definition, table_definition)
    print(f"프롬프트 길이: {len(prompt):,} 문자")
    print()

    # 결과 저장용
    results = []

    # 각 모델별 테스트
    for model in MODELS:
        print(f"\n{'='*60}")
        print(f"모델: {model}")
        print(f"{'='*60}")

        result = call_gemini_api(model, prompt)

        if result["success"]:
            input_tokens = result["input_tokens"]
            output_tokens = result["output_tokens"]
            duration = result["duration"]
            cost = calculate_cost(model, input_tokens, output_tokens)

            print(f"  상태: 성공")
            print(f"  소요 시간: {duration:.2f}초")
            print(f"  입력 토큰: {input_tokens:,}")
            print(f"  출력 토큰: {output_tokens:,}")
            print(f"  총 토큰: {input_tokens + output_tokens:,}")
            print(f"  예상 비용: ${cost:.6f}")

            results.append({
                "model": model,
                "success": True,
                "duration_seconds": round(duration, 2),
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": input_tokens + output_tokens,
                "cost_usd": round(cost, 6),
                "response": result["text"][:5000] + "..." if len(result["text"]) > 5000 else result["text"]
            })
        else:
            print(f"  상태: 실패")
            print(f"  오류: {result['error']}")

            results.append({
                "model": model,
                "success": False,
                "error": result["error"],
                "duration_seconds": result.get("duration", 0)
            })

    # 결과 저장
    output_file = f"{base_path}/extraction_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "models_tested": MODELS,
            "results": results
        }, f, ensure_ascii=False, indent=2)

    print(f"\n\n{'='*80}")
    print("결과 요약")
    print(f"{'='*80}")
    print(f"{'모델':<30} {'상태':<8} {'시간(초)':<10} {'입력토큰':<12} {'출력토큰':<12} {'비용($)':<10}")
    print("-" * 80)

    for r in results:
        if r["success"]:
            print(f"{r['model']:<30} {'성공':<8} {r['duration_seconds']:<10.2f} {r['input_tokens']:<12,} {r['output_tokens']:<12,} {r['cost_usd']:<10.6f}")
        else:
            print(f"{r['model']:<30} {'실패':<8} {r['duration_seconds']:<10.2f} {'N/A':<12} {'N/A':<12} {'N/A':<10}")

    print(f"\n결과 저장: {output_file}")
    print(f"완료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
