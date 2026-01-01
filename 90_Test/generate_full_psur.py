#!/usr/bin/env python3
"""
Full PSUR Report Generation using Gemini API
Model: gemini-3-flash-preview
"""

import os
import json
import requests
import time
from datetime import datetime

# Configuration
API_KEY = "AIzaSyDPuqdY4s2tQ9qwyGSiLs6V0Xo2k_7xPF4"
MODEL = "gemini-3-flash-preview"
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

# Paths
BASE_DIR = "/Users/cjlee/Documents/진행중/ACUZEN/02_KSUR_v6/90_Test"
CONTEXT_FILE = f"{BASE_DIR}/01_Context/PSUR_Generation_Context.md"
RAWDATA_DEF_FILE = f"{BASE_DIR}/01_Context/RawData_Definition.md"
MAIN_DOC_FILE = f"{BASE_DIR}/04_MainDocuement/total_MD.md"
USER_INPUT_FILE = f"{BASE_DIR}/04_MainDocuement/test_UserInput.md"
OUTPUT_DIR = f"{BASE_DIR}/05_Output"

# Sections to generate (Phase 2 first, then Phase 3)
PHASE2_SECTIONS = [
    ("00", "표지", "기본 정보를 포함한 표지 페이지"),
    ("03", "서론", "CS 변수 치환, 제품 소개 및 보고서 목적"),
    ("04", "전세계판매허가현황", "RAW4 데이터 기반 허가 현황표"),
    ("05", "안전성조치", "RAW5, RAW6 데이터 기반 안전성 조치 내역"),
    ("06", "안전성정보참고정보변경", "RAW7 데이터 기반 안전성 정보 변경"),
    ("07", "환자노출", "RAW3, RAW8 데이터 기반 노출 통계"),
    ("08", "개별증례병력", "LineListing 데이터 기반 증례 분석"),
    ("09", "시험", "RAW8, RAW9 데이터 기반 임상시험 정보"),
    ("10", "기타정보", "RAW9 문헌자료 기반 기타 정보"),
    ("14", "별첨", "표 데이터 정리 및 별첨 자료"),
]

PHASE3_SECTIONS = [
    ("11", "종합적인안전성평가", "전체 안전성 데이터 종합 평가"),
    ("12", "결론", "유익성-위해성 최종 결론"),
    ("02", "약어설명", "본문에서 사용된 약어 정리"),
    ("13", "참고문헌", "인용 문헌 목록"),
    ("01", "목차", "완성된 섹션 기반 목차 생성"),
]

# Test data
USER_DATA = {
    "CS0_성분명": "메만틴염산염",
    "CS1_브랜드명": "글리빅사정",
    "CS2_회사명": "대웅바이오(주)",
    "CS3_보고시작날짜": "2020년 05월 01일",
    "CS4_보고종료날짜": "2025년 04월 30일",
    "CS5_국내허가일자": "2018년 11월 10일",
    "CS6_보고서제출일": "2025년 05월 31일",
    "CS7_버전넘버": "1.0",
    "CS13_유효기간": "2025년 11월 10일",
    "CS14_신청기한": "2025년 05월 10일",
    "CS24_MedDRA버전": "27.0",
}

def read_file(filepath, max_chars=None):
    """Read file with optional truncation"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            if max_chars and len(content) > max_chars:
                content = content[:max_chars] + "\n\n[... 이하 생략 ...]"
            return content
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return ""

def call_gemini(prompt, max_tokens=8192, retry_count=0):
    """Call Gemini API with retry logic"""
    url = f"{BASE_URL}/{MODEL}:generateContent?key={API_KEY}"
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": max_tokens,
        }
    }
    
    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=180)
        
        if response.status_code == 200:
            data = response.json()
            if 'candidates' in data and data['candidates']:
                return data['candidates'][0]['content']['parts'][0]['text']
        
        error_msg = response.json().get('error', {}).get('message', 'Unknown error')
        print(f"    API Error: {error_msg[:100]}")
        
        # Retry with higher token limit
        if retry_count < 2 and ('token' in error_msg.lower() or 'limit' in error_msg.lower()):
            new_limit = min(max_tokens * 2, 65536)
            print(f"    Retrying with max_tokens={new_limit}...")
            time.sleep(2)
            return call_gemini(prompt, new_limit, retry_count + 1)
        
        # Retry on rate limit
        if 'rate' in error_msg.lower() or '429' in str(response.status_code):
            print(f"    Rate limited, waiting 30 seconds...")
            time.sleep(30)
            return call_gemini(prompt, max_tokens, retry_count + 1)
            
    except Exception as e:
        print(f"    Exception: {e}")
    
    return None

def generate_section(section_num, section_name, description, context, raw_data, previous_sections=""):
    """Generate a single section"""
    user_data_str = "\n".join([f"- {k}: {v}" for k, v in USER_DATA.items()])
    
    prompt = f"""## 역할
당신은 제약사 약물감시팀 팀장입니다. 한국 식약처에 제출하는 PSUR 보고서를 작성합니다.

## 컨텍스트
{context[:15000]}

## RAW 데이터 (발췌)
{raw_data[:30000]}

## 사용자 입력 데이터
{user_data_str}

## 이전 섹션 참조
{previous_sections[:5000] if previous_sections else "(없음)"}

## 작업
**{section_num}_{section_name}** 섹션을 작성하세요.

### 섹션 설명
{description}

### 작성 지침
1. 위 RAW 데이터에서 관련 정보를 추출하여 사용
2. CS 변수는 사용자 입력 데이터의 값으로 치환
3. 표는 마크다운 테이블 형식 사용
4. 전문적이고 공식적인 문체 사용
5. 데이터가 없는 항목은 "해당 기간 중 보고된 내용 없음" 등으로 명시

### 출력 형식
```markdown
## {section_num}. {section_name}

[완성된 내용]
```

지금 바로 **{section_num}_{section_name}** 섹션을 작성하세요:
"""
    
    return call_gemini(prompt, max_tokens=8192)

def main():
    start_time = datetime.now()
    print("=" * 70)
    print("PSUR 전체 보고서 생성")
    print(f"Model: {MODEL}")
    print(f"Started: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    # Create output directories
    os.makedirs(f"{OUTPUT_DIR}/sections", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/final", exist_ok=True)
    
    # Read source files
    print("\n[1] 소스 파일 읽기...")
    context = read_file(CONTEXT_FILE)
    raw_data = read_file(MAIN_DOC_FILE, max_chars=60000)
    rawdata_def = read_file(RAWDATA_DEF_FILE, max_chars=30000)
    
    print(f"    Context: {len(context):,} chars")
    print(f"    RAW Data: {len(raw_data):,} chars")
    print(f"    Definition: {len(rawdata_def):,} chars")
    
    # Combined context
    full_context = f"{context}\n\n---\n\n## 데이터 정의\n{rawdata_def[:20000]}"
    
    # Store generated sections
    generated_sections = {}
    
    # Phase 2: Generate main content sections
    print("\n[2] Phase 2: 본문 섹션 생성")
    print("-" * 70)
    
    for i, (num, name, desc) in enumerate(PHASE2_SECTIONS, 1):
        print(f"\n    [{i}/{len(PHASE2_SECTIONS)}] {num}_{name} 생성 중...")
        
        result = generate_section(num, name, desc, full_context, raw_data)
        
        if result:
            generated_sections[num] = result
            
            # Save individual section
            filepath = f"{OUTPUT_DIR}/sections/{num}_{name}.md"
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(f"# {num}. {name}\n")
                f.write(f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write(result)
            
            print(f"    ✓ 완료 ({len(result):,} chars) -> {filepath}")
        else:
            print(f"    ✗ 실패")
            generated_sections[num] = f"## {num}. {name}\n\n[생성 실패]\n"
        
        # Rate limit delay
        time.sleep(3)
    
    # Phase 3: Generate document-wide reference sections
    print("\n[3] Phase 3: 문서 전반 참조 섹션 생성")
    print("-" * 70)
    
    # Combine previous sections for reference
    prev_sections_text = "\n\n---\n\n".join([
        f"## {num}. {name}\n{generated_sections.get(num, '')[:2000]}"
        for num, name, _ in PHASE2_SECTIONS if num in generated_sections
    ])
    
    for i, (num, name, desc) in enumerate(PHASE3_SECTIONS, 1):
        print(f"\n    [{i}/{len(PHASE3_SECTIONS)}] {num}_{name} 생성 중...")
        
        result = generate_section(num, name, desc, full_context, raw_data, prev_sections_text)
        
        if result:
            generated_sections[num] = result
            
            filepath = f"{OUTPUT_DIR}/sections/{num}_{name}.md"
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(f"# {num}. {name}\n")
                f.write(f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write(result)
            
            print(f"    ✓ 완료 ({len(result):,} chars)")
        else:
            print(f"    ✗ 실패")
            generated_sections[num] = f"## {num}. {name}\n\n[생성 실패]\n"
        
        time.sleep(3)
    
    # Phase 4: Combine into final report
    print("\n[4] 최종 보고서 취합...")
    print("-" * 70)
    
    section_order = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14"]
    
    final_report = f"""# 유효기간 동안 수집된 안전관리에 관한 자료
# {USER_DATA['CS1_브랜드명']}({USER_DATA['CS0_성분명']})

**정기 안전성 갱신 보고서 (PSUR)**

- 보고 기간: {USER_DATA['CS3_보고시작날짜']} ~ {USER_DATA['CS4_보고종료날짜']}
- 제약사: {USER_DATA['CS2_회사명']}
- 버전: {USER_DATA['CS7_버전넘버']}
- 생성일시: {datetime.now().strftime('%Y년 %m월 %d일 %H:%M:%S')}
- 생성모델: {MODEL}

---

"""
    
    for num in section_order:
        if num in generated_sections:
            final_report += generated_sections[num]
            final_report += "\n\n---\n\n"
    
    # Save final report
    final_path = f"{OUTPUT_DIR}/final/PSUR_Final_Report.md"
    with open(final_path, 'w', encoding='utf-8') as f:
        f.write(final_report)
    
    print(f"    ✓ 최종 보고서 저장: {final_path}")
    print(f"    총 길이: {len(final_report):,} chars")
    
    # Summary
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    print("\n" + "=" * 70)
    print("생성 완료!")
    print("=" * 70)
    print(f"총 소요 시간: {duration:.1f}초 ({duration/60:.1f}분)")
    print(f"생성된 섹션: {len(generated_sections)}/15")
    print(f"최종 보고서: {final_path}")
    print(f"개별 섹션: {OUTPUT_DIR}/sections/")
    print("=" * 70)

if __name__ == "__main__":
    main()
