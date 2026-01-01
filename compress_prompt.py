#!/usr/bin/env python3
"""
UserPrompt.md 형식 압축 스크립트
- Variable ID 유지
- 지침 블록 유지
- 반복 헤더 제거
- 압축된 형식으로 변환
"""

import re

def compress_cs_definition(content):
    """CS/PH 데이터 정의 압축"""

    # 패턴: ### N. [CSX_이름] 블록 찾기
    pattern = r'### (\d+)\. \[([^\]]+)\]\n\n\*\*Variable ID:\*\* `\[([^\]]+)\]`\n\*\*Variable Name:\*\* ([^\n]+)\n\*\*Data Source:\*\* ([^\n]+)\n\*\*Input Type:\*\* ([^\n]+)\n\*\*Generation Timing:\*\* ([^\n]+)\n\*\*Data Type:\*\* ([^\n]+)\n'

    def replace_header(match):
        num = match.group(1)
        full_name = match.group(2)
        var_id = match.group(3)
        var_name = match.group(4)
        data_source = match.group(5)
        input_type = match.group(6)
        timing = match.group(7)
        data_type = match.group(8)

        # 압축된 형식
        return f'''### [{var_id}] {var_name}
- **ID:** `[{var_id}]` | **Source:** {data_source}
- **Input:** {input_type} | **Timing:** {timing} | **Type:** {data_type}
'''

    content = re.sub(pattern, replace_header, content)
    return content

def compress_sections(content):
    """반복 섹션 헤더 압축"""

    # #### 데이터 추출 방법 -> 제거하고 지침만 유지
    content = re.sub(r'\n#### 데이터 추출 방법\n\n', '\n', content)

    # #### 추가 지침 -> 제거하고 지침만 유지
    content = re.sub(r'\n#### 추가 지침\n\n', '\n', content)

    # #### 예시 -> - **예시:**
    content = re.sub(r'\n#### 예시\n\n', '\n**예시:**\n', content)

    # 예시 번호 형식 변경: 1. `value` -> `value`
    content = re.sub(r'\n\d+\. `([^`]+)`', r' `\1`', content)

    return content

def remove_excess_dividers(content):
    """과도한 구분선 제거"""
    # 연속된 --- 제거
    content = re.sub(r'\n---\n\n---\n', '\n---\n', content)

    # 빈 줄 3개 이상 -> 2개로
    content = re.sub(r'\n{4,}', '\n\n\n', content)

    return content

def main():
    # 파일 읽기
    with open('UserPrompt.md', 'r', encoding='utf-8') as f:
        content = f.read()

    # 변환 적용
    content = compress_cs_definition(content)
    content = compress_sections(content)
    content = remove_excess_dividers(content)

    # 저장
    with open('UserPrompt-1.md', 'w', encoding='utf-8') as f:
        f.write(content)

    print("변환 완료: UserPrompt-1.md")

if __name__ == '__main__':
    main()
