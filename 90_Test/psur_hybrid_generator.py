#!/usr/bin/env python3
"""
PSUR Hybrid Generator - Strategy C (2-Phase: Sonnet → Opus)
Phase 1: Sonnet generates full draft
Phase 2: Opus refines critical sections (종합평가, 결론)
"""

import os
import json
import time
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Tuple
import requests
import re

# ============================================================================
# Configuration
# ============================================================================

BASE_PATH = Path(__file__).parent
PROJECT_ROOT = BASE_PATH.parent

# Model configurations
MODELS = {
    "claude-opus": {
        "id": "claude-opus-4-20250514",
        "input_price": 15.0,
        "output_price": 75.0,
        "max_output": 16000
    },
    "claude-sonnet": {
        "id": "claude-sonnet-4-20250514",
        "input_price": 3.0,
        "output_price": 15.0,
        "max_output": 16000
    }
}

# ============================================================================
# Utilities
# ============================================================================

def load_env() -> str:
    """Load .env and return Anthropic API key"""
    env_path = PROJECT_ROOT / ".env"
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    value = value.strip('"').strip("'")
                    os.environ[key] = value
    return os.environ.get("ANTHROPIC_API_KEY", "")


def read_file(filepath: Path) -> str:
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()


def calculate_cost(model_key: str, input_tokens: int, output_tokens: int) -> float:
    model = MODELS.get(model_key, {})
    input_cost = (input_tokens / 1_000_000) * model.get("input_price", 0)
    output_cost = (output_tokens / 1_000_000) * model.get("output_price", 0)
    return input_cost + output_cost


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
        "messages": [{"role": "user", "content": user_prompt}]
    }

    start_time = time.time()

    try:
        response = requests.post(url, headers=headers, json=request_body, timeout=600)
        duration = time.time() - start_time

        if response.status_code != 200:
            error_msg = response.json().get("error", {}).get("message", response.text)
            return {"success": False, "error": f"HTTP {response.status_code}: {error_msg}", "duration": duration}

        data = response.json()
        text = data.get("content", [{}])[0].get("text", "")
        usage = data.get("usage", {})

        return {
            "success": True,
            "text": text,
            "input_tokens": usage.get("input_tokens", 0),
            "output_tokens": usage.get("output_tokens", 0),
            "duration": duration
        }

    except requests.exceptions.Timeout:
        return {"success": False, "error": "Timeout (10분 초과)", "duration": 600}
    except Exception as e:
        return {"success": False, "error": str(e), "duration": time.time() - start_time}


# ============================================================================
# PSUR Generation
# ============================================================================

def build_phase1_prompt() -> Tuple[str, str]:
    """Build prompts for Phase 1 (Sonnet - full draft)"""

    context = read_file(BASE_PATH / "01_Context" / "PSUR_Generation_Context.md")
    definition = read_file(BASE_PATH / "01_Context" / "RawData_Definition.md")
    user_input = read_file(BASE_PATH / "04_MainDocuement" / "test_UserInput.md")
    raw_data = read_file(BASE_PATH / "04_MainDocuement" / "total_MD.md")

    system_prompt = """당신은 제약사 약물감시팀 팀장입니다. 한국 식약처 PSUR 문서 작성 전문가입니다.

작성 규칙:
1. 모든 변수([CS숫자], [PH숫자], [표숫자])를 실제 값으로 치환
2. RAW 데이터에서 #[Filename:] 마커 기준으로 데이터 추출
3. 식약처 가이드라인 형식 준수
4. MedDRA 27.0 용어 사용
5. 마크다운 테이블 형식
6. 목차는 앵커 링크 없이 일반 텍스트 (Notion 호환)"""

    user_prompt = f"""# PSUR 보고서 전체 작성

## 컨텍스트
{context}

## 데이터 정의서
{definition}

## 사용자 입력
{user_input}

## RAW 데이터
{raw_data}

---

위 자료를 바탕으로 완전한 PSUR 보고서(15개 섹션 전체)를 마크다운으로 작성하세요."""

    return system_prompt, user_prompt


def build_phase2_prompt(draft: str) -> Tuple[str, str]:
    """Build prompts for Phase 2 (Opus - refine critical sections)"""

    system_prompt = """당신은 제약사 약물감시팀 수석 전문가입니다.
PSUR 보고서의 핵심 섹션(종합적인 안전성 평가, 결론)을 검토하고 개선합니다.

평가 기준:
1. 안전성 데이터의 종합적 분석 완성도
2. 유익성-위해성 균형 평가의 논리성
3. 규제기관 권고사항 반영 여부
4. 결론의 명확성과 근거 충분성
5. 전문적이고 객관적인 표현"""

    user_prompt = f"""# PSUR 보고서 핵심 섹션 개선 요청

아래는 Sonnet 모델이 작성한 PSUR 초안입니다.

---
{draft}
---

## 요청사항

**섹션 9 (종합적인 안전성 평가)**와 **섹션 10 (결론)**을 전문가 수준으로 개선해주세요.

개선 포인트:
1. 보고 기간 내 이상사례 데이터를 더 체계적으로 분석
2. 안전성 신호 평가 결과를 명확하게 서술
3. 유익성-위해성 균형 평가를 더 심층적으로
4. 결론의 권고사항을 구체적이고 실행가능하게
5. 규제기관 제출에 적합한 전문적 표현

## 출력 형식

개선된 두 섹션만 출력하세요:

```markdown
## 9. 종합적인 안전성 평가
(개선된 내용)

## 10. 결론
(개선된 내용)
```"""

    return system_prompt, user_prompt


def merge_results(draft: str, refined_sections: str) -> str:
    """Merge Sonnet draft with Opus refined sections"""

    # Find and replace sections 9 and 10 in the draft
    # Pattern to match section 9 (종합적인 안전성 평가)
    section9_pattern = r'(## 9\. 종합적인 안전성 평가.*?)(?=## 10\. 결론)'
    # Pattern to match section 10 (결론)
    section10_pattern = r'(## 10\. 결론.*?)(?=## 11\. 참고문헌|---\s*## 11)'

    # Extract refined sections
    refined_section9_match = re.search(r'(## 9\. 종합적인 안전성 평가.*?)(?=## 10\. 결론)', refined_sections, re.DOTALL)
    refined_section10_match = re.search(r'(## 10\. 결론.*?)(?=$|```)', refined_sections, re.DOTALL)

    result = draft

    if refined_section9_match:
        refined_9 = refined_section9_match.group(1).strip() + "\n\n"
        result = re.sub(section9_pattern, refined_9, result, flags=re.DOTALL)

    if refined_section10_match:
        refined_10 = refined_section10_match.group(1).strip() + "\n\n---\n"
        result = re.sub(section10_pattern, refined_10, result, flags=re.DOTALL)

    return result


def run_hybrid_generation(api_key: str, output_dir: Path) -> Dict[str, Any]:
    """Run 2-Phase hybrid generation"""

    total_cost = 0
    total_duration = 0
    total_input_tokens = 0
    total_output_tokens = 0

    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    # =========================================================================
    # Phase 1: Sonnet - Generate full draft
    # =========================================================================
    print("\n" + "=" * 70)
    print("Phase 1: Sonnet으로 전체 초안 생성")
    print("=" * 70)

    system1, user1 = build_phase1_prompt()
    print(f"프롬프트 크기: {len(system1 + user1):,} 문자")
    print("API 호출 중... (최대 10분 대기)")

    result1 = call_claude_api(
        api_key=api_key,
        model_id=MODELS["claude-sonnet"]["id"],
        system_prompt=system1,
        user_prompt=user1,
        max_tokens=MODELS["claude-sonnet"]["max_output"]
    )

    if not result1["success"]:
        return {"success": False, "error": f"Phase 1 실패: {result1['error']}"}

    phase1_cost = calculate_cost("claude-sonnet", result1["input_tokens"], result1["output_tokens"])
    total_cost += phase1_cost
    total_duration += result1["duration"]
    total_input_tokens += result1["input_tokens"]
    total_output_tokens += result1["output_tokens"]

    print(f"\n✅ Phase 1 완료!")
    print(f"   소요 시간: {result1['duration']:.1f}초")
    print(f"   입력 토큰: {result1['input_tokens']:,}")
    print(f"   출력 토큰: {result1['output_tokens']:,}")
    print(f"   비용: ${phase1_cost:.4f}")

    draft = result1["text"]

    # Save draft
    draft_file = output_dir / f"phase1_sonnet_draft_{timestamp}.md"
    with open(draft_file, 'w', encoding='utf-8') as f:
        f.write(draft)
    print(f"   초안 저장: {draft_file.name}")

    # =========================================================================
    # Phase 2: Opus - Refine critical sections
    # =========================================================================
    print("\n" + "=" * 70)
    print("Phase 2: Opus로 핵심 섹션 개선 (종합평가, 결론)")
    print("=" * 70)

    system2, user2 = build_phase2_prompt(draft)
    print(f"프롬프트 크기: {len(system2 + user2):,} 문자")
    print("API 호출 중... (최대 10분 대기)")

    result2 = call_claude_api(
        api_key=api_key,
        model_id=MODELS["claude-opus"]["id"],
        system_prompt=system2,
        user_prompt=user2,
        max_tokens=8000  # 두 섹션만 개선하므로 작게
    )

    if not result2["success"]:
        return {"success": False, "error": f"Phase 2 실패: {result2['error']}"}

    phase2_cost = calculate_cost("claude-opus", result2["input_tokens"], result2["output_tokens"])
    total_cost += phase2_cost
    total_duration += result2["duration"]
    total_input_tokens += result2["input_tokens"]
    total_output_tokens += result2["output_tokens"]

    print(f"\n✅ Phase 2 완료!")
    print(f"   소요 시간: {result2['duration']:.1f}초")
    print(f"   입력 토큰: {result2['input_tokens']:,}")
    print(f"   출력 토큰: {result2['output_tokens']:,}")
    print(f"   비용: ${phase2_cost:.4f}")

    refined_sections = result2["text"]

    # Save refined sections
    refined_file = output_dir / f"phase2_opus_refined_{timestamp}.md"
    with open(refined_file, 'w', encoding='utf-8') as f:
        f.write(refined_sections)
    print(f"   개선 섹션 저장: {refined_file.name}")

    # =========================================================================
    # Merge results
    # =========================================================================
    print("\n" + "=" * 70)
    print("결과 병합")
    print("=" * 70)

    final_report = merge_results(draft, refined_sections)

    # Save final report
    final_file = output_dir / f"PSUR_Hybrid_{timestamp}.md"
    with open(final_file, 'w', encoding='utf-8') as f:
        f.write(final_report)
    print(f"최종 보고서 저장: {final_file.name}")

    # Save metadata
    meta = {
        "strategy": "C (2-Phase: Sonnet → Opus)",
        "timestamp": datetime.now().isoformat(),
        "phase1": {
            "model": "claude-sonnet",
            "input_tokens": result1["input_tokens"],
            "output_tokens": result1["output_tokens"],
            "duration": round(result1["duration"], 2),
            "cost": round(phase1_cost, 6)
        },
        "phase2": {
            "model": "claude-opus",
            "input_tokens": result2["input_tokens"],
            "output_tokens": result2["output_tokens"],
            "duration": round(result2["duration"], 2),
            "cost": round(phase2_cost, 6)
        },
        "total": {
            "input_tokens": total_input_tokens,
            "output_tokens": total_output_tokens,
            "duration": round(total_duration, 2),
            "cost": round(total_cost, 6)
        }
    }

    meta_file = output_dir / f"PSUR_Hybrid_{timestamp}_meta.json"
    with open(meta_file, 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    # =========================================================================
    # Summary
    # =========================================================================
    print("\n" + "=" * 70)
    print("전략 C (2-Phase) 완료 요약")
    print("=" * 70)
    print(f"\n{'Phase':<12} {'모델':<15} {'입력토큰':<12} {'출력토큰':<12} {'시간(초)':<10} {'비용($)':<10}")
    print("-" * 70)
    print(f"{'Phase 1':<12} {'Sonnet':<15} {result1['input_tokens']:<12,} {result1['output_tokens']:<12,} {result1['duration']:<10.1f} {phase1_cost:<10.4f}")
    print(f"{'Phase 2':<12} {'Opus':<15} {result2['input_tokens']:<12,} {result2['output_tokens']:<12,} {result2['duration']:<10.1f} {phase2_cost:<10.4f}")
    print("-" * 70)
    print(f"{'합계':<12} {'':<15} {total_input_tokens:<12,} {total_output_tokens:<12,} {total_duration:<10.1f} {total_cost:<10.4f}")

    print(f"\n📊 Opus 단독 대비 예상 절감: ${3.11 - total_cost:.2f} ({(1 - total_cost/3.11)*100:.0f}%)")

    return {
        "success": True,
        "final_report": final_report,
        "final_file": str(final_file),
        "total_cost": total_cost,
        "total_duration": total_duration,
        "meta": meta
    }


# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="PSUR Hybrid Generator (Strategy C)")
    parser.add_argument("--output", "-o", type=str, default="05_Output/hybrid", help="Output directory")
    args = parser.parse_args()

    print("=" * 70)
    print("PSUR 하이브리드 생성기 - 전략 C (Sonnet → Opus)")
    print("=" * 70)
    print(f"시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    api_key = load_env()
    if not api_key or api_key == "your-api-key-here":
        print("\n❌ 오류: ANTHROPIC_API_KEY가 설정되지 않았습니다.")
        print("   .env 파일에서 API 키를 설정해주세요.")
        return

    print(f"API Key: 설정됨 ({api_key[:10]}...)")

    output_dir = BASE_PATH / args.output
    result = run_hybrid_generation(api_key, output_dir)

    if result["success"]:
        print(f"\n✅ 생성 완료!")
        print(f"   파일: {result['final_file']}")
    else:
        print(f"\n❌ 실패: {result['error']}")

    print(f"\n완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    main()
