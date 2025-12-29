# Supabase Edge Functions 명세

## 개요

Supabase Edge Functions는 Deno 런타임 기반의 서버리스 함수로, KSUR 시스템에서 다음 역할을 수행합니다:

1. **API 키 보안**: Gemini API 키를 클라이언트로부터 숨김
2. **서버 권한 작업**: DB 및 Storage에 대한 관리자 권한 작업
3. **LLM 호출**: 파일 분류, 변환, 데이터 추출, QC 검증

---

## Edge Functions 목록

| 함수명 | 엔드포인트 | 메서드 | 용도 |
|--------|-----------|--------|------|
| `classify-raw-id` | `/functions/v1/classify-raw-id` | POST | RAW ID 자동 분류 |
| `convert-to-markdown` | `/functions/v1/convert-to-markdown` | POST | 파일 → 마크다운 변환 |
| `extract-data` | `/functions/v1/extract-data` | POST | CS/PH/Table 데이터 추출 |
| `qc-validation` | `/functions/v1/qc-validation` | POST | QC 검증 |

---

## 1. classify-raw-id

### 용도
업로드된 파일의 내용을 분석하여 적절한 RAW ID를 자동으로 분류합니다.

### 엔드포인트
```
POST /functions/v1/classify-raw-id
```

### 요청 (Request)

**Headers:**
```
Authorization: Bearer {supabase-anon-key}
Content-Type: application/json
```

**Body:**
```json
{
  "reportId": "uuid",
  "documentId": "uuid",
  "fileName": "첨부문서_2024.pdf",
  "fileUrl": "https://supabase-storage-url/..."
}
```

### 응답 (Response)

**성공 (200):**
```json
{
  "success": true,
  "data": {
    "rawId": "RAW1",
    "confidence": 0.95,
    "reasoning": "문서에 '첨부문서', '허가사항' 키워드가 포함되어 있어 RAW1(최신첨부문서)로 분류"
  }
}
```

**실패 (400/500):**
```json
{
  "success": false,
  "error": "파일을 읽을 수 없습니다"
}
```

### 구현 예시

```typescript
// supabase/functions/classify-raw-id/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabase Admin 클라이언트 (서버 권한)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // 요청 파싱
    const { reportId, documentId, fileName, fileUrl } = await req.json()

    // 파일 다운로드
    const fileResponse = await fetch(fileUrl)
    const fileBlob = await fileResponse.blob()

    // Gemini API 호출
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'))
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
다음 파일의 내용을 분석하여 적절한 RAW ID를 분류해주세요.

RAW ID 목록:
- RAW1: 최신첨부문서
- RAW2.1: 용법용량
- RAW2.2: 효능효과
- RAW2.3: 사용상의주의사항
- RAW3: 시판후sales데이터
- RAW4: 허가현황
- RAW5.1: 안전성조치허가메일
- RAW12: 국외신속보고LineListing
- RAW13: 국내신속보고LineListing
- RAW14: 원시자료LineListing
- RAW15: 정기보고LineListing

파일명: ${fileName}

JSON 형식으로 응답해주세요:
{
  "rawId": "RAW1",
  "confidence": 0.95,
  "reasoning": "분류 근거"
}
`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: await fileBlob.arrayBuffer(),
          mimeType: fileBlob.type,
        }
      }
    ])

    const response = result.response.text()
    const classification = JSON.parse(response)

    // DB 업데이트
    await supabaseAdmin
      .from('file_matching_table')
      .insert({
        report_id: reportId,
        original_filename: fileName,
        assigned_raw_id: classification.rawId,
        confidence_score: classification.confidence,
        classified_by: 'Gemini-2.0-Flash',
      })

    return new Response(
      JSON.stringify({ success: true, data: classification }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
```

---

## 2. convert-to-markdown

### 용도
PDF, Word, Excel 파일을 마크다운으로 변환합니다.

### 엔드포인트
```
POST /functions/v1/convert-to-markdown
```

### 요청 (Request)

**Body:**
```json
{
  "reportId": "uuid",
  "sourceDocumentId": "uuid",
  "rawId": "RAW1",
  "fileUrl": "https://supabase-storage-url/...",
  "fileName": "첨부문서.pdf"
}
```

### 응답 (Response)

**성공 (200):**
```json
{
  "success": true,
  "data": {
    "markdownContent": "# 첨부문서\n\n## 1. 효능효과\n...",
    "documentId": "uuid"
  }
}
```

### 구현 예시

```typescript
// supabase/functions/convert-to-markdown/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { reportId, sourceDocumentId, rawId, fileUrl, fileName } = await req.json()

    // 파일 다운로드
    const fileResponse = await fetch(fileUrl)
    const fileBlob = await fileResponse.blob()

    // Gemini API 호출
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'))
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
다음 파일을 마크다운 형식으로 변환해주세요.

중요 규칙:
1. 내용을 절대 추가하거나 삭제하지 마세요
2. 원본 텍스트를 그대로 보존하세요
3. 표는 마크다운 테이블 형식으로 변환하세요
4. 제목은 # 헤더로 변환하세요
5. 번호 매김 리스트는 그대로 유지하세요

파일명: ${fileName}
`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: await fileBlob.arrayBuffer(),
          mimeType: fileBlob.type,
        }
      }
    ])

    const markdownContent = result.response.text()

    // DB에 저장
    const { data: markdownDoc, error } = await supabaseAdmin
      .from('markdown_documents')
      .insert({
        source_document_id: sourceDocumentId,
        report_id: reportId,
        raw_id: rawId,
        markdown_content: markdownContent,
        converted_by: 'Gemini-2.0-Flash',
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          markdownContent,
          documentId: markdownDoc.id,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
```

---

## 3. extract-data

### 용도
마크다운 문서에서 CS/PH/Table 데이터를 추출합니다.

### 엔드포인트
```
POST /functions/v1/extract-data
```

### 요청 (Request)

**Body:**
```json
{
  "reportId": "uuid",
  "markdownDocumentId": "uuid",
  "rawId": "RAW1",
  "dataType": "CS",
  "targetVariables": ["CS0_성분명", "CS1_브랜드명", "CS15_효능효과"]
}
```

### 응답 (Response)

**성공 (200):**
```json
{
  "success": true,
  "data": {
    "extractedData": [
      {
        "variableId": "CS0",
        "variableName": "성분명",
        "dataValue": "토지나메란"
      },
      {
        "variableId": "CS1",
        "variableName": "브랜드명",
        "dataValue": "코미나티주"
      }
    ],
    "conflicts": [
      {
        "variableId": "CS15",
        "reason": "데이터를 찾을 수 없음"
      }
    ]
  }
}
```

### 구현 예시

```typescript
// supabase/functions/extract-data/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { reportId, markdownDocumentId, rawId, dataType, targetVariables } = await req.json()

    // 마크다운 문서 조회
    const { data: markdownDoc } = await supabaseAdmin
      .from('markdown_documents')
      .select('markdown_content')
      .eq('id', markdownDocumentId)
      .single()

    // Gemini API 호출
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'))
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
다음 마크다운 문서에서 지정된 데이터를 추출해주세요.

중요 규칙:
1. 데이터가 없으면 절대 임의로 생성하지 마세요
2. 데이터가 없으면 "conflicts" 배열에 이유와 함께 추가하세요
3. 여러 값이 발견되면 모두 보고하세요

추출할 데이터:
${targetVariables.map(v => `- ${v}`).join('\n')}

문서 내용:
${markdownDoc.markdown_content}

JSON 형식으로 응답:
{
  "extractedData": [
    {
      "variableId": "CS0",
      "variableName": "성분명",
      "dataValue": "값"
    }
  ],
  "conflicts": [
    {
      "variableId": "CS15",
      "reason": "문서에서 데이터를 찾을 수 없음"
    }
  ]
}
`

    const result = await model.generateContent(prompt)
    const response = JSON.parse(result.response.text())

    // DB에 저장
    for (const data of response.extractedData) {
      await supabaseAdmin
        .from('extracted_data')
        .insert({
          report_id: reportId,
          data_type: dataType,
          variable_id: data.variableId,
          variable_name: data.variableName,
          data_value: data.dataValue,
          source_raw_id: rawId,
          extracted_from: markdownDocumentId,
          extracted_by: 'Gemini-2.0-Flash',
          validation_status: 'Validated',
        })
    }

    // Conflict 처리
    for (const conflict of response.conflicts) {
      await supabaseAdmin
        .from('extracted_data')
        .insert({
          report_id: reportId,
          data_type: dataType,
          variable_id: conflict.variableId,
          validation_status: 'Conflict',
        })
    }

    return new Response(
      JSON.stringify({ success: true, data: response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
```

---

## 4. qc-validation

### 용도
작성된 보고서와 원본 소스 문서를 비교하여 QC 검증을 수행합니다.

### 엔드포인트
```
POST /functions/v1/qc-validation
```

### 요청 (Request)

**Body:**
```json
{
  "reportId": "uuid",
  "sections": [
    {
      "sectionId": "uuid",
      "sectionName": "서론",
      "content": "..."
    }
  ]
}
```

### 응답 (Response)

**성공 (200):**
```json
{
  "success": true,
  "data": {
    "validationResult": "passed",
    "issues": [],
    "summary": "모든 검증 통과"
  }
}
```

**검증 실패:**
```json
{
  "success": true,
  "data": {
    "validationResult": "failed",
    "issues": [
      {
        "section": "서론",
        "type": "data_conflict",
        "description": "CS15_효능효과가 원본과 다릅니다",
        "expected": "16세 이상",
        "actual": "12세 이상"
      }
    ],
    "summary": "1개 이슈 발견"
  }
}
```

### 구현 예시

```typescript
// supabase/functions/qc-validation/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { reportId, sections } = await req.json()

    // 원본 마크다운 문서 조회
    const { data: markdownDocs } = await supabaseAdmin
      .from('markdown_documents')
      .select('*')
      .eq('report_id', reportId)

    // 추출된 데이터 조회
    const { data: extractedData } = await supabaseAdmin
      .from('extracted_data')
      .select('*')
      .eq('report_id', reportId)

    // Gemini API 호출 (Thinking 모델 사용)
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'))
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp" })

    const prompt = `
다음 보고서의 QC 검증을 수행해주세요.

검증 항목:
1. 작성된 보고서의 데이터가 원본 소스 문서와 일치하는지
2. CS/PH/Table 데이터가 정확히 삽입되었는지
3. 표 번호가 순차적인지
4. 누락된 섹션이 없는지

원본 마크다운 문서:
${JSON.stringify(markdownDocs, null, 2)}

추출된 데이터:
${JSON.stringify(extractedData, null, 2)}

작성된 보고서 섹션:
${JSON.stringify(sections, null, 2)}

Think step by step. Take your time.

JSON 형식으로 응답:
{
  "validationResult": "passed" | "failed",
  "issues": [
    {
      "section": "섹션명",
      "type": "data_conflict" | "missing_data" | "table_numbering",
      "description": "상세 설명",
      "expected": "예상값",
      "actual": "실제값"
    }
  ],
  "summary": "전체 요약"
}
`

    const result = await model.generateContent(prompt)
    const validation = JSON.parse(result.response.text())

    return new Response(
      JSON.stringify({ success: true, data: validation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
```

---

## 배포 방법

### 1. Supabase CLI 설치

```bash
npm install -g supabase
```

### 2. 로그인

```bash
supabase login
```

### 3. 프로젝트 연결

```bash
supabase link --project-ref your-project-ref
```

### 4. Edge Function 배포

```bash
# 단일 함수 배포
supabase functions deploy classify-raw-id

# 모든 함수 배포
supabase functions deploy
```

### 5. 환경변수 설정

```bash
# Gemini API 키 설정
supabase secrets set GEMINI_API_KEY=your-api-key

# 확인
supabase secrets list
```

---

## 로컬 테스트

### 1. 로컬 Supabase 시작

```bash
supabase start
```

### 2. Edge Function 로컬 실행

```bash
supabase functions serve classify-raw-id --env-file .env.local
```

### 3. 테스트 요청

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/classify-raw-id' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "reportId": "test-uuid",
    "documentId": "test-uuid",
    "fileName": "test.pdf",
    "fileUrl": "https://..."
  }'
```

---

## 클라이언트에서 호출하기

### React 예시

```typescript
// src/lib/api/edgeFunctions.ts
import { supabase } from '../supabase'

export async function classifyRawId(params: {
  reportId: string
  documentId: string
  fileName: string
  fileUrl: string
}) {
  const { data, error } = await supabase.functions.invoke('classify-raw-id', {
    body: params,
  })

  if (error) throw error
  return data
}

export async function convertToMarkdown(params: {
  reportId: string
  sourceDocumentId: string
  rawId: string
  fileUrl: string
  fileName: string
}) {
  const { data, error } = await supabase.functions.invoke('convert-to-markdown', {
    body: params,
  })

  if (error) throw error
  return data
}

export async function extractData(params: {
  reportId: string
  markdownDocumentId: string
  rawId: string
  dataType: 'CS' | 'PH' | 'Table'
  targetVariables: string[]
}) {
  const { data, error } = await supabase.functions.invoke('extract-data', {
    body: params,
  })

  if (error) throw error
  return data
}

export async function qcValidation(params: {
  reportId: string
  sections: Array<{
    sectionId: string
    sectionName: string
    content: string
  }>
}) {
  const { data, error } = await supabase.functions.invoke('qc-validation', {
    body: params,
  })

  if (error) throw error
  return data
}
```

### React Query 활용

```typescript
// src/hooks/useClassifyRawId.ts
import { useMutation } from '@tanstack/react-query'
import { classifyRawId } from '../lib/api/edgeFunctions'

export function useClassifyRawId() {
  return useMutation({
    mutationFn: classifyRawId,
    onSuccess: (data) => {
      console.log('분류 완료:', data)
    },
    onError: (error) => {
      console.error('분류 실패:', error)
    },
  })
}
```

---

## 에러 핸들링

### Edge Function 내부

```typescript
try {
  // 로직
} catch (error) {
  console.error('Error:', error)

  return new Response(
    JSON.stringify({
      success: false,
      error: error.message,
      stack: Deno.env.get('ENVIRONMENT') === 'development' ? error.stack : undefined,
    }),
    {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
}
```

### 클라이언트

```typescript
try {
  const result = await classifyRawId(params)
  if (!result.success) {
    throw new Error(result.error)
  }
  // 성공 처리
} catch (error) {
  toast.error(`분류 실패: ${error.message}`)
}
```

---

## 성능 최적화

### 1. 타임아웃 설정

Edge Functions는 기본 150초 타임아웃이 있습니다. 큰 파일 처리 시 주의:

```typescript
// 파일 크기 제한
if (fileBlob.size > 50 * 1024 * 1024) { // 50MB
  throw new Error('파일이 너무 큽니다')
}
```

### 2. 청크 처리

대량 데이터는 청크로 나눠서 처리:

```typescript
const CHUNK_SIZE = 10
for (let i = 0; i < targetVariables.length; i += CHUNK_SIZE) {
  const chunk = targetVariables.slice(i, i + CHUNK_SIZE)
  // 청크별로 처리
}
```

### 3. 캐싱

동일 요청은 캐시 활용:

```typescript
// Supabase Storage에 중간 결과 캐싱
const cacheKey = `cache/${reportId}/${fileName}`
const { data: cached } = await supabaseAdmin.storage
  .from('markdown')
  .download(cacheKey)

if (cached) {
  return cached
}
```

---

## 모니터링

### Supabase Dashboard에서 확인

1. **Logs**: Edge Functions → 함수 선택 → Logs 탭
2. **Metrics**: 호출 횟수, 에러율, 평균 실행 시간
3. **Invocations**: 최근 호출 내역

### 로깅 추가

```typescript
console.log('[classify-raw-id] 시작:', { fileName, rawId })
console.error('[classify-raw-id] 에러:', error)
console.info('[classify-raw-id] 완료:', { confidence })
```
