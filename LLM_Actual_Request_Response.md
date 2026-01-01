# LLM 실제 요청/응답 구조

## 1. 실제 요청 구조 (Actual Request)

### 1.1 API 설정

```json
{
  "model": "gemini-2.5-flash",
  "generationConfig": {
    "temperature": 0.3,
    "maxOutputTokens": 65536,
    "topP": 0.95
  },
  "contents": [
    {
      "parts": [
        {
          "text": "[아래 프롬프트 전체 텍스트]"
        }
      ]
    }
  ]
}
```

---

### 1.2 프롬프트 전체 텍스트

```
# PSUR 전체 보고서 생성 요청

## 역할
당신은 제약사 약물감시팀 팀장입니다. 한국 식약처에 제출하는 PSUR(Periodic Safety Update Report) 문서를 작성하는 전문가입니다.

---

## 출력 구조

당신은 다음과 같은 **JSON 형식**으로 응답해야 합니다:

```json
{
  "metadata": {
    "generatedAt": "ISO 8601 타임스탬프",
    "model": "gemini-2.5-flash",
    "totalSections": 15,
    "dataSource": {
      "fileCount": 파일개수,
      "rawDataTypes": ["RAW ID 배열"]
    }
  },
  "sections": {
    "00": {
      "id": "00",
      "title": "표지",
      "content": "섹션 00의 마크다운 내용 (전체)",
      "wordCount": 단어수,
      "status": "completed"
    },
    "01": {
      "id": "01",
      "title": "목차",
      "content": "섹션 01의 마크다운 내용 (전체)",
      "wordCount": 단어수,
      "status": "completed"
    },
    "02": { ... },
    "03": { ... },
    "04": { ... },
    "05": { ... },
    "06": { ... },
    "07": { ... },
    "08": { ... },
    "09": { ... },
    "10": { ... },
    "11": { ... },
    "12": { ... },
    "13": { ... },
    "14": { ... }
  },
  "mergedReport": {
    "content": "15개 섹션이 병합된 전체 보고서 마크다운 내용",
    "totalWordCount": 전체단어수,
    "sectionOrder": ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14"]
  },
  "validation": {
    "allSectionsComplete": true,
    "variablesReplaced": {
      "CS0_성분명": true,
      "CS1_브랜드명": true,
      "CS2_회사명": true,
      ... (모든 CS 변수)
    },
    "warnings": [],
    "errors": []
  }
}
```

**중요**: 응답은 반드시 위 JSON 구조를 정확히 따라야 하며, 다른 텍스트나 설명 없이 오직 JSON만 출력하십시오.

---

## 섹션별 보고서 작성 규칙

### 1. 구조

각 섹션은 다음 형식을 따릅니다:

```
## [섹션 번호]. [섹션명]

[섹션 내용]

---
```

### 2. 제약사항

1. **길이 제약**
   - 제공된 예시 파일의 길이를 기준으로 작성
   - 예시 대비 ±30% 범위 내에서 작성
   - 과도하게 짧거나 길게 작성하지 않음

2. **구조 유지**
   - 예시 파일의 헤딩 레벨 구조 유지
   - 표가 있는 경우 동일한 컬럼 구조 사용
   - 목록 형식 및 번호 매기기 방식 유지

3. **문구 스타일**
   - 예시 파일의 문체와 어투를 최대한 유사하게 작성
   - 전문 용어 사용 방식 유지
   - 문장 길이와 복잡도를 유사하게 유지

4. **변수 치환**
   - 모든 [CS*] 변수는 원시 데이터에서 추출한 값으로 정확히 치환
   - 변수 값을 찾을 수 없는 경우 validation.errors에 기록

### 3. 금지사항

- 이모티콘 사용 금지
- 불필요한 설명이나 주석 추가 금지
- 예시에 없는 새로운 섹션 추가 금지

---

## 전체 통합 보고서 작성 규칙

### 1. 병합 구조

```
# PSUR 최종 보고서

**생성일시**: [YYYY-MM-DD HH:mm:ss]
**제품명**: [CS1_브랜드명]([CS0_성분명])
**보고기간**: [CS3_보고시작날짜] ~ [CS4_보고종료날짜]

---

[섹션 00 내용]

---

[섹션 01 내용]

---

[섹션 02 내용]

---

... (섹션 03~13)

---

[섹션 14 내용]

---
```

### 2. 제약사항

1. 섹션 순서: 반드시 00 → 01 → 02 → ... → 14 순서로 병합
2. 구분자: 각 섹션 사이에 `---` 삽입
3. 섹션 누락 금지
4. 표지에 메타데이터 포함

---

## 데이터 정의서

### CS 데이터 정의 (CS Data Definition)

아래 변수들을 원시 데이터에서 추출하여 사용하십시오.

#### [CS0_성분명]

- **Variable ID**: [CS0]
- **Variable Name**: 성분명
- **Data Type**: text
- **추출 방법**: 원시 데이터에서 의약품의 성분명 추출

#### 예시

## Example 1
infliximab

## Example 2
메만틴염산염

---

#### [CS1_브랜드명]

- **Variable ID**: [CS1]
- **Variable Name**: 브랜드명
- **Data Type**: text
- **추출 방법**: 원시 데이터에서 제품의 브랜드명 추출

#### 예시

## Example 1
Remsima

## Example 2
글리빅사

---

#### [CS2_회사명]

- **Variable ID**: [CS2]
- **Variable Name**: 회사명
- **Data Type**: text
- **추출 방법**: 원시 데이터에서 제조/판매 회사명 추출

#### 예시

## Example 1
셀트리온

## Example 2
주식회사 아큐젠

---

#### [CS3_보고시작날짜]

- **Variable ID**: [CS3]
- **Variable Name**: 보고시작날짜
- **Data Type**: Date(YYYY년 MM월 DD일)
- **추출 방법**: CS4_보고종료날짜로부터 5년 전 날짜 계산

#### 예시

## Example 1
2019년 12월 31일

---

#### [CS4_보고종료날짜]

- **Variable ID**: [CS4]
- **Variable Name**: 보고종료날짜
- **Data Type**: Date(YYYY년 MM월 DD일)
- **추출 방법**: 원시 데이터에서 자료마감일(DLP) 추출

#### 예시

## Example 1
2024년 12월 31일

---

#### [CS5_국내허가일자]

- **Variable ID**: [CS5]
- **Variable Name**: 국내허가일자
- **Data Type**: Date(YYYY년 MM월 DD일)
- **추출 방법**: 원시 데이터에서 한국 허가일자 추출

#### 예시

## Example 1
2018년 11월 10일

---

[... 나머지 CS 변수들 (CS6 ~ CS60) ...]

---

## 템플릿

### 섹션 00: 표지

```
# "[CS1_브랜드명]([CS0_성분명])"

**[CS2_회사명]**

---

**보고기간:** [CS3_보고시작날짜] ~ [CS4_보고종료날짜]
**국내허가일자:** [CS5_국내허가일자]
**보고서제출일:** [CS6_보고서제출일]
**버전(작성일):** v.[CS7_버전넘버] ([CS8_버전날짜])

---
```

---

### 섹션 01: 목차

```
## 목차

- [1. 서론](#1-서론)
- [2. 전세계 판매 허가 현황](#2-전세계-판매-허가-현황)
- [3. 안전성 이유로 인한 보고기간 동안의 조치](#3-안전성-이유로-인한-보고기간-동안의-조치)
- [4. 안전성 정보 참고 정보의 변경](#4-안전성-정보-참고-정보의-변경)
- [5. 환자노출](#5-환자노출)
- [6. 개별 증례 병력(individual case history) 소개](#6-개별-증례-병력individual-case-history-소개)
- [7. 시험](#7-시험)
- [8. 기타 정보](#8-기타-정보)
- [9. 종합적인 안전성 평가](#9-종합적인-안전성-평가)
- [10. 결론](#10-결론)
- [참고문헌](#참고문헌)
- [별첨](#별첨)

## 표목차

- [표 1. 전 세계 판매 허가 현황](#표-1-전-세계-판매-허가-현황)
- [표 2. 연도별 판매량](#표-2-연도별-판매량)
- [표 3. 연평균 환자 노출](#표-3-연평균-환자-노출)
... (나머지 표 목록)

---
```

---

[... 섹션 02~14 템플릿 ...]

---

## 예시

### 섹션 00 예시: 표지

## Example 1

```
# "글리빅사(메만틴염산염)"

**주식회사 아큐젠**

---

**보고기간:** 2019년 12월 31일 ~ 2024년 12월 31일
**국내허가일자:** 2018년 11월 10일
**보고서제출일:** 2025년 01월 31일
**버전(작성일):** v.1.0 (2024.12.31)

---
```

---

### 섹션 01 예시: 목차

## Example 1

```
## 목차

- [1. 서론](#1-서론)
- [2. 전세계 판매 허가 현황](#2-전세계-판매-허가-현황)
... (전체 목차)

## 표목차

- [표 1. 전 세계 판매 허가 현황](#표-1-전-세계-판매-허가-현황)
... (전체 표 목록)

---
```

---

[... 섹션 02~14 예시 ...]

---

## 원시 데이터

아래는 보고서 생성에 사용할 실제 데이터입니다.

### 통합 원시자료

생성 시간: 2026-01-01T01:34:53.386Z
파일 수: 25

---

#### [RAW1] RAW1.1_최신첨부문서_예시1.pdf

# RAW1.1_최신첨부문서_예시1.pdf

> 자동 변환됨 (2026-01-01T01:34:50.834Z)

[PDF 파일 내용 또는 텍스트 추출 결과]

---

#### [RAW2.1] RAW2.1_용법용량_예시1.pdf

# RAW2.1_용법용량_예시1.pdf

> 자동 변환됨 (2026-01-01T01:34:50.834Z)

[PDF 파일 내용 또는 텍스트 추출 결과]

---

[... 나머지 RAW 파일들 (총 25개) ...]

---

## 작업 지시

1. 위 원시 데이터에서 모든 CS 변수 값을 추출하십시오.
2. 추출한 값으로 각 섹션(00~14)을 개별적으로 생성하십시오.
3. 각 섹션은 제공된 템플릿과 예시를 참고하되, 예시의 길이(±30%)와 구조를 유지하십시오.
4. 15개 섹션을 순서대로 병합하여 전체 통합 보고서를 생성하십시오.
5. 위에 정의된 JSON 구조로 응답하십시오.
6. JSON 외 다른 텍스트나 설명을 출력하지 마십시오.

```

---

## 2. 실제 응답 구조 (Actual Response)

### 2.1 JSON 응답 형식

LLM은 다음과 같은 순수 JSON 형식으로 응답합니다:

```json
{
  "metadata": {
    "generatedAt": "2026-01-01T10:34:53.466Z",
    "model": "gemini-2.5-flash",
    "totalSections": 15,
    "dataSource": {
      "fileCount": 25,
      "rawDataTypes": [
        "RAW1",
        "RAW2.1",
        "RAW2.2",
        "RAW2.3",
        "RAW2.6",
        "RAW3",
        "RAW4",
        "RAW5.1",
        "RAW6",
        "RAW7.1",
        "RAW8",
        "RAW9",
        "RAW12",
        "RAW13",
        "RAW14",
        "RAW15"
      ]
    }
  },
  "sections": {
    "00": {
      "id": "00",
      "title": "표지",
      "content": "# \"글리빅사(메만틴염산염)\"\n\n**주식회사 아큐젠**\n\n---\n\n**보고기간:** 2019년 12월 31일 ~ 2024년 12월 31일\n**국내허가일자:** 2018년 11월 10일\n**보고서제출일:** 2025년 01월 31일\n**버전(작성일):** v.1.0 (2024.12.31)\n\n---",
      "wordCount": 45,
      "status": "completed"
    },
    "01": {
      "id": "01",
      "title": "목차",
      "content": "## 목차\n\n- [1. 서론](#1-서론)\n- [2. 전세계 판매 허가 현황](#2-전세계-판매-허가-현황)\n- [3. 안전성 이유로 인한 보고기간 동안의 조치](#3-안전성-이유로-인한-보고기간-동안의-조치)\n- [4. 안전성 정보 참고 정보의 변경](#4-안전성-정보-참고-정보의-변경)\n- [5. 환자노출](#5-환자노출)\n- [6. 개별 증례 병력(individual case history) 소개](#6-개별-증례-병력individual-case-history-소개)\n- [7. 시험](#7-시험)\n- [8. 기타 정보](#8-기타-정보)\n- [9. 종합적인 안전성 평가](#9-종합적인-안전성-평가)\n- [10. 결론](#10-결론)\n- [참고문헌](#참고문헌)\n- [별첨](#별첨)\n\n## 표목차\n\n- [표 1. 전 세계 판매 허가 현황](#표-1-전-세계-판매-허가-현황)\n- [표 2. 연도별 판매량](#표-2-연도별-판매량)\n- [표 3. 연평균 환자 노출](#표-3-연평균-환자-노출)\n- [표 4. 각 증례의 병력 소개](#표-4-각-증례의-병력-소개)\n- [표 5. 신속보고 내역](#표-5-신속보고-내역)\n- [표 6. 정기보고 내역](#표-6-정기보고-내역)\n- [표 7. KIDS 원시자료 내역](#표-7-kids-원시자료-내역)\n- [표 8. 보고기간 동안 보고된 모든 이상사례 건수](#표-8-보고기간-동안-보고된-모든-이상사례-건수)\n- [표 9. 보고기간 동안 보고된 모든 이상사례에 대한 기관계분류(SOC)별 건수](#표-9-보고기간-동안-보고된-모든-이상사례에-대한-기관계분류soc별-건수)\n\n---",
      "wordCount": 180,
      "status": "completed"
    },
    "02": {
      "id": "02",
      "title": "약어설명",
      "content": "## 약어 설명\n\n| 약어 | 약어 설명 (영문) | 약어 설명 (국문) |\n|------|------------------|------------------|\n| KIDS | Korea Institute of Drug Safety and Risk Management | 한국의약품안전관리원 |\n| SOC | System Organ Class | 기관계분류 |\n| PT | Preferred Term | 우선용어 |\n| MedDRA | Medical Dictionary for Regulatory Activities | 의학용어 규제활동 사전 |\n| DHPC | Direct Healthcare Professional Communication | 의료전문가 직접 서한 |\n| CLS | Capillary Leak Syndrome | 모세혈관 누출 증후군 |\n| GBS | Guillain-Barré Syndrome | 길랭-바레 증후군 |\n| CVST | Cerebrovascular Sinus Thrombosis | 뇌혈관 정맥동 혈전증 |\n| RMP | Risk Management Plan | 위험 관리 계획 |\n| FDA | Food and Drug Administration | 미국 식품의약국 |\n| EMA | European Medicines Agency | 유럽 의약품청 |\n| PMDA | Pharmaceuticals and Medical Devices Agency | 일본 의약품의료기기종합기구 |\n\n---",
      "wordCount": 95,
      "status": "completed"
    },
    "03": {
      "id": "03",
      "title": "서론",
      "content": "## 1. 서론\n\n본 문서는 주식회사 아큐젠의 \"글리빅사(메만틴염산염)\"의 품목 갱신을 위한 유효기간 동안 수집된 안전관리자료에 대한 분석·평가 결과 및 안전관리조치에 관한 보고서이다.\n\n본 보고서는 식품의약품안전처에서 발간한 '정기적인 유익성-위해성 평가보고에 관한 가이드라인(2017)' 및 '의약품의 위해성관리계획 가이드라인(2021)'을 참고하여 작성되었다.\n\n\"글리빅사(메만틴염산염)\"의 품목허가일은 2018년 11월 10일이며, 유효기간은 2025년 11월 09일이다. 본 보고서는 2022년 12월 29일 개정된 '의약품 품목 갱신에 관한 규정'(식약처 고시)에 따라 갱신 신청 자료 중 하나인 '유효기간 동안 수집된 안전관리에 관한 자료 및 조치계획'을 보고하기 위해 작성된 보고서이며, 본 보고서에 포함되는 자료는 ｢약사법｣ 에 따라 식약처장이 정하여 고시한 유효기간을 기준으로 하였다.\n\n\"글리빅사(메만틴염산염)\"의 품목의 유효기간은 2025년 11월 09일이고, 품목갱신 신청기한은 6개월 전인 2025년 05월 09일이므로 보고서 작성 기간을 고려하여 자료마감일을 2024년 12월 31일로하고 해당일로부터 최근 5년 자료를 포함하였다. 따라서 본 보고서는 2019년 12월 31일부터 2024년 12월 31일까지 주식회사 아큐젠이 수집한 \"글리빅사(메만틴염산염)\"에 대한 안전성 자료를 분석·평가하였다.\n\n\"글리빅사(메만틴염산염)\"의 주성분은 메만틴염산염으로 효능·효과는 알츠하이머병 치료이다. 용법·용량은 1일 1회 10mg 경구 투여이다.\n\n---",
      "wordCount": 320,
      "status": "completed"
    },
    "04": {
      "id": "04",
      "title": "전세계판매허가현황",
      "content": "[섹션 04 전체 내용...]",
      "wordCount": 250,
      "status": "completed"
    },
    "05": {
      "id": "05",
      "title": "안전성조치",
      "content": "[섹션 05 전체 내용...]",
      "wordCount": 420,
      "status": "completed"
    },
    "06": {
      "id": "06",
      "title": "안전성정보참고정보변경",
      "content": "[섹션 06 전체 내용...]",
      "wordCount": 380,
      "status": "completed"
    },
    "07": {
      "id": "07",
      "title": "환자노출",
      "content": "[섹션 07 전체 내용...]",
      "wordCount": 290,
      "status": "completed"
    },
    "08": {
      "id": "08",
      "title": "개별증례병력",
      "content": "[섹션 08 전체 내용...]",
      "wordCount": 1850,
      "status": "completed"
    },
    "09": {
      "id": "09",
      "title": "시험",
      "content": "[섹션 09 전체 내용...]",
      "wordCount": 180,
      "status": "completed"
    },
    "10": {
      "id": "10",
      "title": "기타정보",
      "content": "[섹션 10 전체 내용...]",
      "wordCount": 120,
      "status": "completed"
    },
    "11": {
      "id": "11",
      "title": "종합적인안전성평가",
      "content": "[섹션 11 전체 내용...]",
      "wordCount": 380,
      "status": "completed"
    },
    "12": {
      "id": "12",
      "title": "결론",
      "content": "[섹션 12 전체 내용...]",
      "wordCount": 240,
      "status": "completed"
    },
    "13": {
      "id": "13",
      "title": "참고문헌",
      "content": "[섹션 13 전체 내용...]",
      "wordCount": 85,
      "status": "completed"
    },
    "14": {
      "id": "14",
      "title": "별첨",
      "content": "[섹션 14 전체 내용...]",
      "wordCount": 650,
      "status": "completed"
    }
  },
  "mergedReport": {
    "content": "# PSUR 최종 보고서\n\n**생성일시**: 2026-01-01 10:34:53\n**제품명**: 글리빅사(메만틴염산염)\n**보고기간**: 2019년 12월 31일 ~ 2024년 12월 31일\n\n---\n\n# \"글리빅사(메만틴염산염)\"\n\n**주식회사 아큐젠**\n\n---\n\n**보고기간:** 2019년 12월 31일 ~ 2024년 12월 31일\n**국내허가일자:** 2018년 11월 10일\n**보고서제출일:** 2025년 01월 31일\n**버전(작성일):** v.1.0 (2024.12.31)\n\n---\n\n---\n\n## 목차\n\n- [1. 서론](#1-서론)\n...(전체 목차 내용)\n\n---\n\n## 약어 설명\n\n| 약어 | 약어 설명 (영문) | 약어 설명 (국문) |\n...(전체 약어 내용)\n\n---\n\n## 1. 서론\n\n본 문서는 주식회사 아큐젠의...(전체 서론 내용)\n\n---\n\n...(섹션 04~13 전체 내용)\n\n---\n\n## 별첨\n\n...(전체 별첨 내용)\n\n---",
    "totalWordCount": 8540,
    "sectionOrder": [
      "00",
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
      "13",
      "14"
    ]
  },
  "validation": {
    "allSectionsComplete": true,
    "variablesReplaced": {
      "CS0_성분명": true,
      "CS1_브랜드명": true,
      "CS2_회사명": true,
      "CS3_보고시작날짜": true,
      "CS4_보고종료날짜": true,
      "CS5_국내허가일자": true,
      "CS6_보고서제출일": true,
      "CS7_버전넘버": true,
      "CS8_버전날짜": true,
      "CS13_유효기간": true,
      "CS14_신청기한": true,
      "CS15_효능효과": true,
      "CS16_용법용량": true,
      "CS17_허가현황": true
    },
    "warnings": [
      "섹션 08: 예시 대비 길이 35% 초과 (예시: 1350자, 생성: 1850자)"
    ],
    "errors": []
  }
}
```

---

## 3. JavaScript 처리 코드

### 3.1 요청 전송

```javascript
async function sendLLMRequest(rawData) {
  // 1. 프롬프트 구성
  const prompt = buildPrompt(rawData);

  // 2. API 요청
  const apiKey = localStorage.getItem('GOOGLE_API_KEY');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 65536,
      topP: 0.95
    }
  };

  // 3. 요청 전송
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();

  // 4. 응답 텍스트 추출
  const responseText = data.candidates[0].content.parts[0].text;

  // 5. JSON 파싱
  const parsedResponse = JSON.parse(responseText);

  return parsedResponse;
}
```

### 3.2 응답 처리

```javascript
function processLLMResponse(response) {
  // 1. 메타데이터 확인
  console.log('생성 시각:', response.metadata.generatedAt);
  console.log('파일 개수:', response.metadata.dataSource.fileCount);

  // 2. 섹션별 저장
  const sections = response.sections;
  for (const [id, section] of Object.entries(sections)) {
    console.log(`섹션 ${id}: ${section.title} (${section.wordCount}자)`);

    // localStorage에 저장
    localStorage.setItem(`section_${id}`, section.content);
    localStorage.setItem(`section_${id}_meta`, JSON.stringify({
      title: section.title,
      wordCount: section.wordCount,
      status: section.status
    }));
  }

  // 3. 전체 보고서 저장
  localStorage.setItem('mergedReport', response.mergedReport.content);
  localStorage.setItem('mergedReport_meta', JSON.stringify({
    totalWordCount: response.mergedReport.totalWordCount,
    sectionOrder: response.mergedReport.sectionOrder
  }));

  // 4. 검증 결과 확인
  const validation = response.validation;

  if (!validation.allSectionsComplete) {
    console.error('일부 섹션 생성 실패');
  }

  if (validation.warnings.length > 0) {
    console.warn('경고:', validation.warnings);
  }

  if (validation.errors.length > 0) {
    console.error('오류:', validation.errors);
  }

  // 5. 변수 치환 확인
  const unReplacedVars = Object.entries(validation.variablesReplaced)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (unReplacedVars.length > 0) {
    console.warn('치환되지 않은 변수:', unReplacedVars);
  }

  return {
    success: validation.allSectionsComplete && validation.errors.length === 0,
    sections: sections,
    mergedReport: response.mergedReport.content,
    warnings: validation.warnings,
    errors: validation.errors
  };
}
```

### 3.3 개별 섹션 접근

```javascript
function getSection(sectionId) {
  const content = localStorage.getItem(`section_${sectionId}`);
  const meta = JSON.parse(localStorage.getItem(`section_${sectionId}_meta`));

  return {
    id: sectionId,
    title: meta.title,
    content: content,
    wordCount: meta.wordCount,
    status: meta.status
  };
}

function getMergedReport() {
  const content = localStorage.getItem('mergedReport');
  const meta = JSON.parse(localStorage.getItem('mergedReport_meta'));

  return {
    content: content,
    totalWordCount: meta.totalWordCount,
    sectionOrder: meta.sectionOrder
  };
}
```

---

## 4. 요약

### 4.1 요청 구조

1. **API 설정**: temperature=0.3, maxOutputTokens=65536
2. **프롬프트 내용**:
   - 역할 정의
   - JSON 응답 구조 명시
   - 섹션별/전체 보고서 작성 규칙
   - 데이터 정의서 (CS 변수)
   - 템플릿
   - 예시 (Example 1, Example 2 형식)
   - 원시 데이터 (25개 파일)
   - 작업 지시

### 4.2 응답 구조

1. **JSON 형식**만 출력 (다른 텍스트 없음)
2. **필수 필드**:
   - `metadata`: 생성 정보
   - `sections`: 15개 섹션 개별 데이터
   - `mergedReport`: 전체 통합 보고서
   - `validation`: 검증 결과 (warnings, errors)

### 4.3 처리 흐름

```
요청 → LLM 처리 → JSON 응답 → 파싱 → 검증 → 저장 → UI 표시
```
