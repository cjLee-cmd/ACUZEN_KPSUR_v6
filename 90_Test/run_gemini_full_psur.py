#!/usr/bin/env python3
"""
PSUR 전체 보고서 생성 - Google Gemini API
모델: gemini-3-flash-preview
"""

import os
import json
import requests
from pathlib import Path
from datetime import datetime
import time

# 기본 경로 설정
BASE_DIR = Path(__file__).parent
CONTEXT_DIR = BASE_DIR / "01_Context"
TEMPLATE_DIR = BASE_DIR / "02_Templates"
EXAMPLE_DIR = BASE_DIR / "03_Examples"
MAIN_DOC_DIR = BASE_DIR / "04_MainDocument"
OUTPUT_DIR = BASE_DIR / "05_Output"
SECTIONS_DIR = OUTPUT_DIR / "sections"

# API 설정
API_KEY = "AIzaSyDPuqdY4s2tQ9qwyGSiLs6V0Xo2k_7xPF4"
MODEL = "models/gemini-3-flash-preview"

# 섹션 정의
SECTIONS = [
    ("00", "표지"),
    ("01", "목차"),
    ("02", "약어설명"),
    ("03", "서론"),
    ("04", "전세계판매허가현황"),
    ("05", "안전성조치"),
    ("06", "안전성정보참고정보변경"),
    ("07", "환자노출"),
    ("08", "개별증례병력"),
    ("09", "시험"),
    ("10", "기타정보"),
    ("11", "종합적인안전성평가"),
    ("12", "결론"),
    ("13", "참고문헌"),
    ("14", "별첨"),
]

def read_file(filepath: Path) -> str:
    """파일 읽기"""
    if filepath.exists():
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    return ""

def call_gemini_api(prompt: str, max_output_tokens: int = 65536) -> dict:
    """Gemini API 호출"""
    url = f"https://generativelanguage.googleapis.com/v1beta/{MODEL}:generateContent?key={API_KEY}"

    headers = {"Content-Type": "application/json"}

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": max_output_tokens,
        }
    }

    response = requests.post(url, headers=headers, json=payload, timeout=600)

    if response.status_code == 200:
        return response.json()
    else:
        error_info = response.json() if response.text else {"error": response.text}
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

def generate_full_report():
    """전체 PSUR 보고서 생성"""
    print("=" * 70)
    print("PSUR 전체 보고서 생성 - Gemini API (gemini-3-flash-preview)")
    print("=" * 70)

    # 출력 디렉토리 생성
    SECTIONS_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "final").mkdir(parents=True, exist_ok=True)

    # 1. 필요한 파일들 로딩
    print("\n[1단계] 파일 로딩...")

    context = read_file(CONTEXT_DIR / "PSUR_Generation_Context.md")
    print(f"  - PSUR_Generation_Context.md: {len(context):,} 자")

    rawdata_def = read_file(CONTEXT_DIR / "RawData_Definition.md")
    print(f"  - RawData_Definition.md: {len(rawdata_def):,} 자")

    # MainDocument 파일들 로딩 (있으면)
    total_md = read_file(MAIN_DOC_DIR / "total_MD.md")
    if total_md:
        print(f"  - total_MD.md: {len(total_md):,} 자")

    user_input = read_file(MAIN_DOC_DIR / "test_UserInput.md")
    if user_input:
        print(f"  - test_UserInput.md: {len(user_input):,} 자")

    # 2. 전체 보고서 생성 프롬프트
    print("\n[2단계] 전체 보고서 생성 프롬프트 구성...")

    full_prompt = f"""# PSUR 전체 보고서 생성 요청

## 역할
당신은 **제약사 약물감시팀 팀장**입니다. 한국 식약처에 제출하는 PSUR(Periodic Safety Update Report) 문서를 작성하는 전문가입니다.

## 컨텍스트 및 지침
{context}

## 데이터 정의서 (변수 정의)
{rawdata_def}

---

## 실행 지시

위 컨텍스트와 데이터 정의서를 참조하여 **전체 15개 섹션**의 PSUR 보고서를 작성하세요.

### 작성 순서
1. **00_표지** - 기본 정보
2. **03_서론** - CS 변수 치환
3. **04_전세계판매허가현황** - 허가 현황 표
4. **05_안전성조치** - 안전성 조치 내역
5. **06_안전성정보참고정보변경** - 정보 변경 내역
6. **07_환자노출** - 판매량 및 환자 노출 데이터
7. **08_개별증례병력** - 이상사례 LineListing 요약
8. **09_시험** - 임상시험 정보
9. **10_기타정보** - 문헌 검토 등
10. **11_종합적인안전성평가** - 전체 안전성 종합 평가
11. **12_결론** - 유익성-위해성 결론
12. **02_약어설명** - 사용된 약어 목록
13. **13_참고문헌** - 인용 문헌
14. **01_목차** - 완성된 섹션 기반 목차
15. **14_별첨** - 별첨 자료

### 테스트 제품 정보 (사용자입력 기준)
| 항목 | 값 |
|------|-----|
| 성분명 (CS0) | 메만틴염산염 |
| 브랜드명 (CS1) | 글리빅사정 |
| 회사명 (CS2) | 대웅바이오(주) |
| 보고종료날짜 (CS4) | 2025-04-30 |
| 보고시작날짜 (CS3) | 2020-05-01 (자동계산: CS4 - 5년) |
| 국내허가일 (CS5) | 2018-11-10 |
| 보고서제출일 (CS6) | 2025-05-31 |
| 버전넘버 (CS7) | 1.0 |
| 유효기간 (CS13) | 2025-11-10 |
| 신청기한 (CS14) | 2025-05-10 |
| MedDRA 버전 (CS24) | 27.0 |

### 출력 형식
각 섹션은 다음 형식으로 작성:

```markdown
---
## [섹션번호]. [섹션명]

[완성된 내용]

---
```

### 중요 규칙
1. **정확성**: 모든 변수는 데이터 정의서에 따라 정확히 치환
2. **일관성**: 동일 변수는 문서 전체에서 동일 값 사용
3. **완전성**: 모든 15개 섹션 포함
4. **형식 준수**: 마크다운 형식으로 작성
5. **한국어**: 본문은 한국어로 작성, 전문용어는 영어 병기 가능

---

지금 전체 PSUR 보고서를 작성해 주세요. 모든 섹션을 포함하여 완전한 보고서를 출력하세요.
"""

    print(f"  - 프롬프트 길이: {len(full_prompt):,} 자")

    # 3. API 호출
    print("\n[3단계] Gemini API 호출 (전체 보고서 생성)...")
    print(f"  - 모델: {MODEL}")
    print(f"  - max_output_tokens: 65536")
    print("  - 처리 중... (최대 10분 소요 예상)")

    start_time = time.time()
    response = call_gemini_api(full_prompt, max_output_tokens=65536)
    elapsed_time = time.time() - start_time

    print(f"  - 소요 시간: {elapsed_time:.1f}초")

    # 에러 체크
    if "error" in response:
        error_msg = str(response.get("error", ""))
        print(f"\n[오류] API 호출 실패: {error_msg}")

        # 토큰 제한 에러 시 131072로 재시도
        if "token" in error_msg.lower() or "limit" in error_msg.lower():
            print("\n[재시도] max_output_tokens: 131072로 재시도...")
            response = call_gemini_api(full_prompt, max_output_tokens=131072)

            if "error" in response:
                print(f"[실패] 재시도 실패: {response.get('error')}")
                return None

    # 4. 결과 추출 및 저장
    result_text = extract_text_from_response(response)

    if not result_text:
        print("\n[실패] 빈 응답 수신")
        return None

    print(f"\n[4단계] 응답 수신 완료!")
    print(f"  - 응답 길이: {len(result_text):,} 자")

    # 타임스탬프
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    # 5. 전체 보고서 저장
    final_report_path = OUTPUT_DIR / "final" / f"PSUR_Full_Report_{timestamp}.md"

    with open(final_report_path, 'w', encoding='utf-8') as f:
        f.write(f"# PSUR 전체 보고서\n\n")
        f.write(f"**생성 모델:** {MODEL}\n")
        f.write(f"**생성 시간:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"**소요 시간:** {elapsed_time:.1f}초\n\n")
        f.write("---\n\n")
        f.write(result_text)

    print(f"\n[5단계] 파일 저장 완료!")
    print(f"  - 전체 보고서: {final_report_path}")

    # 6. 섹션별 분리 저장 시도
    print("\n[6단계] 섹션별 분리 저장...")

    # 간단한 섹션 분리 (## 기준)
    sections_saved = 0
    current_section = ""
    current_content = []

    for line in result_text.split('\n'):
        if line.startswith('## ') and ('.' in line or '표지' in line or '목차' in line):
            # 이전 섹션 저장
            if current_section and current_content:
                section_file = SECTIONS_DIR / f"{current_section}_{timestamp}.md"
                with open(section_file, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(current_content))
                sections_saved += 1

            # 새 섹션 시작
            current_section = line.replace('## ', '').replace('.', '_').replace(' ', '_')[:20]
            current_content = [line]
        else:
            current_content.append(line)

    # 마지막 섹션 저장
    if current_section and current_content:
        section_file = SECTIONS_DIR / f"{current_section}_{timestamp}.md"
        with open(section_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(current_content))
        sections_saved += 1

    print(f"  - 저장된 섹션 수: {sections_saved}")
    print(f"  - 섹션 저장 경로: {SECTIONS_DIR}")

    # 7. 결과 미리보기
    print("\n" + "=" * 70)
    print("전체 보고서 미리보기 (처음 3000자):")
    print("=" * 70)
    print(result_text[:3000])
    if len(result_text) > 3000:
        print(f"\n... (이하 {len(result_text) - 3000:,}자 생략)")
    print("=" * 70)

    return result_text

if __name__ == "__main__":
    generate_full_report()
