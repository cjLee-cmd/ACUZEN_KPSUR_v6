#!/usr/bin/env python3
import json
import sys
from datetime import datetime

def truncate_text(text, max_length=2000):
    """텍스트를 지정된 길이로 자르고 생략 표시 추가"""
    if len(text) <= max_length:
        return text
    return text[:max_length] + f"\n\n... (생략, 총 {len(text):,} 문자)"

def convert_json_to_markdown(json_file, output_file):
    """JSON 파일을 마크다운으로 변환"""
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    md_lines = []
    
    # 헤더
    md_lines.append("# LLM 대화 로그\n")
    md_lines.append(f"**캡처 시간**: {data['capturedAt']}\n")
    md_lines.append(f"**파일 개수**: {data['fileCount']}\n")
    md_lines.append(f"**대화 개수**: {len(data['conversationLog'])}\n")
    md_lines.append("\n---\n")
    
    # 각 대화 처리
    for idx, conv in enumerate(data['conversationLog'], 1):
        md_lines.append(f"\n## 대화 #{idx}\n")
        md_lines.append(f"\n**타임스탬프**: {conv['timestamp']}\n")
        md_lines.append(f"**타입**: {conv['type']}\n")
        
        # 요청 섹션
        md_lines.append("\n### 📤 요청 (Request)\n")
        md_lines.append(f"\n- **메서드**: {conv['request']['method']}\n")
        
        url = conv['request']['url'].split('?')[0]
        md_lines.append(f"- **URL**: `{url}`\n")
        
        # 요청 본문 구조
        body = conv['request']['body']
        md_lines.append("\n#### 요청 본문 구조\n")
        md_lines.append("```json\n")
        structure = {
            'contents_count': len(body.get('contents', [])),
            'systemInstruction_length': len(body.get('systemInstruction', {}).get('parts', [{}])[0].get('text', '')),
            'generationConfig': body.get('generationConfig', {})
        }
        md_lines.append(json.dumps(structure, indent=2, ensure_ascii=False))
        md_lines.append("\n```\n")
        
        # 시스템 지시사항
        system_instruction = body.get('systemInstruction', {}).get('parts', [{}])[0].get('text', '')
        if system_instruction:
            md_lines.append("\n#### 시스템 지시사항 (System Instruction)\n")
            md_lines.append(f"\n**길이**: {len(system_instruction):,} 문자\n")
            md_lines.append("\n```\n")
            md_lines.append(truncate_text(system_instruction, 3000))
            md_lines.append("\n```\n")
        
        # 사용자 입력
        user_content = body.get('contents', [{}])[0].get('parts', [{}])[0].get('text', '')
        md_lines.append("\n#### 사용자 입력 (User Contents)\n")
        md_lines.append(f"\n**길이**: {len(user_content):,} 문자\n")
        md_lines.append("\n```\n")
        md_lines.append(truncate_text(user_content, 3000))
        md_lines.append("\n```\n")
        
        # 응답 섹션
        md_lines.append("\n### 📥 응답 (Response)\n")
        md_lines.append(f"\n- **상태 코드**: {conv['response']['status']}\n")
        
        response_data = conv['response'].get('data', {})
        md_lines.append(f"- **모델**: {response_data.get('modelVersion', 'N/A')}\n")
        
        # 응답 텍스트
        candidates = response_data.get('candidates', [{}])
        if candidates:
            response_text = candidates[0].get('content', {}).get('parts', [{}])[0].get('text', '')
            md_lines.append("\n#### 응답 텍스트\n")
            md_lines.append(f"\n**길이**: {len(response_text):,} 문자\n")
            md_lines.append("\n```markdown\n")
            md_lines.append(response_text)
            md_lines.append("\n```\n")
            
            # 메타데이터
            md_lines.append("\n#### 메타데이터\n")
            md_lines.append(f"\n- **Finish Reason**: `{candidates[0].get('finishReason', 'N/A')}`\n")
            md_lines.append(f"- **Safety Ratings**: {len(candidates[0].get('safetyRatings', []))} 항목\n")
            
            usage = response_data.get('usageMetadata', {})
            if usage:
                md_lines.append(f"- **Token Count**:\n")
                md_lines.append(f"  - Prompt Tokens: {usage.get('promptTokenCount', 0):,}\n")
                md_lines.append(f"  - Candidates Tokens: {usage.get('candidatesTokenCount', 0):,}\n")
                md_lines.append(f"  - Total Tokens: {usage.get('totalTokenCount', 0):,}\n")
        
        md_lines.append("\n---\n")
    
    # 파일 저장
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(''.join(md_lines))
    
    print(f"✅ 변환 완료: {output_file}")
    print(f"   - 대화 개수: {len(data['conversationLog'])}")
    print(f"   - 출력 크기: {len(''.join(md_lines)):,} 문자")

if __name__ == '__main__':
    json_file = 'LLM_Conversation_20260101_013724.json'
    output_file = 'LLM_Conversation_20260101_013724.md'
    
    convert_json_to_markdown(json_file, output_file)
