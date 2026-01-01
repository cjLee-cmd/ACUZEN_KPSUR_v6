#!/usr/bin/env python3
"""
PSUR Report Generator - Multi-LLM Support
- Claude (Opus, Sonnet, Haiku)
- Gemini (2.5-pro, 3-flash)
- Single-shot full report generation
"""

import os
import json
import time
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
import requests

# ============================================================================
# Configuration
# ============================================================================

BASE_PATH = Path(__file__).parent
PROJECT_ROOT = BASE_PATH.parent

# Model configurations with pricing (USD per 1M tokens)
MODELS = {
    # Claude models
    "claude-opus": {
        "id": "claude-opus-4-20250514",
        "provider": "anthropic",
        "input_price": 15.0,
        "output_price": 75.0,
        "context_window": 200000,
        "max_output": 16000
    },
    "claude-sonnet": {
        "id": "claude-sonnet-4-20250514",
        "provider": "anthropic",
        "input_price": 3.0,
        "output_price": 15.0,
        "context_window": 200000,
        "max_output": 16000
    },
    "claude-haiku": {
        "id": "claude-3-5-haiku-20241022",
        "provider": "anthropic",
        "input_price": 0.80,
        "output_price": 4.0,
        "context_window": 200000,
        "max_output": 8192
    },
    # Gemini models
    "gemini-pro": {
        "id": "gemini-2.5-pro",
        "provider": "google",
        "input_price": 1.25,
        "output_price": 5.0,
        "context_window": 1000000,
        "max_output": 65536
    },
    "gemini-flash": {
        "id": "gemini-2.5-flash",
        "provider": "google",
        "input_price": 0.15,
        "output_price": 0.60,
        "context_window": 1000000,
        "max_output": 65536
    }
}

# ============================================================================
# Environment & Utilities
# ============================================================================

def load_env() -> Dict[str, str]:
    """Load .env file and return API keys"""
    env_path = PROJECT_ROOT / ".env"
    keys = {}

    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    value = value.strip('"').strip("'")
                    os.environ[key] = value

    keys["anthropic"] = os.environ.get("ANTHROPIC_API_KEY", "")
    keys["google"] = os.environ.get("GOOGLE_API_KEY", "")

    return keys


def read_file(filepath: Path) -> str:
    """Read file content"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()


def estimate_tokens(text: str) -> int:
    """Rough token estimation (1 token ≈ 4 characters for English, 2 for Korean)"""
    # Korean-heavy text: estimate 1 token per 2 characters
    return len(text) // 2


def calculate_cost(model_key: str, input_tokens: int, output_tokens: int) -> float:
    """Calculate cost in USD"""
    model = MODELS.get(model_key, {})
    input_cost = (input_tokens / 1_000_000) * model.get("input_price", 0)
    output_cost = (output_tokens / 1_000_000) * model.get("output_price", 0)
    return input_cost + output_cost


# ============================================================================
# API Callers
# ============================================================================

def call_claude_api(
    api_key: str,
    model_id: str,
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 16000,
    temperature: float = 0.3
) -> Dict[str, Any]:
    """Call Anthropic Claude API"""

    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }

    request_body = {
        "model": model_id,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "system": system_prompt,
        "messages": [
            {"role": "user", "content": user_prompt}
        ]
    }

    start_time = time.time()

    try:
        response = requests.post(
            url,
            headers=headers,
            json=request_body,
            timeout=600  # 10 minutes
        )

        duration = time.time() - start_time

        if response.status_code != 200:
            error_msg = response.json().get("error", {}).get("message", response.text)
            return {
                "success": False,
                "error": f"HTTP {response.status_code}: {error_msg}",
                "duration": duration
            }

        data = response.json()
        text = data.get("content", [{}])[0].get("text", "")
        usage = data.get("usage", {})

        return {
            "success": True,
            "text": text,
            "input_tokens": usage.get("input_tokens", 0),
            "output_tokens": usage.get("output_tokens", 0),
            "duration": duration,
            "stop_reason": data.get("stop_reason", "")
        }

    except requests.exceptions.Timeout:
        return {"success": False, "error": "Timeout (10분 초과)", "duration": 600}
    except Exception as e:
        return {"success": False, "error": str(e), "duration": time.time() - start_time}


def call_gemini_api(
    api_key: str,
    model_id: str,
    prompt: str,
    max_tokens: int = 65536,
    temperature: float = 0.3
) -> Dict[str, Any]:
    """Call Google Gemini API"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={api_key}"

    request_body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": temperature,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": max_tokens
        }
    }

    start_time = time.time()

    try:
        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json=request_body,
            timeout=600
        )

        duration = time.time() - start_time

        if response.status_code != 200:
            error_data = response.json()
            error_msg = error_data.get("error", {}).get("message", "Unknown error")
            return {
                "success": False,
                "error": f"HTTP {response.status_code}: {error_msg}",
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
            "duration": duration,
            "stop_reason": data.get("candidates", [{}])[0].get("finishReason", "")
        }

    except requests.exceptions.Timeout:
        return {"success": False, "error": "Timeout (10분 초과)", "duration": 600}
    except Exception as e:
        return {"success": False, "error": str(e), "duration": time.time() - start_time}


# ============================================================================
# PSUR Generation
# ============================================================================

def build_psur_prompt(include_raw_data: bool = True) -> tuple[str, str]:
    """Build system and user prompts for PSUR generation"""

    # Read context files
    context_file = BASE_PATH / "01_Context" / "PSUR_Generation_Context.md"
    definition_file = BASE_PATH / "01_Context" / "RawData_Definition.md"
    user_input_file = BASE_PATH / "04_MainDocuement" / "test_UserInput.md"
    raw_data_file = BASE_PATH / "04_MainDocuement" / "total_MD.md"

    context = read_file(context_file)
    definition = read_file(definition_file)
    user_input = read_file(user_input_file)

    # System prompt
    system_prompt = """당신은 제약사 약물감시팀 팀장입니다. 한국 식약처에 제출하는 PSUR(정기 안전성 갱신 보고서) 문서를 작성하는 전문가입니다.

주어진 컨텍스트, 데이터 정의서, RAW 데이터를 참고하여 완전한 PSUR 보고서를 생성합니다.

작성 규칙:
1. 모든 변수([CS숫자], [PH숫자], [표숫자])를 실제 값으로 정확히 치환
2. RAW 데이터에서 #[Filename:] 마커를 기준으로 데이터 추출
3. 식약처 가이드라인 형식 준수
4. 자연스럽고 전문적인 한국어 사용
5. MedDRA 27.0 버전 용어 사용
6. 모든 표는 마크다운 테이블 형식으로 작성
7. 목차는 앵커 링크 없이 일반 텍스트로 작성 (Notion 호환)"""

    # User prompt
    user_prompt = f"""# PSUR 보고서 작성 요청

## 작성 컨텍스트
{context}

---

## 데이터 정의서
{definition}

---

## 사용자 입력 데이터
{user_input}

---
"""

    if include_raw_data:
        raw_data = read_file(raw_data_file)
        user_prompt += f"""
## RAW 데이터 (total_MD.md)
{raw_data}

---
"""

    user_prompt += """
## 작업 지시

위의 모든 자료를 참고하여 **완전한 PSUR 보고서**를 생성해주세요.

출력 형식: 마크다운 (Notion 호환)
- 목차: 앵커 링크 없이 일반 텍스트
- 표의 <br> 태그 대신 세미콜론(;) 사용
- 15개 섹션 모두 포함 (표지 ~ 별첨)

지금 바로 전체 보고서를 작성해주세요."""

    return system_prompt, user_prompt


def generate_psur(
    model_key: str,
    api_keys: Dict[str, str],
    output_dir: Optional[Path] = None
) -> Dict[str, Any]:
    """Generate complete PSUR report using specified model"""

    if model_key not in MODELS:
        return {"success": False, "error": f"Unknown model: {model_key}"}

    model = MODELS[model_key]
    provider = model["provider"]

    # Check API key
    api_key = api_keys.get(provider, "")
    if not api_key or api_key == "your-api-key-here":
        return {"success": False, "error": f"{provider} API key not configured"}

    print(f"\n{'='*70}")
    print(f"모델: {model_key} ({model['id']})")
    print(f"{'='*70}")

    # Build prompts
    print("프롬프트 생성 중...")
    system_prompt, user_prompt = build_psur_prompt(include_raw_data=True)

    total_prompt_chars = len(system_prompt) + len(user_prompt)
    estimated_input_tokens = estimate_tokens(system_prompt + user_prompt)

    print(f"  - 시스템 프롬프트: {len(system_prompt):,} 문자")
    print(f"  - 유저 프롬프트: {len(user_prompt):,} 문자")
    print(f"  - 총 문자 수: {total_prompt_chars:,}")
    print(f"  - 예상 입력 토큰: ~{estimated_input_tokens:,}")

    # Estimate cost
    estimated_output_tokens = 15000  # PSUR report is typically ~15K tokens
    estimated_cost = calculate_cost(model_key, estimated_input_tokens, estimated_output_tokens)
    print(f"  - 예상 비용: ~${estimated_cost:.2f}")

    # Call API
    print(f"\nAPI 호출 중... (최대 10분 대기)")

    if provider == "anthropic":
        result = call_claude_api(
            api_key=api_key,
            model_id=model["id"],
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=model["max_output"],
            temperature=0.3
        )
    else:  # google
        combined_prompt = f"{system_prompt}\n\n{user_prompt}"
        result = call_gemini_api(
            api_key=api_key,
            model_id=model["id"],
            prompt=combined_prompt,
            max_tokens=model["max_output"],
            temperature=0.3
        )

    # Process result
    if result["success"]:
        input_tokens = result["input_tokens"]
        output_tokens = result["output_tokens"]
        duration = result["duration"]
        cost = calculate_cost(model_key, input_tokens, output_tokens)

        print(f"\n✅ 생성 완료!")
        print(f"   소요 시간: {duration:.1f}초 ({duration/60:.1f}분)")
        print(f"   입력 토큰: {input_tokens:,}")
        print(f"   출력 토큰: {output_tokens:,}")
        print(f"   총 토큰: {input_tokens + output_tokens:,}")
        print(f"   실제 비용: ${cost:.4f}")

        # Save output
        if output_dir:
            output_dir.mkdir(parents=True, exist_ok=True)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

            # Save report
            report_file = output_dir / f"PSUR_{model_key}_{timestamp}.md"
            with open(report_file, 'w', encoding='utf-8') as f:
                f.write(result["text"])
            print(f"   보고서 저장: {report_file.name}")

            # Save metadata
            meta_file = output_dir / f"PSUR_{model_key}_{timestamp}_meta.json"
            with open(meta_file, 'w', encoding='utf-8') as f:
                json.dump({
                    "model": model_key,
                    "model_id": model["id"],
                    "timestamp": datetime.now().isoformat(),
                    "duration_seconds": round(duration, 2),
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "total_tokens": input_tokens + output_tokens,
                    "cost_usd": round(cost, 6),
                    "prompt_chars": total_prompt_chars,
                    "stop_reason": result.get("stop_reason", "")
                }, f, ensure_ascii=False, indent=2)
            print(f"   메타데이터 저장: {meta_file.name}")

        return {
            "success": True,
            "model": model_key,
            "text": result["text"],
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "duration": duration,
            "cost": cost
        }
    else:
        print(f"\n❌ 실패: {result['error']}")
        return {
            "success": False,
            "model": model_key,
            "error": result["error"],
            "duration": result.get("duration", 0)
        }


# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="PSUR Report Generator")
    parser.add_argument(
        "--model", "-m",
        choices=list(MODELS.keys()),
        default="claude-sonnet",
        help="Model to use (default: claude-sonnet)"
    )
    parser.add_argument(
        "--compare", "-c",
        action="store_true",
        help="Compare all models"
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        default="05_Output/api_generated",
        help="Output directory (default: 05_Output/api_generated)"
    )
    args = parser.parse_args()

    print("=" * 70)
    print("PSUR 보고서 생성기 (Multi-LLM)")
    print("=" * 70)
    print(f"시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Load API keys
    api_keys = load_env()
    print(f"\nAPI Keys:")
    print(f"  - Anthropic: {'설정됨' if api_keys['anthropic'] and api_keys['anthropic'] != 'your-api-key-here' else '미설정'}")
    print(f"  - Google: {'설정됨' if api_keys['google'] else '미설정'}")

    output_dir = BASE_PATH / args.output

    if args.compare:
        # Compare all models
        print("\n모든 모델 비교 테스트")
        results = []

        for model_key in MODELS.keys():
            result = generate_psur(model_key, api_keys, output_dir)
            results.append(result)

        # Summary
        print(f"\n\n{'='*70}")
        print("결과 요약")
        print(f"{'='*70}")
        print(f"{'모델':<20} {'상태':<6} {'시간(초)':<10} {'입력토큰':<12} {'출력토큰':<12} {'비용($)':<10}")
        print("-" * 70)

        for r in results:
            if r["success"]:
                print(f"{r['model']:<20} {'성공':<6} {r['duration']:<10.1f} {r['input_tokens']:<12,} {r['output_tokens']:<12,} {r['cost']:<10.4f}")
            else:
                print(f"{r['model']:<20} {'실패':<6} {r.get('duration', 0):<10.1f} {'N/A':<12} {'N/A':<12} {'N/A':<10}")

        # Save comparison summary
        summary_file = output_dir / f"comparison_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "results": [
                    {k: v for k, v in r.items() if k != "text"}
                    for r in results
                ]
            }, f, ensure_ascii=False, indent=2)
        print(f"\n비교 결과 저장: {summary_file}")

    else:
        # Single model
        result = generate_psur(args.model, api_keys, output_dir)

        if not result["success"]:
            print(f"\n생성 실패. .env 파일에서 API 키를 확인해주세요.")

    print(f"\n완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    main()
