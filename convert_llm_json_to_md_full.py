#!/usr/bin/env python3
import json
import sys
from datetime import datetime

def convert_json_to_markdown(json_file, output_file):
    """JSON 파일을 마크다운으로 변환 (전체 내용 포함)"""
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    md_lines = []
    
    # 헤더
    md_lines.append("# LLM 대화 로그 (전체)\n\n")
    md_lines.append(f"**캡처 시간**: {data['capturedAt']}\n")
    md_lines.append(f"**파일 개수**: {data['fileCount']}\n")
    md_lines.append(f"**대화 개수**: {len(data['conversationLog'])}\n\n")
    md_lines.append("---\n\n")
    
    # 각 대화 처리
    for idx, conv in enumerate(data['conversationLog'], 1):
        md_lines.append(f"## 대화 #{idx}\n\n")
        md_lines.append(f"**타임스탬프**: {conv['timestamp']}\n")
        md_lines.append(f"**타입**: {conv['type']}\n\n")
        
        # 요청 섹션
        md_lines.append("### 📤 요청 (Request)\n\n")
        md_lines.append(f"- **메서드**: {conv['request']['method']}\n")
        
        url = conv['request']['url'].split('?')[0]
        md_lines.append(f"- **URL**: `{url}`\n\n")
        
        # 요청 본문 구조
        body = conv['request']['body']
        md_lines.append("#### 요청 본문 구조\n\n")
        md_lines.append("```json\n")
        structure = {
            'contents_count': len(body.get('contents', [])),
            'systemInstruction_length': len(body.get('systemInstruction', {}).get('parts', [{}])[0].get('text', '')),
            'generationConfig': body.get('generationConfig', {})
        }
        md_lines.append(json.dumps(structure, indent=2, ensure_ascii=False))
        md_lines.append("\n```\n\n")
        
        # 시스템 지시사항 (전체)
        system_instruction = body.get('systemInstruction', {}).get('parts', [{}])[0].get('text', '')
        if system_instruction:
            md_lines.append("#### 시스템 지시사항 (System Instruction)\n\n")
            md_lines.append(f"**길이**: {len(system_instruction):,} 문자\n\n")
            md_lines.append("```\n")
            md_lines.append(system_instruction)  # 전체 출력
            md_lines.append("\n```\n\n")
        
        # 사용자 입력 (전체)
        user_content = body.get('contents', [{}])[0].get('parts', [{}])[0].get('text', '')
        md_lines.append("#### 사용자 입력 (User Contents)\n\n")
        md_lines.append(f"**길이**: {len(user_content):,} 문자\n\n")
        md_lines.append("```\n")
        md_lines.append(user_content)  # 전체 출력
        md_lines.append("\n```\n\n")
        
        # 응답 섹션
        md_lines.append("### 📥 응답 (Response)\n\n")
        md_lines.append(f"- **상태 코드**: {conv['response']['status']}\n")
        
        response_data = conv['response'].get('data', {})
        md_lines.append(f"- **모델**: {response_data.get('modelVersion', 'N/A')}\n\n")
        
        # 응답 텍스트 (전체)
        candidates = response_data.get('candidates', [{}])
        if candidates:
            response_text = candidates[0].get('content', {}).get('parts', [{}])[0].get('text', '')
            md_lines.append("#### 응답 텍스트\n\n")
            md_lines.append(f"**길이**: {len(response_text):,} 문자\n\n")
            md_lines.append("```markdown\n")
            md_lines.append(response_text)  # 전체 출력
            md_lines.append("\n```\n\n")
            
            # 메타데이터
            md_lines.append("#### 메타데이터\n\n")
            md_lines.append(f"- **Finish Reason**: `{candidates[0].get('finishReason', 'N/A')}`\n")
            md_lines.append(f"- **Safety Ratings**: {len(candidates[0].get('safetyRatings', []))} 항목\n\n")
            
            # Safety Ratings 상세
            safety_ratings = candidates[0].get('safetyRatings', [])
            if safety_ratings:
                md_lines.append("**Safety Ratings 상세**:\n\n")
                for rating in safety_ratings:
                    md_lines.append(f"- {rating.get('category', 'N/A')}: {rating.get('probability', 'N/A')}\n")
                md_lines.append("\n")
            
            # Token Count
            usage = response_data.get('usageMetadata', {})
            if usage:
                md_lines.append("**Token Count**:\n\n")
                md_lines.append(f"- Prompt Tokens: {usage.get('promptTokenCount', 0):,}\n")
                md_lines.append(f"- Candidates Tokens: {usage.get('candidatesTokenCount', 0):,}\n")
                md_lines.append(f"- Total Tokens: {usage.get('totalTokenCount', 0):,}\n\n")
        
        md_lines.append("---\n\n")
    
    # 파일 저장
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(''.join(md_lines))
    
    print(f"✅ 변환 완료: {output_file}")
    print(f"   - 대화 개수: {len(data['conversationLog'])}")
    print(f"   - 출력 크기: {len(''.join(md_lines)):,} 문자")

if __name__ == '__main__':
    json_file = 'LLM_Conversation_20260101_013724.json'
    output_file = 'LLM_Conversation_20260101_013724_FULL.md'
    
    convert_json_to_markdown(json_file, output_file)
