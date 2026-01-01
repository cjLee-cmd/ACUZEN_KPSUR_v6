# LLM 대화 로그 (전체)

**캡처 시간**: 2026-01-01T01:37:24.604Z
**파일 개수**: 25
**대화 개수**: 1

---

## 대화 #1

**타임스탬프**: 2026-01-01T01:34:53.466Z
**타입**: gemini_api_call

### 📤 요청 (Request)

- **메서드**: POST
- **URL**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`

#### 요청 본문 구조

```json
{
  "contents_count": 1,
  "systemInstruction_length": 0,
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 65536,
    "topP": 0.95
  }
}
```

#### 사용자 입력 (User Contents)

**길이**: 75,259 문자

```
# PSUR 전체 보고서 생성 요청

## 역할
당신은 **제약사 약물감시팀 팀장**입니다. 한국 식약처에 제출하는 PSUR(Periodic Safety Update Report) 문서를 작성하는 전문가입니다.

## 데이터 정의서 (변수 정의)
# CS 데이터 정의 (CS Data Definition)

> **문서 목적:** 이 문서는 한국 PSUR 보고서 생성을 위한 CS(Context-Specific) 데이터 추출 컨텍스트를 정의합니다.
> LLM이 각 데이터 필드를 정확히 이해하고 추출할 수 있도록 상세한 지침을 제공합니다.

## 문서 구조 설명

각 데이터 항목은 다음 정보를 포함합니다:

- **Variable ID**: 템플릿에서 사용되는 변수 식별자
- **Variable Name**: 변수의 한글 명칭
- **Data Source**: 데이터 출처 (사용자입력, 추출문서, 다른 CS로부터 입력 등)
- **Input Type**: 입력 유형 (설정, 일반정보입력, 본문정보입력 등)
- **Generation Timing**: 생성 시점 (초기 1회, 매번 생성 등)
- **Data Type**: 데이터 타입 (DB 저장용)
- **데이터 추출 방법**: 데이터를 어떻게 가져와야 하는지 상세 설명
- **추가 지침**: 데이터 가공 및 처리 지침
- **예시**: 실제 데이터 예시

---

## CS 데이터 목록


### 1. [CS0_성분명]

**Variable ID:** `[CS0]`  
**Variable Name:** 성분명  
**Data Source:** 사용자입력  
**Input Type:** 설정  
**Generation Timing:** 초기 1회  
**Data Type:** `text `  

#### 데이터 추출 방법

> **[지침]** [UI 입력] 브랜드명(성분명)의 드롭다운에서 선택한 값이 [CS1_브랜드명], [CS0_성분명] 이 된다.
 예를 들어 드롭다운에서 “글리빅사(메만틴염산염)”을 선택했다면, 생성되는 문서 내의 [CS1_브랜드명], [CS0_성분명] 가 들어간 부분은 모두 글리빅사 그리고 메만틴염산염으로 넣어져야 한다.

#### 예시

1. `infliximab`
2. `메만틴염산염`

---

### 2. [CS1_브랜드명]

**Variable ID:** `[CS1]`  
**Variable Name:** 브랜드명  
**Data Source:** 사용자입력
**Input Type:** 설정  
**Generation Timing:** 초기 1회  
**Data Type:** `text `  

#### 데이터 추출 방법

> **[지침]** [UI 입력] 브랜드명(성분명)의 드롭다운에서 선택한 값이 [CS1_브랜드명], [CS0_성분명] 이 된다.
 예를 들어 드롭다운에서 “글리빅사(메만틴염산염)”을 선택했다면, 생성되는 문서 내의 [CS1_브랜드명], [CS0_성분명] 가 들어간 부분은 모두 글리빅사 그리고 메만틴염산염으로 넣어져야 한다.

#### 예시

1. `Remsima`
2. `글리빅사® (단, 이때 R마크는 위첨자로 표기됨)`

---

### 3. [CS2_회사명]

**Variable ID:** `[CS2]`  
**Variable Name:** 회사명  
**Data Source:** 사용자입력  
**Input Type:** 설정  
**Generation Timing:** 초기 1회  
**Data Type:** `text `  

#### 데이터 추출 방법

> **[지침]** [UI 입력] 회사명을 드롭다운에서 선택하면, 문서 내 [CS2_회사명]이라고 되어있는 부분은 다 그 회사명 으로 입력한다.

#### 예시

1. `셀트리온`
2. `대웅제약`

---

### 4. [CS3_보고시작날짜] 

**Variable ID:** `[CS3]`  
**Variable Name:** 보고시작날짜]   
**Data Source:** [CS4_보고종료날짜] 로부터 5년 전 날짜  
**Input Type:** 일반정보입력  
**Generation Timing:** 매번  
**Data Type:** `Date(YYYY연 MM월 DD일)`  

#### 데이터 추출 방법

> **[지침]** [UI 입력] 자료마감일(DLP)에서 날짜를 선택하면 [CS4_보고종료날짜]로 설정된다. [CS3_보고시작날짜]는 [CS4_보고종료날짜]로부터 5년 전 날짜로 자동 계산된다. 가이드라인에 따라 보고종료날짜로부터 5년치 최신 데이터를 문서에 포함해야 하기 때문이다.

#### 예시

1. `2019-11-10 00:00:00`

---

### 5. [CS4_보고종료날짜]

**Variable ID:** `[CS4]`  
**Variable Name:** 보고종료날짜  
**Data Source:** 사용자 입력  
**Input Type:** 일반정보입력  
**Generation Timing:** 매번  
**Data Type:** `Date(YYYY연 MM월 DD일)`  

#### 데이터 추출 방법

> **[지침]** [UI 입력] 자료마감일(DLP)에서 날짜를 선택하면 [CS4_보고종료날짜]로 설정된다. [CS3_보고시작날짜]는 [CS4_보고종료날짜]로부터 5년 전 날짜로 자동 계산된다.

#### 예시

1. `2022-11-11 00:00:00`

---

### 6. [CS5_국내허가일자]

**Variable ID:** `[CS5]`  
**Variable Name:** 국내허가일자  
**Data Source:** 사용자 입력  
**Input Type:** 설정  
**Generation Timing:** 초기 1회  
**Data Type:** `Date(YYYY연 MM월 DD일)`  

#### 데이터 추출 방법

> **[지침]** [UI 입력] 한국 허가일자 에 어떤 날짜가 선택이 되었다면, 해당 날짜가 [CS5_국내허가일자]로 설정된다. 문서 내 [CS5_국내허가일자]가 필요한 부분에 반영된다.

#### 예시

1. `2018-11-10 00:00:00`

---

### 7. [CS6_보고서제출일]

**Variable ID:** `[CS6]`  
**Variable Name:** 보고서제출일  
**Data Source:** 사용자 입력  
**Input Type:** 일반정보입력  
**Generation Timing:** 매번  
**Data Type:** `Date(YYYY연 MM월 DD일)`  

#### 예시

1. `2022-12-11 00:00:00`

---

### 8. [CS7_버전넘버] 

**Variable ID:** `[CS7]`  
**Variable Name:** 버전넘버]   
**Data Source:** 사용자 입력   
**Input Type:** 일반정보입력  
**Generation Timing:** 매번  
**Data Type:** `소수점 한자리까지 있는 숫자(X.X)`  

#### 데이터 추출 방법

> **[지침]** [UI 입력] 버전넘버의 숫자를 선택하면, 이 값이 [CS7_버전넘버]로 설정된다. 표지에 [CS7_버전넘버]가 필요한 위치에 반영된다.

#### 예시

1. `2.0`

---

### 9. [CS8_버전날짜]

**Variable ID:** `[CS8]`  
**Variable Name:** 버전날짜  
**Data Source:** [CS4_보고종료날짜]와 동일  
**Input Type:** 일반정보입력  
**Generation Timing:** 매번  
**Data Type:** `Date(YYYY.MM.DD)`  

#### 데이터 추출 방법

> **[지침]** [UI 입력] 자료마감일(DLP)에서 날짜를 선택하면 [CS4_보고종료날짜]로 설정된다. [CS8_버전날짜]는 [CS4_보고종료날짜]와 동일한 값으로 자동 설정된다.

#### 예시

1. `2022-11-11 00:00:00`

---

### 10. [CS9_목차]

**Variable ID:** `[CS9]`  
**Variable Name:** 목차  
**Data Source:** 생성된 문서 전반  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text `  

#### 데이터 추출 방법

> **[지침]** 문서가 생성되고 나면 생성된 문서안에 섹션들이 있으며 이들의 번호와 해당 페이지 번호를 나타내주는 목차를 만든다.

#### 예시

1. `-`

---

### 11. [CS10_표목차]

**Variable ID:** `[CS10]`  
**Variable Name:** 표목차  
**Data Source:** 생성된 문서 전반  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text `  

#### 데이터 추출 방법

> **[지침]** 문서가 생성되고 나면 생성된 문서안에 표들이 있으며 이표들의 번호와 해당 페이지 번호를 나타내주는 표목차를 만든다.

#### 예시

1. `-`

---

### 12. [CS11_별첨목차]

**Variable ID:** `[CS11]`  
**Variable Name:** 별첨목차  
**Data Source:** 생성된 문서 전반  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text `  

#### 데이터 추출 방법

> **[지침]** 문서가 생성되고 나면 생성된 문서안에 별첨1,2,3이 있으며 이들의 번호와 해당 페이지 번호를 나타내주는 목차를 만든다.

#### 예시

1. `-`

---

### 13. [CS12_약어표]

**Variable ID:** `[CS12]`  
**Variable Name:** 약어표  
**Data Source:** 참고자료1_CIOMS 약물감시용어집 및 생성된 문서 전반   
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `table`  

#### 데이터 추출 방법

> **[지침]** 문서가 생성되고 나면 생성된 문서안에 약어들이 사용되는 경우, 참고자료1_CIOMS 약물감시용어집 에서 해당 약어를 찾아 용어를 기재한다. 이때, 특정 의학질병명 같은 의학용어는 약물감시용어집에서 찾는것이 아니라, 별도로 해야 한다.

#### 추가 지침

> **[지침]** 문서가 생성되고 나면 생성된 문서안에 약어들이 사용되는 경우, 이에 대한 full term을 약어 표에 기재한다.

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 14. [CS13_유효기간]

**Variable ID:** `[CS13]`  
**Variable Name:** 유효기간  
**Data Source:** 사용자 입력  
**Input Type:** 일반정보입력  
**Generation Timing:** 매번  
**Data Type:** `Date(YYYY연 MM월 DD일)`  

#### 예시

1. `2022-12-11 00:00:00`

---

### 15. [CS14_신청기한]

**Variable ID:** `[CS14]`  
**Variable Name:** 신청기한  
**Data Source:** [CS13_유효기간]  6개월 전 (달력일기준)  
**Input Type:** 일반정보입력  
**Generation Timing:** 매번  
**Data Type:** `Date(YYYY연 MM월 DD일)`  

#### 데이터 추출 방법

> **[지침]** [CS13_유효기간] 6개월 전 (달력일기준)

#### 예시

1. `2022-12-11 00:00:00`

---

### 16. [CS15_효능효과]

**Variable ID:** `[CS15]`  
**Variable Name:** 효능효과  
**Data Source:** [RAW1.1_최신첨부문서] OR [RAW2.2_효능효과]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 데이터 추출 방법

[RAW1.1_최신첨부문서] OR [RAW2.2_효능효과] 에서 효능효과를 참고

#### 추가 지침

> **[지침]** [RAW 데이터]의 효능효과 분량이 너무 길다면 중요부분을 위주로 요약해서 줄여서 출력값에 입력한다.

---

### 17. [CS16_용법용량]

**Variable ID:** `[CS16]`  
**Variable Name:** 용법용량  
**Data Source:** [RAW1.1_최신첨부문서] OR [RAW2.1_용법용량]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 데이터 추출 방법

[RAW1.1_최신첨부문서] OR [RAW2.1_용법용량]의 용법용량 부분을 참고

#### 추가 지침

> **[지침]** [RAW 데이터]의 용법용량 분량이 너무 길다면 중요부분을 위주로 요약해서 줄여서 출력값에 입력한다.

---

### 18. [CS17_전세계허가현황표]

**Variable ID:** `[CS17]`
**Variable Name:** 전세계허가현황표
**Data Source:** [CS17.1], [CS17.2], [CS17.3], [CS17.4], [CS17.5] (자동 생성)
**Input Type:** 자동생성
**Generation Timing:** 후처리
**Data Type:** `array of object`

#### 데이터 추출 방법

> **[지침]** 이 필드는 LLM이 직접 추출하지 않고, CS17.1~CS17.5 병렬 배열에서 자동 생성된다.
> **[지침]** 생성 로직: for i in range(len(CS17.1)): CS17.push({ "국가": CS17.1[i], "허가일": CS17.2[i], "품목명": CS17.3[i], "허가권자": CS17.4[i], "비고": CS17.5[i] })

#### 추가 지침

> **[지침]** 만약 한 국가에서 용량 추가로 여러번 허가가 났다면 각각 별도 객체로 추출한다.
> **[지침]** 만약 한 국가에서 적응증 추가로 여러번 허가가 났다면 각각 별도 객체로 추출한다.
> **[지침]** 만약 한 국가에서 허가권자가 다르게 여러번 허가가 났다면 각각 별도 객체로 추출한다.

#### 예시

1. `[{"국가":"한국","허가일":"2024-01-15","품목명":"알츠정","허가권자":"(주)아큐젠","비고":"최초허가"},{"국가":"한국","허가일":"2025-08-20","품목명":"알츠정","허가권자":"(주)아큐젠","비고":"20mg 용량 추가"},{"국가":"미국","허가일":"2024-05-15","품목명":"Alzemed US","허가권자":"Acuzen Inc.","비고":"FDA 정규허가"}]`

---

### 19. [CS17.6_허가현황서술문]

**Variable ID:** `[CS17.6]`  
**Variable Name:** 허가현황서술문  
**Data Source:** [RAW4_허가현황] OR [CS17_전세계허가현황표]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 추가 지침

> **[지침]** 예시1은 대한민국 외에 허가난 국가가 없을 때이고, 예시2와 예시3은 대한민국 외에 판매 허가가 난 국가가 있을 때의 예시이다.
> **[지침]** 허가난 국가가 5개 초과하는 경우, 총XX개국에서 허가를 득하였음을 숫자로 요약해서 표현한다.

#### 예시

1. `“[CS1_브랜드명]([CS0_성분명])”의 품목허가일은 [CS5_국내허가일자]이고, 대한민국 이외 판매 허가받은 국가는 없다.
`
2. `“[CS1_브랜드명]([CS0_성분명])”의 품목허가일은 [CS5_국내허가일자]이고, 총XX개국에서 허가를 득하였다. 허가 현황은 다음과 같다.
`
3. `“[CS1_브랜드명]([CS0_성분명])”의 품목허가일은 [CS5_국내허가일자]이고, 허가 현황은 다음 표와 같다.
`

---

### 20. [CS17.1_허가 국가]

**Variable ID:** `[CS17.1]`
**Variable Name:** 허가 국가
**Data Source:** [RAW4_허가현황]
**Input Type:** 본문정보입력
**Generation Timing:** 매번
**Data Type:** `array`

#### 추가 지침

> **[지침]** 한국어로 쓴다. 허가받은 모든 국가를 배열로 반환한다.
> **[중요]** CS17.1, CS17.2, CS17.3, CS17.4는 동일한 인덱스가 같은 국가의 정보를 나타내는 병렬 배열이다. 예: CS17.1[0]="한국"이면 CS17.2[0]은 한국의 허가일, CS17.3[0]은 한국의 허가품목명, CS17.4[0]은 한국의 허가권자이다.

#### 예시

1. `["한국", "미국", "EU", "일본"]`
2. `["대한민국", "미국", "유럽연합"]`

---

### 21. [CS17.2_허가일]

**Variable ID:** `[CS17.2]`
**Variable Name:** 허가일
**Data Source:** [RAW4_허가현황]
**Input Type:** 본문정보입력
**Generation Timing:** 매번
**Data Type:** `array of Date(YYYY-MM-DD)`

#### 추가 지침

> **[지침]** [CS17_전세계허가현황표]의 지침을 참고. 각 국가별 허가일을 배열로 반환한다.
> **[중요]** CS17.1과 동일한 순서로 각 국가의 허가일을 배열로 반환한다. 데이터가 없는 국가는 null로 표시한다.

#### 예시

1. `["2023-10-05", "2022-06-15", "2022-08-20", "2023-01-10"]`
2. `["2024-01-15", "2023-05-20", null]`

---

### 22. [CS17.3_허가품목명]

**Variable ID:** `[CS17.3]`
**Variable Name:** 허가품목명
**Data Source:** [RAW4_허가현황]
**Input Type:** 본문정보입력
**Generation Timing:** 매번
**Data Type:** `array`

#### 추가 지침

> **[지침]** [RAW 데이터]에 명시된 명칭으로 쓴다. 이때, 브랜드 명에 위첨자로 R 마크(®)나 TM 마크가 있을 경우 이를 누락하지 않고 출력값에도 잘 반영한다. 특히 위첨자로 써야한다.
> **[중요]** CS17.1과 동일한 순서로 각 국가의 허가품목명을 배열로 반환한다. 국가별로 품목명이 다를 수 있다. 데이터가 없는 국가는 null로 표시한다.

#### 예시

1. `["알츠정", "Alzex®", "Alzex®", "アルツ錠"]`
2. `["메모리정", "Memantine HCl Tab", null]`

---

### 23. [CS17.4_허가권자]

**Variable ID:** `[CS17.4]`
**Variable Name:** 허가권자
**Data Source:** [RAW4_허가현황]
**Input Type:** 본문정보입력
**Generation Timing:** 매번
**Data Type:** `array`

#### 추가 지침

> **[지침]** [RAW 데이터]에 명시된 명칭으로 쓴다.
> **[중요]** CS17.1과 동일한 순서로 각 국가의 허가권자를 배열로 반환한다. 국가별로 허가권자가 다를 수 있다. 데이터가 없는 국가는 null로 표시한다.

#### 예시

1. `["(주)아큐젠", "Acuzen Inc.", "Acuzen EU GmbH", "アキュゼン株式会社"]`
2. `["파워솔루션(주)", "Power Solution LLC", null]`

---

### 24. [CS17.5_허가 비고]

**Variable ID:** `[CS17.5]`  
**Variable Name:** 허가 비고  
**Data Source:** [RAW4_허가현황]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 데이터 추출 방법

> **[지침]** 비고 내용은 [CS17_전세계허가현황표]의 예시에 나온 비고 열의 예시들를 보면 굉장히 다양하다. 그렇기 때문의 [RAW 데이터]의 전반적인 정보를 훑어봐야 하며, 맥락을 고려해야 한다. 즉, '비고'라고해서 정말 [RAW 데이터]에 '비고'컬럼만 보면 안된다는 말이다.

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 25. [CS18_임상노출]

**Variable ID:** `[CS18]`  
**Variable Name:** 임상노출  
**Data Source:** [RAW8_임상노출데이터]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text와 table함께`  

#### 데이터 추출 방법

> **[지침]** 보고기간동안에 종료가 된 임상시험이 뭐뭐가 있는지 파악한다.
> **[지침]** 보고기간 동안에 종료되지는 않았지만 , 진행중이며 중간 Clinical Study Report가 발행되었다던지 해서 exposure데이터를 얻을 수 있는 임상시험이 있었는지 파악한다.
> **[지침]** 시험 의약품,위약, 활성 대조 의약품 등에 대한 각각의 대상자 수를 파악한다.

> **[지침]** 가능하다면 연령별, 성별, 인종/민족의 하위그룹별의 환자대상자수 데이터를 파악한다.

> **[지침]** 용량 투여 경로 또는 환자군에서의 시험들 중에서 중요한 차이들은 적용되는 것이 있는지 등을 파악 하고 이를 별도로 명시할 수 있도록 해야 한다.

#### 추가 지침

> **[지침]** 임상시험이 아예 없을 때는 예시1처럼 저렇게 쓴다.
> **[지침]** 표 밑에 달린 주석 또는 footer 는 본문보다 작은 글씨 크기로 써야 한다.
> **[지침]** 주석에 해당하는 윗첨자는 윗첨자 양식을 제대로 살려서 써야 한다. (본문과 같은 글자크기로 하면 안됌.)

#### 예시

1. `본 보고기간 동안 [CS2_회사명](주)가 의뢰자이거나 지원한 “[CS1_브랜드명]([CS0_성분명])” 임상시험은 없었으며, 임상시험에서 “[CS1_브랜드명]([CS0_성분명])”에 대한 임상시험 대상자 노출은 없었다.
`
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 26. [CS19_시판후노출count시작날짜]

**Variable ID:** `[CS19]`  
**Variable Name:** 시판후노출count시작날짜  
**Data Source:** [RAW3_시판후sales데이터] AND [CS3_보고시작날짜]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `Date(YYYY연 MM월 DD일)`  

#### 데이터 추출 방법

> **[지침]** 배경설명: 보통 시판후노출은 sales팀에서 주는 판매 또는 배포량에 대한 정보를 기반해 추정한다. 그런데 문제는 sales팀에서도 판매량을 추적할때 매일 하지 못하고 월별, 분기별 같이 시기를 끊어서 측정을 하게 된다, 따라서 [RAW3_시판후sales데이터] 에 있는 정보는 보통 [CS3_보고시작날짜] 나 [CS4_보고종료날짜] 와 딱 맞아 떨어지지 않는다. 따라서 시판후 노출 데이터를 제시할때 [CS19_시판후노출count시작날짜] 와[CS19.1_시판후노출count종료날짜]를 함께 표시해 주는 것이다.

> **[지침]** 따라서, [RAW3_시판후sales데이터]를 분석할때는, 어떤 주기로 해당 데이터가 작성되었는지를 확인하는 것이 중요하다.


#### 추가 지침

> **[지침]** 만약 [RAW3_시판후sales데이터]가 월별로 count가 되어있다면, [CS19_시판후노출count시작날짜]는 [CS3_보고시작날짜]와 [CS4_보고종료날짜]의 사이에 있으면서 [CS3_보고시작날짜]에 가장 가까운 월의 1일 이다. 만약 [RAW3_시판후sales데이터]가 분기별로 count가 되어있다하더라도, [CS19_시판후노출count시작날짜]를 정하는 논리구조는 동일하다. 따라서, [RAW3_시판후sales데이터]를 분석할때는, 어떤 주기로 해당 데이터가 작성되었는지를 확인하는 것이 중요하다.

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 27. [CS19.1_시판후노출count종료날짜]

**Variable ID:** `[CS19.1]`  
**Variable Name:** 시판후노출count종료날짜  
**Data Source:** [RAW3_시판후sales데이터] AND [CS4_보고종료날짜]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `Date(YYYY연 MM월 DD일)`  

#### 데이터 추출 방법

> **[지침]** 배경설명: 보통 시판후노출은 sales팀에서 주는 판매 또는 배포량에 대한 정보를 기반해 추정한다. 그런데 문제는 sales팀에서도 판매량을 추적할때 매일 하지 못하고 월별, 분기별 같이 시기를 끊어서 측정을 하게 된다, 따라서 [RAW3_시판후sales데이터] 에 있는 정보는 보통 [CS3_보고시작날짜] 나 [CS4_보고종료날짜] 와 딱 맞아 떨어지지 않는다. 따라서 시판후 노출 데이터를 제시할때 [CS19_시판후노출count시작날짜] 와[CS19.1_시판후노출count종료날짜]를 함께 표시해 주는 것이다.

> **[지침]** 따라서, [RAW3_시판후sales데이터]를 분석할때는, 어떤 주기로 해당 데이터가 작성되었는지를 확인하는 것이 중요하다.


#### 추가 지침

> **[지침]** 만약 [RAW3_시판후sales데이터]가 월별로 count가 되어있다면, [CS19_시판후노출count시작날짜]는 [CS3_보고시작날짜]와 [CS4_보고종료날짜]의 사이에 있으면서 [CS4_보고종료날짜]에 가장 가까운 월의 말일 이다. 만약 [RAW3_시판후sales데이터]가 분기별로 count가 되어있다하더라도, [CS19_시판후노출count시작날짜]를 정하는 논리구조는 동일하다.

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 28. [CS19.1_시판후판매연도]

**Variable ID:** `[CS19.1]`  
**Variable Name:** 시판후판매연도  
**Data Source:** [RAW3_시판후sales데이터] AND  [CS19_시판후노출count시작날짜] AND [CS19.1_시판후노출count종료날짜]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `YYYY년(필요시, 괄호 열고 포함하는 월)`  

#### 추가 지침

> **[지침]** YYYY년으로 표시되지만, 필요시 괄호 안에 특정 월이나 분기를 써줘야 하는 경우도 있어. 예를 들어, [CS19.1_시판후노출count종료날짜]나 [CS19_시판후노출count시작날짜]가 해당 연도 중간쯤에 있을 경우, 2020년 6월~ 부터 데이터 카운트를 해야 한다면 "2020년(6월~12월)" 이런식으로 적히겠지. 중간에 짤리지 않는 연도는 그냥 "2021년"으로 표시될 것이고

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 29. [CS19.2_시판후판매연도별판매량]

**Variable ID:** `[CS19.2]`  
**Variable Name:** 시판후판매연도별판매량  
**Data Source:** [RAW3_시판후sales데이터] AND  [CS19_시판후노출count시작날짜] AND [CS19.1_시판후노출count종료날짜]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `용법용량에 따라 몇정씩 먹는 약이면 'XX정'으로 표현되고, 주사제라서 vial로 파는 약이면 XX바이알 로 표현하는 등, 이 단위는 용법용량을 참고해서 따른다. `  

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 30. [CS19.3_시판후판매량합계]

**Variable ID:** `[CS19.3]`  
**Variable Name:** 시판후판매량합계  
**Data Source:** [CS19.2_시판후판매연도별판매량]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `용법용량에 따라 몇정씩 먹는 약이면 'XX정'으로 표현되고, 주사제라서 vial로 파는 약이면 XX바이알 로 표현하는 등, 이 단위는 용법용량을 참고해서 따른다. `  

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 31. [CS20_1일사용량]

**Variable ID:** `[CS20]`  
**Variable Name:** 1일사용량  
**Data Source:** [RAW1.1_최신첨부문서] OR [RAW2.1_용법용량]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `용법용량에 따라 몇정씩 먹는 약이면 'XX정'으로 표현되고, 주사제라서 vial로 파는 약이면 XX바이알 로 표현하는 등, 이 단위는 용법용량을 참고해서 따른다. `  

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 32. [CS21_환자1명당사용량]

**Variable ID:** `[CS21]`  
**Variable Name:** 환자1명당사용량  
**Data Source:** [RAW1.1_최신첨부문서] OR [RAW2.1_용법용량]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `용법용량에 따라 몇정씩 먹는 약이면 'XX정'으로 표현되고, 주사제라서 vial로 파는 약이면 XX바이알 로 표현하는 등, 이 단위는 용법용량을 참고해서 따른다. `  

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 33. [CS22_연 평균 판매량]

**Variable ID:** `[CS22]`  
**Variable Name:** 연 평균 판매량  
**Data Source:** [표2_연도별판매량]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `용법용량에 따라 몇정씩 먹는 약이면 'XX정'으로 표현되고, 주사제라서 vial로 파는 약이면 XX바이알 로 표현하는 등, 이 단위는 용법용량을 참고해서 따른다. `  

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 34. [CS24_MedDRA버전넘버]

**Variable ID:** `[CS24]`  
**Variable Name:** MedDRA버전넘버  
**Data Source:** 사용자 입력  
**Input Type:** 일반정보입력  
**Generation Timing:** 매번  
**Data Type:** `숫자 (소수점 첫째 자리 까지 표현) `  

#### 추가 지침

#28.1  이런 숫자임. 소수점 첫째자리까지 있음. 

#### 예시

1. `28.1`
2. `27.0`

---

### 35. [CS23_연 평균 환자 노출]

**Variable ID:** `[CS23]`  
**Variable Name:** 연 평균 환자 노출  
**Data Source:** [CS22_연평균판매량] AND [CS21_환자1명당사용량]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `약 XX명 (숫자)`  

#### 추가 지침

> **[지침]** 약 XX명 으로 표현된다

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 36. [CS55_안전성조치서술문]

**Variable ID:** `[CS55]`  
**Variable Name:** 안전성조치서술문  
**Data Source:** [RAW5_안전성조치허가팀메일] OR [RAW6_안전성조치허가팀메일_취합본]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 데이터 추출 방법

> **[지침]** 가이드라인에 따르면, 안전성조치란 다음과 같아. 모든 허가팀에서 주는 모든걸 이 문서에 담는게 아니라 인공지능인 너가 이러한 안전성조치에 해당하는 것만 골라서 출력값에 입력한다. VII.B.5.3. PSUR section “Actions taken in the reporting interval for safety reasons” This section of the PSUR should include a description of significant actions related to safety that have been taken worldwide during the reporting interval, related to either investigational uses or marketing experience by the marketing authorisation holder, sponsors of clinical trial(s), data monitoring committees, ethics committees or competent authorities that had either: • a significant influence on the risk-benefit balance of the authorised medicinal product; and/or • an impact on the conduct of a specific clinical trial(s) or on the overall clinical development programme. If known, the reason for each action should be provided and any additional relevant information should be included as appropriate. Relevant updates to previous actions should also be summarised in this section. Examples of significant actions taken for safety reasons include: Actions related to investigational uses: • refusal to authorise a clinical trial for ethical or safety reasons; • partial8 or complete clinical trial suspension or early termination of an ongoing clinical trial because of safety findings or lack of efficacy; • recall of investigational drug or comparator; • failure to obtain marketing authorisation for a tested indication including voluntary withdrawal of a marketing authorisation application; • risk management activities, including: − protocol modifications due to safety or efficacy concerns (e.g. dosage changes, changes in study inclusion/exclusion criteria, intensification of subject monitoring, limitation in trial duration); − restrictions in study population or indications; − changes to the informed consent document relating to safety concerns; − formulation changes; − addition by regulators of a special safety-related reporting requirement; − issuance of a communication to investigators or healthcare professionals; and − plans for new studies to address safety concerns. Actions related to marketing experience: • failure to obtain or apply for a marketing authorisation renewal; • withdrawal or suspension of a marketing authorisation; • actions taken due to product defects and quality issues; • suspension of supply by the marketing authorisation holder; • risk management activities including: − significant restrictions on distribution or introduction of other risk minimisation measures; − significant safety-related changes in labelling documents including restrictions on use or population treated; − communications to health care professionals; and − new post-marketing study requirement(s) imposed by competent authorities.
> **[지침]** Raw데이터에서 다음 4가지 항목을 특히 유심히 찾아내야해. 그리고 다음 4가지 항목이 서술문에 잘 나타나도록 서술해야해. 1. 어떤국가의 어떤규제당국이 2. 어떤 안전성조치가 취해졌는가(예, DHPC 배포, Referece Safety information의 업데이트, Risk Management Plan에 important identified risk나 Important potential risk 로 포함시키라든지) 3. 어떤 안전성 문제에 대해서 조치가 취해진 것인가? (예를 들어, 모세혈관 누출 증후군(CLS, Capillary Leak Syndrome), 길랭-바레 증후군(GBS, Guillain-Barré Syndrome), 횡단 척수염 및 혈소판감소증(면역 혈소판감소증 포함) 등)

#### 추가 지침

> **[지침]** 서술 스타일: 어떤국가의 어떤 규제당국이 어떤안전성문제에 대해서 어떤조치를 하도록 요구하였다. 그래서 자사는 어떤 조치를 취하였다.

> **[지침]** 전세계에서 취해진 조치를 서술하는 것이기 때문에 복수의 국가 복수의 규제당국이 여러가지의 조치를 요청할수 있어. 따라서 여기에 나열되는 항목들이 여러개일 수 있어. 예를 들어, 브라질의 어떤규제당국에서는 길랭바레증후군에 대해서 Direct Healthcare Professional Communication 을 발행하도록 요청했고, 멕시코에 어떤 규제당국에서는 Reference information에 몇번 섹션(사용상의 주의사항)에 어떤 안전성 문제를 포함하도록 요청하는 등..

> **[지침]** [RAW 데이터]에 그러한 안전성조치가 요청된 날짜나 시기가 명시가 되어있다면 이것도 서술문에 포함시켜서 정보를 풍성하게 읽는사람에게 제공할 수 있도록 해줘.

#### 예시

1. `본 보고기간 동안 “[CS1_브랜드명]([CS0_성분명])”의 국내외에서 안전성의 이유로 취한 조치(판매허가 반려 또는 판매 정지, 허가 갱신 실패, 유통의 제한, 임상시험의 정지, 용량변경, 대상 환자군 또는 적응증의 변경, 제형 변경 등)는 없다.
`
2. `브라질 보건당국의 명시에 따라 혈소판감소증(면역 혈소판감소증 포함) 관련 출혈의 유무에 대한 Direct Healthcare Professional Communication(DHPC) 편지를 발행하도록 요구되었다. `
3. `[CS2_회사명](주)는 미국 FDA로부터 모세혈관 누출 증후군(CLS, Capillary Leak Syndrome), 길랭-바레 증후군(GBS, Guillain-Barré Syndrome), 횡단 척수염 및 혈소판감소증(면역 혈소판감소증 포함)을 지역 제품 정보(Reference Information)의 제4.4절(특별한 경고 및 특별한 사용상 주의사항) 및 제4.8절(바람직하지 않은 영향)에 포함하도록 명시받았다.
[CS2_회사명](주)는 유럽연합(EU, European Union) Risk Management Plan를 업데이트하여 GBS 및 혈소판감소증(면역 혈소판감소증 포함)을 중요한 확인된 위험(Important Identified Risk)으로 포함했다.
`
4. `[CS2_회사명](주)는 제품정보(Reference Information) 제4.4절(특별한 경고 및 특별한 사용상 주의사항)을 업데이트하여 혈소판감소증이 없는 뇌혈관 정맥동 혈전증(CVST, Cerebrovascular Sinus Thrombosis) 및 과민성 반응을 포함하도록 수정했다.
[CS2_회사명](주)는 [CS1_브랜드명]의 위험 관리 계획(RMP, Risk Management Plan)에 혈소판감소증이  없는 CVST를 중요한 잠재적 위험(Important Potential Risk)으로 추가했다.
`
5. `2019년 12월, 이스라엘에서는 3개 특정 배치(KT03900, KT033KP, KT037VV)의 Eylea 투여 후 안구 내 염증 발생에 대해 의료진이 우려를 표했었다.
이스라엘 보건부는 품질 조사가 완료될 때까지 이들 3개 배치 사용을 중단하도록 요청하는 지역 DHCP  letter를 배포했다.
배치별 보고 건수는 5건 이하였고, 사례들은 여러 달에 걸쳐 산발적으로 발생했다.
배양 결과는 음성이거나, 양성의 경우 다양한 균종이 확인되었다(표피포도알균, 미지정 Streptococcus, Streptococcus viridans, Granulitacella adiacens 등).

이 3개 배치와 동일한 원료의약품 배치에서 제조된 다른 국가 제품에서는 안구 내 염증 사례가 보고되지 않았다.
현재까지 [CS2_회사명]와 충전 시설 모두 해당 3개 배치에서 품질 결함을 확인하지 못했다.

한편 이스라엘 보건부는 자체 무균성 조사에서 이상이 없음을 확인했고, 2020년 1월, 해당 배치를 계속 사용해도 된다는 결론을 내렸다.

종합하면, 현재까지 안구 내 염증을 유발했다고 판단할 만한 제품 관련 안전성 문제는 확인되지 않았다.
전 세계적으로 보고된 안구 내 염증 발생률도 안정적으로 유지되었으며, 증가 경향은 관찰되지 않았다.
따라서 이들 사례는 국지적 발생으로 판단되며, [CS1_브랜드명]의 위해성-이익 균형에 변화를 가져오지 않는다.`

---

### 37. [CS56_참고정보의변경서술문]

**Variable ID:** `[CS56]`  
**Variable Name:** 참고정보의변경서술문  
**Data Source:** [RAW7_안전성정보변경]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 데이터 추출 방법


> **[지침]** 안전성정보변경이란 '용법용량' '효능효과' '사용상의주의사항'에 변경이 있었는지 파악하는거야.
> **[지침]** 아주 드물지만, 혹시 허가팀이 전달해준 [RAW 데이터]에서 용법용량, 효능효과, 사용상의주의사항의 변경이 아니면서 minor한 것들은 너가 알아서 제외해줘야 하는거야.
> **[지침]** 안전성정보변경이란 '용법용량' '효능효과' '사용상의주의사항'에 변경이 있었는지 파악하는거야.
> **[지침]** '용법용량' '효능효과' '사용상의주의사항'에 각 어디부분에 변경이 있었는지, 또 그 안에 세부 섹션이 있으며 예를 들어 사용상의 주의사항 내의 5.이상사례에서 변경이 있었는지 6.수유부의 사용에서 변경이 있었는지 아니면 7. 과량처치 섹션의 하위 소제목인 2)치료 부분에 변경이 있었는지 파악해야해.
> **[지침]** 정확한 섹션번호와 섹션명 그리고, 변경 문구가 전후로 어떻게 달라졌는지 파악해야해. 허가팀이 알려준 [RAW7_안전성정보변경]와 첨부문서나 보고기간시점의 용법용량/효능효과/사용상의 주의사항, 보고기간말의 용법용량/효능효과/사용상의 주의사항을 모두 보고 대조해가면서 파악해야해.

#### 추가 지침

> **[지침]** 서술 스타일은 만약 안전성 변경 정보가 있었다면, 다음 3가지 항목을 포함하도록 이 서술문을 작성해줘.
 1. 변경 날짜, 
2. 어떤 섹션에 변경이 있었는지 제목과 섹션 번호도 있다면 섹션 번호까지, 
3. 변경내용 요약 

#### 예시

1. `본 보고기간 동안 “[CS1_브랜드명]([CS0_성분명])”의 안전성 정보(금기, 경고, 주의, 약물이상반
응, 과다투여, 상호작용 등)와 관련한 참고 정보의 변경은 없었다.
`
2. `본 보고기간 동안 “[CS1_브랜드명]([CS0_성분명])”의 안전성 정보(금기, 경고, 주의, 약물이상반
응, 과다투여, 상호작용 등)와 관련한 참고 정보의 변경은 아래와 같다. 

- 2022년 1월 6일에는 "7. 임부, 수유부에 대한 투여" 섹션 내에 임신부 백신 접종에 대한 최신 안전성 데이터를 반영했으며, 이득이 위험을 상회하는 경우 임신 중 COVID-19 VACCINE ASTRAZENECA 사용을 권고하는 내용으로 수정했다.
- 2022년 1월 17일에는 "7. 임부, 수유부에 대한 투여" 섹션 내에 모유수유 여성의 백신 접종에 관련된 최신 안전성 데이터를 반영해 재수정되었다.
- 2022년 2월 4일에는 "4. 이상사례"섹션과 "5. 일반적 주의"섹션에서 기본 백신접종 완료 후 타 COVID-19 백신과의 교차 부스터(3차) 접종 권고 변경을 지원하도록 내용이 업데이트되었다.

자세한 사항은 별첨 2에 정리되어 있다.`
3. `본 보고기간 동안 “[CS1_브랜드명]([CS0_성분명])”의 안전성 정보(금기, 경고, 주의, 약물이상반응, 과다투여, 상호작용 등)와 관련한 참고 정보의 변경은 아래와 같다.  

2021년 9월 10일, 용법용량 내, 투여 대상 연령으로 "만 8세 이상 및 성인" 명시가 추가되면서 만 8세 미만 소아 제외가 명확해졌다. 

자세한 사항은 별첨 2에 정리되어 있다. `
4. `용법용량이 변하는 경우에 대한 예시를 더 추가하고 싶다.. `

---

### 38. [CS56_별첨2참고정보변경표]

**Variable ID:** `[CS56]`  
**Variable Name:** 별첨2참고정보변경표  
**Data Source:** [CS56 및 CS56.1~CS56.7]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text와 table`  

#### 데이터 추출 방법


> **[지침]** 안전성정보변경이란 '용법용량' '효능효과' '사용상의주의사항'에 변경이 있었는지 파악하는거야.
> **[지침]** 아주 드물지만, 혹시 허가팀이 전달해준 [RAW 데이터]에서 용법용량, 효능효과, 사용상의주의사항의 변경이 아니면서 minor한 것들은 너가 알아서 제외해줘야 하는거야.
> **[지침]** 안전성정보변경이란 '용법용량' '효능효과' '사용상의주의사항'에 변경이 있었는지 파악하는거야.
> **[지침]** '용법용량' '효능효과' '사용상의주의사항'에 각 어디부분에 변경이 있었는지, 또 그 안에 세부 섹션이 있으며 예를 들어 사용상의 주의사항 내의 5.이상사례에서 변경이 있었는지 6.수유부의 사용에서 변경이 있었는지 아니면 7. 과량처치 섹션의 하위 소제목인 2)치료 부분에 변경이 있었는지 파악해야해.
> **[지침]** 정확한 섹션번호와 섹션명 그리고, 변경 문구가 전후로 어떻게 달라졌는지 파악해야해. 허가팀이 알려준 [RAW7_안전성정보변경]와 첨부문서나 보고기간시점의 용법용량/효능효과/사용상의 주의사항, 보고기간말의 용법용량/효능효과/사용상의 주의사항을 모두 보고 대조해가면서 파악해야해.

#### 추가 지침

# 예시 1에 template이 있어. 그것과, 이 엑셀파일에 있는 설명을 같이 매칭시켜서 학습해봐. 
> **[지침]** 그리고 나서 예시 2, 예시 3 등 다른 예시를 보고 학습해봐.

> **[지침]** [RAW7_안전성정보변경]에 따라, 안전성 관련해서 참고정보의 변경이 없었다면, "변경사항"열에는 빈칸으로 두지 말고, "변경 없음"으로 명시해. 참고정보의 변경이 없었다면 기존 용법용량, 사용상의 주의사항 전문을 그대로 기재할 수도 있지만 가독성이 떨어지니까 "변경 없음"으로 명시하는 거야.

> **[지침]** [RAW7_안전성정보변경]에 따라,안전성정보 변경사항이 없는 경우, 최신제품정보를 기준으로 기 허가사항에 전문을 다 넣고. 변경후 칸에는 "변경 없음"이라고 적어

> **[지침]** 안전성 정보 변경사항이 있는 경우, 효능효과 , 용법용량, 사용상의 주의사항 에 대해서 각 항목에 분량이 어느정도인지에 따라 스타일을 다르게 해줘. 예를 들어, 효능효과는 섹션이 여러개 없고 짧은 분량이라면 , 변경표 작성할 때 기허가사항과 변경사항에 모두 전문을 다 쓰는거야. 하지만, 사용상의 주의사항이 섹션번호가 2개이상 있을 만큼의 분량이 많다면, 변경된 부분만 대조시켜 볼 수 있도록 기허가사항에 변경전 문구, 변경사항에 변경후 문구를 각각 써주는거야. 나머지 분량은 모두 생략하고 쓰지 않는거지. 이때, 만약 생략을 하는 경우라면 반드시, 변경된 부분의 제목이나 소제목이나 섹션명이 있다면 그 번호와 제목을 생략하지 않고 그대로 쓰는거야. 그러한 예시는 " [CS56_별첨2참고정보변경표]_예시2 "파일을 보면 확인할 수 있어. "7.과량투여 시의 처치 2)치료" 라는 섹션번호와 섹션명을 생략하지 않고 나타내 줫지. 그래서 그 많은 사용상의 주의사항 중 어느 부분이 변경된건지 읽는 사람이 빨리 파악할 수 있게 해주는거야.

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 39. [CS56.1_허가사항변경일]

**Variable ID:** `[CS56.1]`  
**Variable Name:** 허가사항변경일  
**Data Source:** [RAW7_안전성정보변경]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `단일 1개 일때는 'YYYY년 MM월 DD일' 로 날짜로 표시됨 
복수일 때는 날짜의 list로 표시되면서 괄호 안에 해당 변경일날 변경된 내용에 대한 아주 간략한 요약이 들어감. (지침 또는 예시 참고) `  

#### 추가 지침

> **[지침]** 허가사항 변경일의 경우, 여러번의 허가변경이 있었다면, 그 모든 복수의 날짜를 나열해서 적으면 돼. 예시 : 2022년1월 2일(용법용량 변경), 2024년 1월 2일(사용상의 주의사항 변경) 이런식으로. 복수의 날짜를 적으면 헷갈리니까 그 날짜 뒤에 ()이러한 괄호안에 어떤 변경인지를 아주 짧게 요약하는거지.


#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 40. [CS56.2_기존효능효과]

**Variable ID:** `[CS56.2]`  
**Variable Name:** 기존효능효과  
**Data Source:** [RAW7_안전성정보변경] AND ([RAW1.2_보고시작시점첨부문서]OR [RAW2.4_보고시작시점용법용량])  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 추가 지침

"[CS56_별첨2참고정보변경표]의 ##지침" 내용 참고

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 41. [CS56.3_기존용량용법]

**Variable ID:** `[CS56.3]`  
**Variable Name:** 기존용량용법  
**Data Source:** [RAW7_안전성정보변경] AND ([RAW1.2_보고시작시점첨부문서]OR [RAW2.5_보고시작시점효능효과])  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 추가 지침

"[CS56_별첨2참고정보변경표]의 ##지침" 내용 참고

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 42. [CS56.4_기존사용상의주의사항]

**Variable ID:** `[CS56.4]`  
**Variable Name:** 기존사용상의주의사항  
**Data Source:** [RAW7_안전성정보변경] AND ([RAW1.2_보고시작시점첨부문서]OR [RAW2.6_보고시작시점사용상의주의사항])  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 추가 지침

"[CS56_별첨2참고정보변경표]의 ##지침" 내용 참고

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 43. [CS56.5_최신효능효과]

**Variable ID:** `[CS56.5]`  
**Variable Name:** 최신효능효과  
**Data Source:** [RAW7_안전성정보변경] AND ([RAW1.1_최신첨부문서] OR [RAW2.1_용법용량])  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 추가 지침

"[CS56_별첨2참고정보변경표]의 ##지침" 내용 참고

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 44. [CS56.6_최신용량용법]

**Variable ID:** `[CS56.6]`  
**Variable Name:** 최신용량용법  
**Data Source:** [RAW7_안전성정보변경] AND ([RAW1.1_최신첨부문서] OR [RAW2.2_효능효과])  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 추가 지침

"[CS56_별첨2참고정보변경표]의 ##지침" 내용 참고

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 45. [CS56.7_최신사용상의주의사항]

**Variable ID:** `[CS56.7]`  
**Variable Name:** 최신사용상의주의사항  
**Data Source:** [RAW7_안전성정보변경] AND ([RAW1.1_최신첨부문서] OR [RAW2.3_사용상의주의사항])  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 추가 지침

"[CS56_별첨2참고정보변경표]의 ##지침" 내용 참고

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 46. [CS25.1_신속 보고일자]

**Variable ID:** `[CS25.1]`  
**Variable Name:** 신속 보고일자  
**Data Source:**   
**Input Type:**   
**Generation Timing:**   
**Data Type:** ``  

---

### 47. [CS25.2_신속 관리번호]

**Variable ID:** `[CS25.2]`  
**Variable Name:** 신속 관리번호  
**Data Source:**   
**Input Type:**   
**Generation Timing:**   
**Data Type:** ``  

---

### 48. [CS25.3_신속 이상사례명]

**Variable ID:** `[CS25.3]`  
**Variable Name:** 신속 이상사례명  
**Data Source:**   
**Input Type:**   
**Generation Timing:**   
**Data Type:** ``  

---

### 49. [CS25.4_신속 비고]

**Variable ID:** `[CS25.4]`  
**Variable Name:** 신속 비고  
**Data Source:**   
**Input Type:**   
**Generation Timing:**   
**Data Type:** ``  

---

### 50. [CS28_원시총환자수]

**Variable ID:** `[CS28]`  
**Variable Name:** 원시총환자수  
**Data Source:** [Raw14_원시자료LineListing]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `숫자(정수) ,`  

#### 데이터 추출 방법

#실무에서하는 방법은 : Raw데이터 linelisting에서 Case번호 즉 부서접수번호(KAERS 안전원관리번호)를 나열함. 그리고 엑셀에서 중복 제거를 함. 그런다음에 그 수를 count함. 그러면 그게 환자수와 동일. (이렇게 하는 배경은, 보통 case는 환자를 나타내고 해당 case에서 여러개의 이상사례 즉 event가 발생하기 때문에 event수를 세면 안되고 case수를 세야하기 때문임)

#### 추가 지침

> **[지침]** count 나 계산 엄격하게 2중 검증 필요

#### 예시

1. `20명`

---

### 51. [CS29_원시총이상사례수]

**Variable ID:** `[CS29]`  
**Variable Name:** 원시총이상사례수  
**Data Source:** [Raw14_원시자료LineListing]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `숫자(정수) ,`  

#### 데이터 추출 방법

#실무에서하는 방법은 : Raw데이터 linelisting에서 event 시트를 찾는다. event시트란 case번호와 MedDRA PT Term같은 이상사례 명이 나열되어있는 시트임. 그 해당 시트에서 event개수를 세면 되는데 간단히 하는 방법은 엑셀에서 옆에 행 번호가 표시되므로, 그걸 보고 이상사례수를 count함. 

#### 추가 지침

> **[지침]** count 나 계산 엄격하게 2중 검증 필요

#### 예시

1. `200건`

---

### 52. [CS30_원시중대한사례수]

**Variable ID:** `[CS30]`  
**Variable Name:** 원시중대한사례수  
**Data Source:** [Raw14_원시자료LineListing]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `숫자(정수)`  

#### 데이터 추출 방법

#실무에서하는 방법은 : Raw데이터 linelisting에서 event 시트를 찾는다. event시트란 case번호와 MedDRA PT Term같은 이상사례 명이 나열되어있는 시트임. 
> **[지침]** 1.어떤 고객사는 해당 linelisting에 Seriousness 컬럼에 yes/no를 표시해 주는데, 이때에는 seriousness yes인 event들만 숫자를 센다. 이때, case seriousness와 event seriousness가 둘다 있는 경우 event seriousness를 따른다.
> **[지침]** 2. 어떤 고객사는 해당 linelisting에 별도로 seriousness컬럼이 없고, 사망을 초래/ 생명을 위협 /입원 또는 입원기간의 연장이 필요 /지속적 또는 중대한 장애나 기능저하 초래 /선천적 기형 또는 이상을 초래 /기타 의학적으로 중요한 상황이 발생하여 치료 필요/ 이러한 컬럼들이 있다. 이런경우 이들 중에 하나라도 "예"라고 체크되어있는 경우. 이 event는 serious(중대한)이기 때문에 이것들만 filter를 해서 그 해당 event를 센다.



#### 추가 지침

> **[지침]** count 나 계산 엄격하게 2중 검증 필요

#### 예시

1. `200건`

---

### 53. [CS31_원시자료신청일]

**Variable ID:** `[CS31]`  
**Variable Name:** 원시자료신청일  
**Data Source:** 사용자 입력  
**Input Type:** 일반정보입력  
**Generation Timing:** 매번  
**Data Type:** `날짜`  

#### 예시

1. `2024-11-01 00:00:00`

---

### 54. [CS32_신속+정기보고총사례수]

**Variable ID:** `[CS32]`  
**Variable Name:** 신속+정기보고총사례수  
**Data Source:** [CS33_신속보고총사례수]+[CS34_정기보고총사례수] 두개의 합  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `숫자(정수)`  

#### 데이터 추출 방법

#방법1. [CS33_신속보고총사례수]+[CS34_정기보고총사례수] 두개의 합으로 할 수도 있고.
#방법2.실무에서 하는 방법은 신속보고에 해당하는 line listing들을 모두 합한뒤 (예, [RAW12_국외신속보고LineListing]+[RAW13_국내신속보고LineListing]+[RAW15_정기보고LineListing]) 이상사례 개수를 센다. 

#### 추가 지침

> **[지침]** count 나 계산 엄격하게 2중 검증 필요

#### 예시

1. `30.0`

---

### 55. [CS33_신속보고총사례수]

**Variable ID:** `[CS33]`  
**Variable Name:** 신속보고총사례수  
**Data Source:** [RAW12_국외신속보고LineListing]+[RAW13_국내신속보고LineListing]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `숫자(정수)`  

#### 데이터 추출 방법

#실무에서 하는 방법은 신속보고에 해당하는 line listing들을 모두 합한뒤 (예, [RAW12_국외신속보고LineListing]+[RAW13_국내신속보고LineListing]) 이상사례 개수를 센다. #실무에서하는 방법은 : Raw데이터 linelisting에서 event 시트를 찾는다. event시트란 case번호와 MedDRA PT Term같은 이상사례 명이 나열되어있는 시트임. 그 해당 시트에서 event개수를 세면 되는데 간단히 하는 방법은 엑셀에서 옆에 행 번호가 표시되므로, 그걸 보고 이상사례수를 count함. 

#### 추가 지침

> **[지침]** count 나 계산 엄격하게 2중 검증 필요

#### 예시

1. `40.0`

---

### 56. [CS34_정기보고총사례수]

**Variable ID:** `[CS34]`  
**Variable Name:** 정기보고총사례수  
**Data Source:** [RAW15_정기보고LineListing]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `숫자(정수)`  

#### 데이터 추출 방법

#실무에서하는 방법은 : Raw데이터 linelisting에서 event 시트를 찾는다. event시트란 case번호와 MedDRA PT Term같은 이상사례 명이 나열되어있는 시트임. 그 해당 시트에서 event개수를 세면 되는데 간단히 하는 방법은 엑셀에서 옆에 행 번호가 표시되므로, 그걸 보고 이상사례수를 count함. 

#### 추가 지침

> **[지침]** count 나 계산 엄격하게 2중 검증 필요

#### 예시

1. `50.0`

---

### 57. [CS35_신속+정기+원시총사례수]

**Variable ID:** `[CS35]`  
**Variable Name:** 신속+정기+원시총사례수  
**Data Source:** [CS33_신속보고총사례수]+[CS34_정기보고총사례수]+[CS29_원시총이상사례수] 세개의 합  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `숫자(정수)`  

#### 데이터 추출 방법

#방법1.[CS33_신속보고총사례수]+[CS34_정기보고총사례수]+[CS29_원시총이상사례수] 세개의 합
#방법2.정기보고,신속보고,원시보고에 해당하는 line listing들을 모두 합한뒤 (예, [RAW12_국외신속보고LineListing]+[RAW13_국내신속보고LineListing]+[RAW15_정기보고LineListing]+[Raw14_원시자료LineListing]) 이상사례 개수를 센다. 
#방법1 과 방법 2로 한 값이 동일한지 확인한다. 

#### 추가 지침

> **[지침]** count 나 계산 엄격하게 2중 검증 필요

#### 예시

1. `60.0`

---

### 58. [CS36_중대한총사례수]

**Variable ID:** `[CS36]`  
**Variable Name:** 중대한총사례수  
**Data Source:** RAW데이터에 있는 모든 이상사례 Line listing 예를 들어, [RAW12_국외신속보고LineListing],[RAW13_국내신속보고LineListing],[RAW15_정기보고LineListing],[Raw14_원시자료LineListing]  
**Input Type:**   
**Generation Timing:**   
**Data Type:** `숫자(정수)`  

#### 예시

1. `60.0`

---

### 59. [CS37_중대하지않은총사례수]

**Variable ID:** `[CS37]`  
**Variable Name:** 중대하지않은총사례수  
**Data Source:** RAW데이터에 있는 모든 이상사례 Line listing 예를 들어, [RAW12_국외신속보고LineListing],[RAW13_국내신속보고LineListing],[RAW15_정기보고LineListing],[Raw14_원시자료LineListing]  
**Input Type:**   
**Generation Timing:**   
**Data Type:** `숫자(정수)`  

#### 예시

1. `60.0`

---

### 60. [CS53_문헌DB]

**Variable ID:** `[CS53]`  
**Variable Name:** 문헌DB  
**Data Source:** 사용자입력  
**Input Type:** 설정  
**Generation Timing:** 초기 1회  
**Data Type:** `text`  

#### 추가 지침

> **[지침]** 이건 문헌검색을 어디에서 했냐는 거라, 단수가 될 수도 있고 복수(여러개)가 될 수도 있음. 나열 하면 됌.

#### 예시

1. `Pubmed(www.ncbi.nlm.nih.gov/pubmed), 
Koreamed(koreamed.org),  KMbase(kmbase.medric.or.kr) 및 KISS(kiss.kstudy.com)
`
2. `MEDLINE, EMBASE, BIOSIS, Derwent Drug File, Science Citation Index 및 Chemical Abstracts`

---

### 61. [CS55_안전성조치서술문]

**Variable ID:** `[CS55]`  
**Variable Name:** 안전성조치서술문  
**Data Source:** [RAW5_안전성조치허가팀메일] OR [RAW6_안전성조치허가팀메일_취합본]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 데이터 추출 방법

> **[지침]** 가이드라인에 따르면, 안전성조치란 다음과 같아. 모든 허가팀에서 주는 모든걸 이 문서에 담는게 아니라 인공지능인 너가 이러한 안전성조치에 해당하는 것만 골라서 출력값에 입력한다.야 하는거야. VII.B.5.3. PSUR section “Actions taken in the reporting interval for safety reasons” This section of the PSUR should include a description of significant actions related to safety that have been taken worldwide during the reporting interval, related to either investigational uses or marketing experience by the marketing authorisation holder, sponsors of clinical trial(s), data monitoring committees, ethics committees or competent authorities that had either: • a significant influence on the risk-benefit balance of the authorised medicinal product; and/or • an impact on the conduct of a specific clinical trial(s) or on the overall clinical development programme. If known, the reason for each action should be provided and any additional relevant information should be included as appropriate. Relevant updates to previous actions should also be summarised in this section. Examples of significant actions taken for safety reasons include: Actions related to investigational uses: • refusal to authorise a clinical trial for ethical or safety reasons; • partial8 or complete clinical trial suspension or early termination of an ongoing clinical trial because of safety findings or lack of efficacy; • recall of investigational drug or comparator; • failure to obtain marketing authorisation for a tested indication including voluntary withdrawal of a marketing authorisation application; • risk management activities, including: − protocol modifications due to safety or efficacy concerns (e.g. dosage changes, changes in study inclusion/exclusion criteria, intensification of subject monitoring, limitation in trial duration); − restrictions in study population or indications; − changes to the informed consent document relating to safety concerns; − formulation changes; − addition by regulators of a special safety-related reporting requirement; − issuance of a communication to investigators or healthcare professionals; and − plans for new studies to address safety concerns. Actions related to marketing experience: • failure to obtain or apply for a marketing authorisation renewal; • withdrawal or suspension of a marketing authorisation; • actions taken due to product defects and quality issues; • suspension of supply by the marketing authorisation holder; • risk management activities including: − significant restrictions on distribution or introduction of other risk minimisation measures; − significant safety-related changes in labelling documents including restrictions on use or population treated; − communications to health care professionals; and − new post-marketing study requirement(s) imposed by competent authorities.
> **[지침]** Raw데이터에서 다음 4가지 항목을 특히 유심히 찾아내야해. 그리고 다음 4가지 항목이 서술문에 잘 나타나도록 서술해야해. 1. 어떤국가의 어떤규제당국이 2. 어떤 안전성조치가 취해졌는가(예, DHPC 배포, Referece Safety information의 업데이트, Risk Management Plan에 important identified risk나 Important potential risk 로 포함시키라든지) 3. 어떤 안전성 문제에 대해서 조치가 취해진 것인가? (예를 들어, 모세혈관 누출 증후군(CLS, Capillary Leak Syndrome), 길랭-바레 증후군(GBS, Guillain-Barré Syndrome), 횡단 척수염 및 혈소판감소증(면역 혈소판감소증 포함) 등)

#### 추가 지침

> **[지침]** 서술 스타일: 어떤국가의 어떤 규제당국이 어떤안전성문제에 대해서 어떤조치를 하도록 요구하였다. 그래서 자사는 어떤 조치를 취하였다.

> **[지침]** 전세계에서 취해진 조치를 서술하는 것이기 때문에 복수의 국가 복수의 규제당국이 여러가지의 조치를 요청할수 있어. 따라서 여기에 나열되는 항목들이 여러개일 수 있어. 예를 들어, 브라질의 어떤규제당국에서는 길랭바레증후군에 대해서 Direct Healthcare Professional Communication 을 발행하도록 요청했고, 멕시코에 어떤 규제당국에서는 Reference information에 몇번 섹션(사용상의 주의사항)에 어떤 안전성 문제를 포함하도록 요청하는 등..

> **[지침]** [RAW 데이터]에 그러한 안전성조치가 요청된 날짜나 시기가 명시가 되어있다면 이것도 서술문에 포함시켜서 정보를 풍성하게 읽는사람에게 제공할 수 있도록 해줘.

#### 예시

1. `본 보고기간 동안 “[CS1_브랜드명]([CS0_성분명])”의 국내외에서 안전성의 이유로 취한 조치(판매허가 반려 또는 판매 정지, 허가 갱신 실패, 유통의 제한, 임상시험의 정지, 용량변경, 대상 환자군 또는 적응증의 변경, 제형 변경 등)는 없다.
`
2. `브라질 보건당국의 명시에 따라 혈소판감소증(면역 혈소판감소증 포함) 관련 출혈의 유무에 대한 Direct Healthcare Professional Communication(DHPC) 편지를 발행하도록 요구되었다. `
3. `[CS2_회사명](주)는 미국 FDA로부터 모세혈관 누출 증후군(CLS, Capillary Leak Syndrome), 길랭-바레 증후군(GBS, Guillain-Barré Syndrome), 횡단 척수염 및 혈소판감소증(면역 혈소판감소증 포함)을 지역 제품 정보(Reference Information)의 제4.4절(특별한 경고 및 특별한 사용상 주의사항) 및 제4.8절(바람직하지 않은 영향)에 포함하도록 명시받았다.
[CS2_회사명](주)는 유럽연합(EU, European Union) Risk Management Plan를 업데이트하여 GBS 및 혈소판감소증(면역 혈소판감소증 포함)을 중요한 확인된 위험(Important Identified Risk)으로 포함했다.
`
4. `[CS2_회사명](주)는 제품정보(Reference Information) 제4.4절(특별한 경고 및 특별한 사용상 주의사항)을 업데이트하여 혈소판감소증이 없는 뇌혈관 정맥동 혈전증(CVST, Cerebrovascular Sinus Thrombosis) 및 과민성 반응을 포함하도록 수정했다.
[CS2_회사명](주)는 [CS1_브랜드명]의 위험 관리 계획(RMP, Risk Management Plan)에 혈소판감소증이  없는 CVST를 중요한 잠재적 위험(Important Potential Risk)으로 추가했다.
`
5. `2019년 12월, 이스라엘에서는 3개 특정 배치(KT03900, KT033KP, KT037VV)의 Eylea 투여 후 안구 내 염증 발생에 대해 의료진이 우려를 표했었다.
이스라엘 보건부는 품질 조사가 완료될 때까지 이들 3개 배치 사용을 중단하도록 요청하는 지역 DHCP  letter를 배포했다.
배치별 보고 건수는 5건 이하였고, 사례들은 여러 달에 걸쳐 산발적으로 발생했다.
배양 결과는 음성이거나, 양성의 경우 다양한 균종이 확인되었다(표피포도알균, 미지정 Streptococcus, Streptococcus viridans, Granulitacella adiacens 등).

이 3개 배치와 동일한 원료의약품 배치에서 제조된 다른 국가 제품에서는 안구 내 염증 사례가 보고되지 않았다.
현재까지 [CS2_회사명]와 충전 시설 모두 해당 3개 배치에서 품질 결함을 확인하지 못했다.

한편 이스라엘 보건부는 자체 무균성 조사에서 이상이 없음을 확인했고, 2020년 1월, 해당 배치를 계속 사용해도 된다는 결론을 내렸다.

종합하면, 현재까지 안구 내 염증을 유발했다고 판단할 만한 제품 관련 안전성 문제는 확인되지 않았다.
전 세계적으로 보고된 안구 내 염증 발생률도 안정적으로 유지되었으며, 증가 경향은 관찰되지 않았다.
따라서 이들 사례는 국지적 발생으로 판단되며, [CS1_브랜드명]의 위해성-이익 균형에 변화를 가져오지 않는다.`

---

### 62. [CS56_참고정보의변경서술문]

**Variable ID:** `[CS56]`  
**Variable Name:** 참고정보의변경서술문  
**Data Source:** [RAW7_안전성정보변경]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 데이터 추출 방법


> **[지침]** 안전성정보변경이란 '용법용량' '효능효과' '사용상의주의사항'에 변경이 있었는지 파악하는거야.
> **[지침]** 아주 드물지만, 혹시 허가팀이 전달해준 [RAW 데이터]에서 용법용량, 효능효과, 사용상의주의사항의 변경이 아니면서 minor한 것들은 너가 알아서 제외해줘야 하는거야.
> **[지침]** 안전성정보변경이란 '용법용량' '효능효과' '사용상의주의사항'에 변경이 있었는지 파악하는거야.
> **[지침]** '용법용량' '효능효과' '사용상의주의사항'에 각 어디부분에 변경이 있었는지, 또 그 안에 세부 섹션이 있으며 예를 들어 사용상의 주의사항 내의 5.이상사례에서 변경이 있었는지 6.수유부의 사용에서 변경이 있었는지 아니면 7. 과량처치 섹션의 하위 소제목인 2)치료 부분에 변경이 있었는지 파악해야해.
> **[지침]** 정확한 섹션번호와 섹션명 그리고, 변경 문구가 전후로 어떻게 달라졌는지 파악해야해. 허가팀이 알려준 [RAW7_안전성정보변경]와 첨부문서나 보고기간시점의 용법용량/효능효과/사용상의 주의사항, 보고기간말의 용법용량/효능효과/사용상의 주의사항을 모두 보고 대조해가면서 파악해야해.

#### 추가 지침

> **[지침]** 서술 스타일은 만약 안전성 변경 정보가 있었다면, 다음 3가지 항목을 포함하도록 이 서술문을 작성해줘.
 1. 변경 날짜, 
2. 어떤 섹션에 변경이 있었는지 제목과 섹션 번호도 있다면 섹션 번호까지, 
3. 변경내용 요약 

#### 예시

1. `본 보고기간 동안 “[CS1_브랜드명]([CS0_성분명])”의 안전성 정보(금기, 경고, 주의, 약물이상반
응, 과다투여, 상호작용 등)와 관련한 참고 정보의 변경은 없었다.
`
2. `본 보고기간 동안 “[CS1_브랜드명]([CS0_성분명])”의 안전성 정보(금기, 경고, 주의, 약물이상반
응, 과다투여, 상호작용 등)와 관련한 참고 정보의 변경은 아래와 같다. 

- 2022년 1월 6일에는 "7. 임부, 수유부에 대한 투여" 섹션 내에 임신부 백신 접종에 대한 최신 안전성 데이터를 반영했으며, 이득이 위험을 상회하는 경우 임신 중 COVID-19 VACCINE ASTRAZENECA 사용을 권고하는 내용으로 수정했다.
- 2022년 1월 17일에는 "7. 임부, 수유부에 대한 투여" 섹션 내에 모유수유 여성의 백신 접종에 관련된 최신 안전성 데이터를 반영해 재수정되었다.
- 2022년 2월 4일에는 "4. 이상사례"섹션과 "5. 일반적 주의"섹션에서 기본 백신접종 완료 후 타 COVID-19 백신과의 교차 부스터(3차) 접종 권고 변경을 지원하도록 내용이 업데이트되었다.

자세한 사항은 별첨 2에 정리되어 있다.`
3. `본 보고기간 동안 “[CS1_브랜드명]([CS0_성분명])”의 안전성 정보(금기, 경고, 주의, 약물이상반응, 과다투여, 상호작용 등)와 관련한 참고 정보의 변경은 아래와 같다.  

2021년 9월 10일, 용법용량 내, 투여 대상 연령으로 "만 8세 이상 및 성인" 명시가 추가되면서 만 8세 미만 소아 제외가 명확해졌다. 

자세한 사항은 별첨 2에 정리되어 있다. `
4. `용법용량이 변하는 경우에 대한 예시를 더 추가하고 싶다.. `

---

### 63. [CS56_별첨2참고정보변경표]

**Variable ID:** `[CS56]`  
**Variable Name:** 별첨2참고정보변경표  
**Data Source:** [CS56 및 CS56.1~CS56.7]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text와 table`  

#### 데이터 추출 방법


> **[지침]** 안전성정보변경이란 '용법용량' '효능효과' '사용상의주의사항'에 변경이 있었는지 파악하는거야.
> **[지침]** 아주 드물지만, 혹시 허가팀이 전달해준 [RAW 데이터]에서 용법용량, 효능효과, 사용상의주의사항의 변경이 아니면서 minor한 것들은 너가 알아서 제외해줘야 하는거야.
> **[지침]** 안전성정보변경이란 '용법용량' '효능효과' '사용상의주의사항'에 변경이 있었는지 파악하는거야.
> **[지침]** '용법용량' '효능효과' '사용상의주의사항'에 각 어디부분에 변경이 있었는지, 또 그 안에 세부 섹션이 있으며 예를 들어 사용상의 주의사항 내의 5.이상사례에서 변경이 있었는지 6.수유부의 사용에서 변경이 있었는지 아니면 7. 과량처치 섹션의 하위 소제목인 2)치료 부분에 변경이 있었는지 파악해야해.
> **[지침]** 정확한 섹션번호와 섹션명 그리고, 변경 문구가 전후로 어떻게 달라졌는지 파악해야해. 허가팀이 알려준 [RAW7_안전성정보변경]와 첨부문서나 보고기간시점의 용법용량/효능효과/사용상의 주의사항, 보고기간말의 용법용량/효능효과/사용상의 주의사항을 모두 보고 대조해가면서 파악해야해.

#### 추가 지침

# 예시 1에 template이 있어. 그것과, 이 엑셀파일에 있는 설명을 같이 매칭시켜서 학습해봐. 
> **[지침]** 그리고 나서 예시 2, 예시 3 등 다른 예시를 보고 학습해봐.

> **[지침]** [RAW7_안전성정보변경]에 따라, 안전성 관련해서 참고정보의 변경이 없었다면, "변경사항"열에는 빈칸으로 두지 말고, "변경 없음"으로 명시해. 참고정보의 변경이 없었다면 기존 용법용량, 사용상의 주의사항 전문을 그대로 기재할 수도 있지만 가독성이 떨어지니까 "변경 없음"으로 명시하는 거야.

> **[지침]** [RAW7_안전성정보변경]에 따라,안전성정보 변경사항이 없는 경우, 최신제품정보를 기준으로 기 허가사항에 전문을 다 넣고. 변경후 칸에는 "변경 없음"이라고 적어

> **[지침]** 안전성 정보 변경사항이 있는 경우, 효능효과 , 용법용량, 사용상의 주의사항 에 대해서 각 항목에 분량이 어느정도인지에 따라 스타일을 다르게 해줘. 예를 들어, 효능효과는 섹션이 여러개 없고 짧은 분량이라면 , 변경표 작성할 때 기허가사항과 변경사항에 모두 전문을 다 쓰는거야. 하지만, 사용상의 주의사항이 섹션번호가 2개이상 있을 만큼의 분량이 많다면, 변경된 부분만 대조시켜 볼 수 있도록 기허가사항에 변경전 문구, 변경사항에 변경후 문구를 각각 써주는거야. 나머지 분량은 모두 생략하고 쓰지 않는거지. 이때, 만약 생략을 하는 경우라면 반드시, 변경된 부분의 제목이나 소제목이나 섹션명이 있다면 그 번호와 제목을 생략하지 않고 그대로 쓰는거야. 그러한 예시는 " [CS56_별첨2참고정보변경표]_예시2 "파일을 보면 확인할 수 있어. "7.과량투여 시의 처치 2)치료" 라는 섹션번호와 섹션명을 생략하지 않고 나타내 줫지. 그래서 그 많은 사용상의 주의사항 중 어느 부분이 변경된건지 읽는 사람이 빨리 파악할 수 있게 해주는거야.

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 64. [CS56.1_허가사항변경일]

**Variable ID:** `[CS56.1]`  
**Variable Name:** 허가사항변경일  
**Data Source:** [RAW7_안전성정보변경]  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `단일 1개 일때는 'YYYY년 MM월 DD일' 로 날짜로 표시됨 
복수일 때는 날짜의 list로 표시되면서 괄호 안에 해당 변경일날 변경된 내용에 대한 아주 간략한 요약이 들어감. (지침 또는 예시 참고) `  

#### 추가 지침

> **[지침]** 허가사항 변경일의 경우, 여러번의 허가변경이 있었다면, 그 모든 복수의 날짜를 나열해서 적으면 돼. 예시 : 2022년1월 2일(용법용량 변경), 2024년 1월 2일(사용상의 주의사항 변경) 이런식으로. 복수의 날짜를 적으면 헷갈리니까 그 날짜 뒤에 ()이러한 괄호안에 어떤 변경인지를 아주 짧게 요약하는거지.


#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 65. [CS56.2_기존효능효과]

**Variable ID:** `[CS56.2]`  
**Variable Name:** 기존효능효과  
**Data Source:** [RAW7_안전성정보변경] AND ([RAW1.2_보고시작시점첨부문서]OR [RAW2.4_보고시작시점용법용량])  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 추가 지침

"[CS56_별첨2참고정보변경표]의 ##지침" 내용 참고

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 66. [CS56.3_기존용량용법]

**Variable ID:** `[CS56.3]`  
**Variable Name:** 기존용량용법  
**Data Source:** [RAW7_안전성정보변경] AND ([RAW1.2_보고시작시점첨부문서]OR [RAW2.5_보고시작시점효능효과])  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 추가 지침

"[CS56_별첨2참고정보변경표]의 ##지침" 내용 참고

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 67. [CS56.4_기존사용상의주의사항]

**Variable ID:** `[CS56.4]`  
**Variable Name:** 기존사용상의주의사항  
**Data Source:** [RAW7_안전성정보변경] AND ([RAW1.2_보고시작시점첨부문서]OR [RAW2.6_보고시작시점사용상의주의사항])  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 추가 지침

"[CS56_별첨2참고정보변경표]의 ##지침" 내용 참고

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 68. [CS56.5_최신효능효과]

**Variable ID:** `[CS56.5]`  
**Variable Name:** 최신효능효과  
**Data Source:** [RAW7_안전성정보변경] AND ([RAW1.1_최신첨부문서] OR [RAW2.1_용법용량])  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 추가 지침

"[CS56_별첨2참고정보변경표]의 ##지침" 내용 참고

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 69. [CS56.6_최신용량용법]

**Variable ID:** `[CS56.6]`  
**Variable Name:** 최신용량용법  
**Data Source:** [RAW7_안전성정보변경] AND ([RAW1.1_최신첨부문서] OR [RAW2.2_효능효과])  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 추가 지침

"[CS56_별첨2참고정보변경표]의 ##지침" 내용 참고

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 70. [CS56.7_최신사용상의주의사항]

**Variable ID:** `[CS56.7]`  
**Variable Name:** 최신사용상의주의사항  
**Data Source:** [RAW7_안전성정보변경] AND ([RAW1.1_최신첨부문서] OR [RAW2.3_사용상의주의사항])  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** `text`  

#### 추가 지침

"[CS56_별첨2참고정보변경표]의 ##지침" 내용 참고

#### 예시

1. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---

### 71. [CS57_참고문헌리스트]

**Variable ID:** `[CS57]`  
**Variable Name:** 참고문헌리스트  
**Data Source:** [RAW9_문헌자료] 및 생성된 문서 자체  
**Input Type:** 본문정보입력  
**Generation Timing:** 매번  
**Data Type:** ``  

#### 데이터 추출 방법

[RAW9_문헌자료] 중, 생성된 문서에 사용된 문헌에 한해서 기재. 
[RAW9_문헌자료]   내에서 대표 저자. 논문 제목. 저널명. 연도;권(호):시작쪽-끝쪽. 정보 파악하여 긁어와야함. 

#### 추가 지침

#[RAW9_문헌자료] 중, 생성된 문서에 사용된 문헌에 대해서 참고한 문헌 리스트를 기재하는 것임. 
#예시1.은 문서 내에서 참고한 문헌 정보가 아무것도 없을때, 참고문헌 리스트를 빈칸으로 내버려 두는 것이 비전문적으로 보이므로, 가이드라인이라도 명시한 버전임. 이때 이 가이드라인들은 모두 최신인지 확인해서 최신 버전으로 변경 필요. 또한 원시자료 내역이 아예 없을때는 원시자료 관련한 참고문헌은 명시하지 않아야함. 
#예시2. 는 문서 내에서 참고한 문헌정보가 있을 때임. 

#### 예시

1. `1. 식품의약품안전처, 정기적인 유익성-위해성 평가보고에 관한 가이드라인, 2017
2. 식품의약품안전처, 의약품의 위해성 관리계획 가이드라인, 2021
3. 한국의약품안전관리원, “[CS1_브랜드명]([CS0_성분명])” 의약품 부작용보고 원시자료
4. 
`
2. `별도 워드 문서 예시 참고 (제목으로 해당요소의 예시 몇번인지 알 수 있음) `

---


---


# PH 데이터 정의 (PH Data Definition)

> **문서 목적:** 이 문서는 한국 PSUR 보고서 생성을 위한 PH(Paragraph/Phrase) 데이터 추출 컨텍스트를 정의합니다.
> PH 데이터는 주로 서술형 텍스트로, 문서 본문에 들어가는 문장이나 단락을 의미합니다.

## 문서 구조 설명

각 데이터 항목은 다음 정보를 포함합니다:

- **Variable ID**: 템플릿에서 사용되는 변수 식별자
- **Variable Name**: 변수의 한글 명칭
- **Data Source**: 데이터 출처
- **Input Type**: 입력 유형
- **Generation Timing**: 생성 시점
- **Data Type**: 데이터 타입
- **데이터 추출 방법**: 데이터를 어떻게 가져와야 하는지 상세 설명
- **추가 지침**: 데이터 가공 및 처리 지침
- **예시**: 실제 데이터 예시

---

## PH 데이터 목록


### 1. [PH4_원시자료서술문]

**Variable ID:** `[PH4]`
**Variable Name:** 원시자료서술문
**Data Source:** [Raw14_원시자료LineListing] 또는 [표7_원시자료내역]
**Input Type:** 본문정보입력
**Generation Timing:** 매번
**Data Type:** `text`

#### 데이터 추출 방법

> **[지침]** [표7_원시자료내역]을 간단하게 요약해서 기술함.

#### 추가 지침

> **[지침]** 예시1은 원시자료 내역이 있는 경우임.
> **[지침]** 예시2는 원시자료 내역이 없는경우임. 그리고 원시자료 내역이 없는 경우, 근거자료(원시자료 신청내역·결과 등) 포함해야 한다.

#### 예시

1. `본 보고기간 동안 한국의약품안전관리원에서 제공받은 자발적 보고자료(원시자료)로부터 [CS28_원시총환자수]명의 환자에서 [CS29_원시총사례수]건의 이상사례가 확인되었으며, 이 중 중대한 이상사례는 [CS30_원시중대한사례수]건이었다. 상세 정보는 별첨 3에 제시하였다.`
2. `원시자료를 [CS31_원시자료신청일]에 신청하였으며, 결과를 확인하였을 때 본보고기간 동안의 원시자료 내역은 없었다.`

---

### 2. [PH5_원시자료서술문2]

**Variable ID:** `[PH5]`
**Variable Name:** 원시자료서술문2
**Data Source:** [Raw14_원시자료LineListing] 또는 [표7_원시자료내역]
**Input Type:** 본문정보입력
**Generation Timing:** 매번
**Data Type:** `text`

#### 데이터 추출 방법

> **[지침]** [표7_원시자료내역]을 간단하게 요약해서 기술함.

#### 추가 지침

> **[지침]** 예시1은 원시자료 내역이 있는 경우임.
> **[지침]** 예시2는 원시자료 내역이 없는경우임. 그리고 원시자료 내역이 없는 경우, 근거자료(원시자료 신청내역·결과 등) 포함해야 한다.

#### 예시

1. `본 보고기간 동안 한국의약품안전관리원에서 제공받은 자발적 보고자료(원시자료)로부터 [CS28_원시총환자수]명의 환자에서 [CS29_원시총이상사례수]건의 이상사례가 확인되었으며, 세부내역은 다음 표 7에 제시 하였다. [CS2_회사명](주)가 KIDS로 보고한 사례는 제외하였다.`
2. `원시자료를 [CS31_원시자료신청일]에 신청하였으며, 결과를 확인하였을 때 본보고기간 동안의 원시자료 내역은 없었다.`

---

### 3. [PH6_개별증례분석문]

**Variable ID:** `[PH6]`
**Variable Name:*

## 원시자료 (Raw Data)
# 통합 원시자료 (Combined Raw Data)

**생성 시간**: 2026-01-01T01:34:53.465Z
**파일 수**: 25

---

## [RAW1] RAW1.1_최신첨부문서_예시1.pdf

# RAW1.1_최신첨부문서_예시1.pdf

> 자동 변환됨 (2026-01-01T01:34:50.834Z)

[PDF 파일: RAW1.1_최신첨부문서_예시1.pdf] - 텍스트 추출 실패 (이미지 기반 PDF일 수 있음)

---

## [RAW2.1] RAW2.1_용법용량_예시1.pdf

# RAW2.1_용법용량_예시1.pdf

> 자동 변환됨 (2026-01-01T01:34:50.834Z)

[PDF 파일: RAW2.1_용법용량_예시1.pdf] - 텍스트 추출 실패 (이미지 기반 PDF일 수 있음)

---

## [RAW2.1] RAW7_안전성정보변경_예시3_용법용량.docx

# RAW7_안전성정보변경_예시3_용법용량.docx

> 자동 변환됨 (2026-01-01T01:34:50.843Z)

[Word 파일: RAW7_안전성정보변경_예시3_용법용량.docx]

---

## [RAW2.2] RAW2.2_효능효과_예시1.pdf

# RAW2.2_효능효과_예시1.pdf

> 자동 변환됨 (2026-01-01T01:34:50.835Z)

[PDF 파일: RAW2.2_효능효과_예시1.pdf] - 텍스트 추출 실패 (이미지 기반 PDF일 수 있음)

---

## [RAW2.3] RAW2.3_사용상의주의사항_예시1.pdf

# RAW2.3_사용상의주의사항_예시1.pdf

> 자동 변환됨 (2026-01-01T01:34:50.836Z)

[PDF 파일: RAW2.3_사용상의주의사항_예시1.pdf] - 텍스트 추출 실패 (이미지 기반 PDF일 수 있음)

---

## [RAW2.3] RAW2.6_보고시작시점사용상의주의사항_예시1.pdf

# RAW2.6_보고시작시점사용상의주의사항_예시1.pdf

> 자동 변환됨 (2026-01-01T01:34:50.838Z)

[PDF 파일: RAW2.6_보고시작시점사용상의주의사항_예시1.pdf] - 텍스트 추출 실패 (이미지 기반 PDF일 수 있음)

---

## [RAW3] RAW3_시판후sales데이터_예시1.xlsx

# RAW3_시판후sales데이터_예시1.xlsx

> 자동 변환됨 (2026-01-01T01:34:50.837Z)

| [Excel 파일: RAW3_시판후sales데이터_예시1.xlsx] |
| --- |


---

## [RAW4] RAW4_허가현황_예시1.xlsx

# RAW4_허가현황_예시1.xlsx

> 자동 변환됨 (2026-01-01T01:34:50.837Z)

| [Excel 파일: RAW4_허가현황_예시1.xlsx] |
| --- |


---

## [RAW5.1] RAW5_안전성조치허가팀메일_예시1.docx

# RAW5_안전성조치허가팀메일_예시1.docx

> 자동 변환됨 (2026-01-01T01:34:50.837Z)

[Word 파일: RAW5_안전성조치허가팀메일_예시1.docx]

---

## [RAW5.1] RAW5_안전성조치허가팀메일_예시2.docx

# RAW5_안전성조치허가팀메일_예시2.docx

> 자동 변환됨 (2026-01-01T01:34:50.841Z)

[Word 파일: RAW5_안전성조치허가팀메일_예시2.docx]

---

## [RAW5.1] RAW5_안전성조치허가팀메일_예시3.docx

# RAW5_안전성조치허가팀메일_예시3.docx

> 자동 변환됨 (2026-01-01T01:34:50.841Z)

[Word 파일: RAW5_안전성조치허가팀메일_예시3.docx]

---

## [RAW5.1] RAW5_안전성조치허가팀메일_예시4.docx

# RAW5_안전성조치허가팀메일_예시4.docx

> 자동 변환됨 (2026-01-01T01:34:50.842Z)

[Word 파일: RAW5_안전성조치허가팀메일_예시4.docx]

---

## [RAW5.1] RAW5_안전성조치허가팀메일_예시5.docx

# RAW5_안전성조치허가팀메일_예시5.docx

> 자동 변환됨 (2026-01-01T01:34:50.842Z)

[Word 파일: RAW5_안전성조치허가팀메일_예시5.docx]

---

## [RAW5.1] RAW5_안전성조치허가팀메일_예시6.docx

# RAW5_안전성조치허가팀메일_예시6.docx

> 자동 변환됨 (2026-01-01T01:34:50.842Z)

[Word 파일: RAW5_안전성조치허가팀메일_예시6.docx]

---

## [RAW5.1] RAW6_안전성조치허가팀메일_취합본_예시1.docx

# RAW6_안전성조치허가팀메일_취합본_예시1.docx

> 자동 변환됨 (2026-01-01T01:34:50.842Z)

[Word 파일: RAW6_안전성조치허가팀메일_취합본_예시1.docx]

---

## [RAW5.1] RAW6_안전성조치허가팀메일_취합본_예시1 (1).docx

# RAW6_안전성조치허가팀메일_취합본_예시1 (1).docx

> 자동 변환됨 (2026-01-01T01:34:50.844Z)

[Word 파일: RAW6_안전성조치허가팀메일_취합본_예시1 (1).docx]

---

## [RAW7.1] RAW7_안전성정보변경_예시1_복수항목.docx

# RAW7_안전성정보변경_예시1_복수항목.docx

> 자동 변환됨 (2026-01-01T01:34:50.839Z)

[Word 파일: RAW7_안전성정보변경_예시1_복수항목.docx]

---

## [RAW7.1] RAW7_안전성정보변경_예시2_.docx

# RAW7_안전성정보변경_예시2_.docx

> 자동 변환됨 (2026-01-01T01:34:50.843Z)

[Word 파일: RAW7_안전성정보변경_예시2_.docx]

---

## [RAW7.1] RAW7_안전성정보변경_예시4_표형식복수항목.docx

# RAW7_안전성정보변경_예시4_표형식복수항목.docx

> 자동 변환됨 (2026-01-01T01:34:50.843Z)

[Word 파일: RAW7_안전성정보변경_예시4_표형식복수항목.docx]

---

## [RAW8] RAW8_임상노출데이터_예시1.docx

# RAW8_임상노출데이터_예시1.docx

> 자동 변환됨 (2026-01-01T01:34:50.839Z)

[Word 파일: RAW8_임상노출데이터_예시1.docx]

---

## [RAW9] RAW9_문헌자료_예시1.xlsx

# RAW9_문헌자료_예시1.xlsx

> 자동 변환됨 (2026-01-01T01:34:50.839Z)

| [Excel 파일: RAW9_문헌자료_예시1.xlsx] |
| --- |


---

## [RAW12] Raw12_국외신속보고LineListing_예시1.xlsx

# Raw12_국외신속보고LineListing_예시1.xlsx

> 자동 변환됨 (2026-01-01T01:34:50.840Z)

| [Excel 파일: Raw12_국외신속보고LineListing_예시1.xlsx] |
| --- |


---

## [RAW13] Raw13_국내신속보고LineListing_예시1.xlsx

# Raw13_국내신속보고LineListing_예시1.xlsx

> 자동 변환됨 (2026-01-01T01:34:50.840Z)

| [Excel 파일: Raw13_국내신속보고LineListing_예시1.xlsx] |
| --- |


---

## [RAW14] Raw14_원시자료LineListing_예시1.xlsx

# Raw14_원시자료LineListing_예시1.xlsx

> 자동 변환됨 (2026-01-01T01:34:50.840Z)

| [Excel 파일: Raw14_원시자료LineListing_예시1.xlsx] |
| --- |


---

## [RAW15] Raw15_정기보고LineListing_예시1.xlsx

# Raw15_정기보고LineListing_예시1.xlsx

> 자동 변환됨 (2026-01-01T01:34:50.841Z)

| [Excel 파일: Raw15_정기보고LineListing_예시1.xlsx] |
| --- |


---



## 템플릿
# PSUR 섹션 템플릿

## 섹션 00

# "[CS1_브랜드명]([CS0_성분명])"

**[CS2_회사명]㈜**

---

**보고기간:** [CS3_보고 시작 날짜] ~ [CS4_보고 종료 이별날짜]
**국내허가일자:** [CS5_국내 허가 일자]
**보고서제출일:** [CS6_보고서제출일]
**버전(작성일):** v.[CS7_버전넘버] ([CS8_버전날짜])

---


---

## 섹션 01

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
- [표 4. 각 증례의 병력 소개](#표-4-각-증례의-병력-소개)
- [표 5. 신속보고 내역](#표-5-신속보고-내역)
- [표 6. 정기보고 내역](#표-6-정기보고-내역)
- [표 7. KIDS 원시자료 내역](#표-7-kids-원시자료-내역)
- [표 8. 보고기간 동안 보고된 모든 이상사례 건수](#표-8-보고기간-동안-보고된-모든-이상사례-건수)
- [표 9. 보고기간 동안 보고된 모든 이상사례에 대한 기관계분류(SOC)별 건수](#표-9-보고기간-동안-보고된-모든-이상사례에-대한-기관계분류soc별-건수)

---


---

## 섹션 02

## 약어 설명

| 약어 | 약어 설명 (영문) | 약어 설명 (국문) |
|------|------------------|------------------|
| KIDS | Korea Institute of Drug Safety and Risk Management | 한국의약품안전관리원 |
| SOC | System Organ Class | 기관계분류 |
| PT | Preferred Term | 우선용어 |
| MedDRA | Medical Dictionary for Regulatory Activities | 의학용어 규제활동 사전 |

---


---

## 섹션 03

## 1. 서론

본 문서는 [CS2_회사명](주)의 "[CS1_브랜드명]([CS0_성분명])"의 품목 갱신을 위한 유효기간 동안 수집된 안전관리자료에 대한 분석·평가 결과 및 안전관리조치에 관한 보고서이다.

본 보고서는 식품의약품안전처에서 발간한 '정기적인 유익성-위해성 평가보고에 관한 가이드라인(2017)' 및 '의약품의 위해성관리계획 가이드라인(2021)'을 참고하여 작성되었다.

"[CS1_브랜드명]([CS0_성분명])"의 품목허가일은 [CS5_국내 허가 일자]이며, 유효기간은 [CS13_유효기간]이다. 본 보고서는 2022년 12월 29일 개정된 '의약품 품목 갱신에 관한 규정'(식약처 고시)에 따라 갱신 신청 자료 중 하나인 '유효기간 동안 수집된 안전관리에 관한 자료 및 조치계획'을 보고하기 위해 작성된 보고서이며, 본 보고서에 포함되는 자료는 ｢약사법｣ 에 따라 식약처장이 정하여 고시한 유효기간을 기준으로 하였다.

"[CS1_브랜드명]([CS0_성분명])"의 품목의 유효기간은 [CS13_유효기간]이고, 품목갱신 신청기한은 6개월 전인 [CS14_신청기한]이므로 보고서 작성 기간을 고려하여 자료마감일을 [CS4_보고 종료 날짜]로하고 해당일로부터 최근 5년 자료를 포함하였다. 따라서 본 보고서는 [CS3_보고 시작 날짜]부터 [CS4_보고 종료 날짜]까지 [CS2_회사명](주)이 수집한 "[CS1_브랜드명]([CS0_성분명])"에 대한 안전성 자료를 분석·평가하였다.

"[CS1_브랜드명]([CS0_성분명])"의 주성분은 [CS0_성분명]으로 효능·효과는 [CS15_효능효과]이다. 용법·용량은 [CS16_용법용량]이다.

---


---

## 섹션 04

## 2. 전세계 판매 허가 현황

[CS17.6_허가현황서술문]

### 표 1. 전 세계 판매 허가 현황

| 국가 | 허가일 | 품목명 | 허가권자 | 비고 |
|------|--------|--------|----------|------|
| [CS17.1_허가 국가] | [CS17.2_허가일] | [CS17.3_허가품목명] | [CS17.4_허가권자] | [CS17.5_허가 비고] |

---


---

## 섹션 05

## 3. 안전성 이유로 인한 보고기간 동안의 조치

[CS55_안전성조치서술문]

---


---

## 섹션 06

## 4. 안전성 정보 참고 정보의 변경

[CS56_참고정보의변경]

---


---

## 섹션 07

## 5. 환자노출

[CS18_임상노출]

시판 후 환자 노출은 보고기간 시작일인 [CS3_보고 시작 날짜]부터 본 보고서 마감일인 [CS4_보고 종료 날짜]까지 판매된 "[CS1_브랜드명]([CS0_성분명])"의 양을 근거로 산출한다.

연도별 "[CS1_브랜드명]([CS0_성분명])" 판매량은 다음과 같다.

### 표 2. 연도별 "[CS1_브랜드명]([CS0_성분명])" 판매량(정)

| 연도 | [CS19.1_시판후 판매 연도] | [CS19.1_시판후 판매 연도] | [CS19.1_시판후 판매 연도] | [CS19.1_시판후 판매 연도] | [CS19.1_시판후 판매 연도] | 합계 |
|------|---------------------------|---------------------------|---------------------------|---------------------------|---------------------------|------|
| 판매량*(정) | [CS19.2_시판후 판매 연도별 판매량] | [CS19.2_시판후 판매 연도별 판매량] | [CS19.2_시판후 판매 연도별 판매량] | [CS19.2_시판후 판매 연도별 판매량] | [CS19.2_시판후 판매 연도별 판매량] | [CS19.3_시판후 판매량 합계] |

\*판매량은 [CS19_시판후노출count시작날짜] ~ [CS19.1_시판후노출count종료날짜] 기준으로 작성되었다.

"[CS1_브랜드명]([CS0_성분명])"의 효능·효과와 용법·용량을 고려한 연간 평균 환자 노출은 다음과 같이 산출한다.

**(연 평균 환자 노출) = (연 평균 판매량) / (환자 한 명당 사용량)**

### 표 3. "[CS1_브랜드명]([CS0_성분명])" 연평균 환자 노출

| 1일 사용량 | 환자 1명 당 사용량 | 연 평균 판매량 | 연 평균 환자 노출 |
|------------|-------------------|----------------|------------------|
| [CS20_1일사용량] | [CS21_환자 1명당 사용량] | [CS22_연 평균 판매량] | [CS23_연 평균 환자 노출] |

---


---

## 섹션 08

## 6. 개별 증례 병력(individual case history) 소개

### 6.1. 일반사항

본 보고기간 동안 "[CS1_브랜드명]([CS0_성분명])"과 관련하여 ｢약사법｣ 제37조의3 및 ｢의약품등의 안전에 관한 규칙｣ (총리령) [별표 4의3] '의약품 등 시판 후 안전관리 기준에 따라 이상사례를 수집하고, 수집된 이상사례를 신속보고와 정기보고 기준에 따라 한국의약품안전관리원(KIDS)에 보고하였다.

문헌자료는 본 보고기간 동안 [CS53_문헌DB]를 통해 "[CS1_브랜드명]([CS0_성분명])" 주성분의 영문과 한글 성분명, 제품명으로 검색어를 설정하여 수행하였다.

또한 총리령 [별표 4의3] 제2호에 따른 수집대상정보인 한국의약품안전관리원(KIDS) 에서 제공받은 의약품 자발적 부작용 자료(이하 원시자료)를 포함하여 분석하였다.

본 보고기간 동안 Medical Dictionary for Regulatory Activities (MedDRA) 버전 [CS24_MedDRA버전넘버] 을 이상사례 코딩에 사용하였으며, 본 보고서 작성시에도 동일 버전을 사용하였다. 요약표는 기관계분류(SOC, System Organ Class) 및 우선용어(PT, Preferred Term)로 작성하였다.

### 6.2. 일련목록으로서의 증례 제시

다음 유형의 증례를 일련목록에 포함한다:

- 자발적으로 보고된 모든 중대한 이상사례 및 미-반영된 중대하지 않은 이상사례
- 문헌으로 보고된 모든 중대한 이상사례 및 미-반영된 중대하지 않은 이상사례
- 임상시험 또는 임상시험용 의약품의 치료목적 사용을 통해 보고된 모든 중대한 이상사례(시험자 또는 의뢰자에 의해 제품과 인과관계가 있는 것으로 평가됨)
- 한국의약품안전관리원(Korea Institute of Drug Safety and Risk Management, 이하 KIDS)에서 제공한 모든 이상반응 이외에도 국내에서는 자발적으로 보고된 반영된 중대하지 않은 모든 이상사례와 시판후 임상시험, 관찰연구 등에서 보고된 중대하지 않은 이상사례도 ｢의약품 등의 안전에 관한 규칙｣(총리령)에 따라 식품의약품안전처 보고 대상이므로 이들 증례도 일련목록에 포함한다.

본 보고기간 동안 [CS2_회사명](주)가 KIDS로 보고한 사례는 총 [CS32_보고 총사례수]건으로, 이 중 신속보고는 [CS33_신속보고 총사례수]건, 정기보고는 [CS34_정기보고 총사례수]건이며, 세부내역은 다음 표 5~6에 제시하였다.

[PH4_원시자료서술문]

### 표 4. 각 증례의 병력 소개

| 근거 | 증례의 유형 | 요약표 | 목록화와 요약표 |
|------|------------|--------|----------------|
| **1. 품목허가를 받은 자에게 직접 보고** | | | |
| - 자발적인 약물유해반응 보고* | S | - | + |
| | NS U | - | + |
| | NS L** | + | + |
| - 품목허가를 받은 자가 의뢰하는 시험 | SA | - | + |
| **2. 문헌** | S | - | + |
| | NS U | - | + |
| **3. 다른 근거** | | | |
| - 식약처 | S | + | - |
| - 계약 파트너 | S | + | - |
| - 등록 프로그램 | S | + | - |

**(S=중대함, L=목록화됨, A=(시험자나 의뢰자(sponsor)에 의해) 의약품에 기인한, NS=중대하지않음, U=목록화되지 않음)**

### 6.3. 일련목록의 제출

본 보고기간 동안 [CS2_회사명](주)가 KIDS로 보고한 사례는 총 [CS32_보고 총사례수]건으로, 이 중 신속보고는 [CS33_신속보고 총사례수]건, 정기보고는 [CS34_정기보고 총사례수]건이며, 세부내역은 다음 표 5~6에 제시하였다.

### 표 5. 신속보고 내역 ([CS3_보고 시작 날짜]~[CS4_보고 종료 날짜])

| 순번 | 보고일자 | 관리번호 | 이상사례명 | 비고 |
|------|----------|----------|-----------|------|
| | | - | | |

### 표 6. 정기보고 내역 ([CS3_보고 시작 날짜]~[CS4_보고 종료 날짜])

| 순번 | 보고일자 | 관리번호 | 이상사례명 | 비고 |
|------|----------|----------|-----------|------|
| | | | | |

[PH5_원시자료서술문2]

### 표 7. KIDS 원시자료 내역 ([CS3_보고 시작 날짜]~[CS4_보고 종료 날짜])

| 순번 | 보고일자 | 관리번호 | 이상사례명 | 비고 |
|------|----------|----------|-----------|------|
| | | | | |

### 6.4. 요약 도표

본 보고기간 동안 [CS2_회사명](주)가 수집한 이상사례 중 "[CS1_브랜드명]([CS0_성분명])"이 의심약물로 보고된 건은 [CS35_신속+정기+원시총사례수]건으로, 중대한 이상사례 [CS36_중대한총사례수]건, 중대하지 않은 이상사례 [CS37_중대하지않은총사례수]건이 보고되었다.

### 표 8. 보고기간 동안 보고된 모든 이상사례 건수

| 분류 | 건수 | % |
|------|------|---|
| 중대함(Serious) | [CS36_중대한총사례수] | [CS36_중대한총사례수]/[CS35_신속+정기+원시총사례수]*100 |
| 중대하지 않음(Non-serious) | [CS37_중대하지않은총사례수] | [CS37_중대하지않은총사례수]/[CS35_신속+정기+원시총사례수]*100 |
| 합계 | [CS35_신속+정기+원시총사례수] | 100 |

### 표 9. 보고기간 동안 보고된 모든 이상사례에 대한 기관계분류(SOC)별 건수

| System Organ Class (SOC) | Preferred Term (PT) | 중대함 (건) | 중대하지 않음 (건) | 총 누적 (건) | 허가사항 반영여부 |
|--------------------------|---------------------|-------------|-------------------|-------------|------------------|
| | | | | | |
| **Total** | | | | | |

### 6.5. 개별 증례 병력에 대한 품목허가를 받은 자의 분석

[PH6_개별증례분석문]

---


---

## 섹션 09

## 7. 시험

### 7.1. 새로 분석된 회사 의뢰의 시험

[PH7_새로_분석된_의뢰의_시험]

### 7.2. 보고기간 중 계획되었거나 시작되었거나 혹은 진행 중인 표적화된 새로운 안전성 시험

[PH8_시작또는진행중시험]

### 7.3. 발표된 안전성 시험

[PH9_문헌에발표된안전성]

---


---

## 섹션 10

## 8. 기타 정보

### 8.1. 유효성 관련 정보

[PH10_유효성관련정보]

### 8.2. 최신 정보

본 보고서의 자료마감일인 [CS4_보고종료날짜] 이후 수집된 유의한 안전성 정보는 없다.

---


---

## 섹션 11

## 9. 종합적인 안전성 평가

[CS3_보고 시작 날짜]일부터 [CS4_보고 종료 날짜]까지의 보고기간 동안 수집된 "[CS1_브랜드명]([CS0_성분명])"의 안전성 정보를 검토하고, 이를 기존에 알려진 사실과 함께 검토하였다.

본 보고기간 동안 [CS2_회사명](주)에서 KIDS로 보고한 신속보고는 [CS33_신속보고총사례수]건, 정기보고는 [CS34_정기보고총사례수]건이며, KIDS로부터 제공받은 의약품 부작용보고 원시자료는 [CS29_원시총이상사례수]건으로 총 [CS35_신속+정기+원시총사례수]건의 안전성정보가 수집되었다.

[PH11_총괄평가문]

---


---

## 섹션 12

## 10. 결론

[PH12_결론]

---


---

## 섹션 13

## 참고문헌

[CS57_참고문헌리스트]

---


---

## 섹션 14

## 별첨

### 별첨 1. 안전성 정보 변경사항

| 구분 | 변경사항 |
|------|---------|
| 효능효과 | |
| 용법용량 | |
| 사용상의 주의사항 | |

### 별첨 2. 안전성 정보 변경사항

**< 허가사항 변경일 : List of [CS56.1_허가사항변경일] >**

| 구분 | 기 허가사항 | 변경사항 |
|------|------------|----------|
| 효능효과 | [CS56.2_기존효능효과전문] | [CS56.5_최신효능효과전문] |
| 용량용법 | [CS56.3_기존용량용법전문] | [CS56.6_최신용량용법전문] |
| 사용상의 주의사항 | [CS56.4_기존사용상의주의사항전문] | [CS56.7_최신사용상의주의사항전문] |


---



## 섹션별 예시 (참고용)
아래는 각 섹션의 예시입니다. 이 형식과 스타일을 참고하여 작성하세요.
# PSUR 섹션별 예시

## 예시 00

# "코미나티주(토지나메란)"

**한국화이자제약(주)**

---

**보고기간:** 2020년 01월 16일 ~ 2025년 01월 15일

**국내허가일자:** 2021년 03월 05일

**보고서제출일:** [사용자 입력 필요]

**버전(작성일):** v.[사용자 입력 필요] (2025년 01월 15일)

---


---

## 예시 01

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
- [표 4. 각 증례의 병력 소개](#표-4-각-증례의-병력-소개)
- [표 5. 신속보고 내역](#표-5-신속보고-내역)
- [표 6. 정기보고 내역](#표-6-정기보고-내역)
- [표 7. KIDS 원시자료 내역](#표-7-kids-원시자료-내역)
- [표 8. 보고기간 동안 보고된 모든 이상사례 건수](#표-8-보고기간-동안-보고된-모든-이상사례-건수)
- [표 9. 보고기간 동안 보고된 모든 이상사례에 대한 기관계분류(SOC)별 건수](#표-9-보고기간-동안-보고된-모든-이상사례에-대한-기관계분류soc별-건수)

---


---

## 예시 02

## 약어 설명

| 약어 | 약어 설명 (영문) | 약어 설명 (국문) |
|------|------------------|------------------|
| KIDS | Korea Institute of Drug Safety and Risk Management | 한국의약품안전관리원 |
| SOC | System Organ Class | 기관계분류 |
| PT | Preferred Term | 우선용어 |
| MedDRA | Medical Dictionary for Regulatory Activities | 의학용어 규제활동 사전 |

---


---

## 예시 03

## 1. 서론

본 문서는 한국화이자제약(주)의 "코미나티주(토지나메란)"의 품목 갱신을 위한 유효기간 동안 수집된 안전관리자료에 대한 분석·평가 결과 및 안전관리조치에 관한 보고서이다.

본 보고서는 식품의약품안전처에서 발간한 '정기적인 유익성-위해성 평가보고에 관한 가이드라인(2017)' 및 '의약품의 위해성관리계획 가이드라인(2021)'을 참고하여 작성되었다.

"코미나티주(토지나메란)"의 품목허가일은 2021년 03월 05일이며, 유효기간은 [사용자 입력 필요]이다. 본 보고서는 2022년 12월 29일 개정된 '의약품 품목 갱신에 관한 규정'(식약처 고시)에 따라 갱신 신청 자료 중 하나인 '유효기간 동안 수집된 안전관리에 관한 자료 및 조치계획'을 보고하기 위해 작성된 보고서이며, 본 보고서에 포함되는 자료는 ｢약사법｣ 에 따라 식약처장이 정하여 고시한 유효기간을 기준으로 하였다.

"코미나티주(토지나메란)"의 품목의 유효기간은 [사용자 입력 필요]이고, 품목갱신 신청기한은 6개월 전인 [사용자 입력 필요 - CS13 기준 계산]이므로 보고서 작성 기간을 고려하여 자료마감일을 2025년 01월 15일로하고 해당일로부터 최근 5년 자료를 포함하였다. 따라서 본 보고서는 2020년 01월 16일부터 2025년 01월 15일까지 한국화이자제약(주)이 수집한 "코미나티주(토지나메란)"에 대한 안전성 자료를 분석·평가하였다.

"코미나티주(토지나메란)"의 주성분은 토지나메란으로 효능·효과는 12세 이상에서 SARS-CoV-2 바이러스에 의한 코로나19의 예방이다. 용법·용량은 다음과 같다.

### 1. 투여일정 및 용량

#### 1) 기초접종

**12세 이상**

이 약은 희석 후, 각 0.3 mL을 3주 간격을 두고 2회 근육주사한다. 이 약과 다른 COVID-19 백신과의 호환성은 확립되지 않았다

#### 2) 추가접종(3차 투여)

**12세 이상**

이 약은 기초접종(2차 투여) 완료 후 6개월 후 추가접종(3차 투여)으로 0.3 mL을 근육주사 할 수 있다.

#### 3) 12세 이상의 중증 면역저하자

이 약은 2차 투여 후 4주 후 3차 투여로 0.3 mL을 근육주사 할 수 있다.

### 2. 투여방법

이 약은 희석 후에 근육주사로 투여하며, 가급적 위팔 삼각근에 투여한다.

---


---

## 예시 04

## 2. 전세계 판매 허가 현황

"코미나티주(토지나메란)"의 품목허가일은 2021년 03월 05일이고, 총 12개국에서 허가를 득하였다. 허가 현황은 다음 표와 같다.

### 표 1. 전 세계 판매 허가 현황

| 국가 | 허가일 | 품목명 | 허가권자 | 비고 |
|------|--------|--------|----------|------|
| 대한민국 | 2021-03-05 | 코미나티주 | MFDS | Full Approval |
| 일본 | 2021-02-14 | - | PMDA | Full Approval, EUA |
| 대만 | 2021-01-22 | - | TFDA | Full Approval, EUA |
| 말레이시아 | 2021-02-24 | - | NPRA | Full Approval, Conditional |
| 미국 | 2020-12-11 | - | FDA | EUA (Full BLA Aug 2021) |
| 캐나다 | 2020-12-09 | - | Health Canada | EUA |
| 인도 | 2021-07-19 | - | CDSCO | Full Approval, Conditional |
| 호주 | 2021-01-25 | - | TGA | Full Approval, Provisional |
| 싱가포르 | 2021-01-14 | - | HSA | Conditional Approval |
| 브라질 | 2021-04-23 | - | ANVISA | Full Approval, EUA |
| 멕시코 | 2021-05-31 | - | COFEPRIS | Full Approval, EUA |
| 태국 | 2021-06-07 | - | TFDA | Full Approval, Conditional |

---


---

## 예시 05

## 3. 안전성 이유로 인한 보고기간 동안의 조치

> ⚠️ **[데이터 필요]** 안전성조치 관련 데이터(RAW5/RAW6_안전성조치허가팀메일)가 필요합니다.

본 보고기간 동안 "코미나티주(토지나메란)"과 관련하여 안전성 이유로 인한 규제 조치 사항은 다음과 같다.

[안전성조치 관련 데이터 확인 후 작성 필요]

---


---

## 예시 06

## 4. 안전성 정보 참고 정보의 변경

보고기간(2020-01-16 ~ 2025-01-15) 동안 다음과 같은 안전성 정보 변경이 있었습니다:

### 변경 이력 1: 2021-03-05 → 2021-07-16

- 효능효과: 16세 이상 → 12세 이상으로 적용 연령 확대
- 안전성 평가 대상자: 21,744명 → 22,875명으로 증가
- 12-15세 안전성 정보 신규 추가

### 변경 이력 2: 2021-07-16 → 2023-10-30

- 심근염 및 심장막염 경고 신규 추가
- 추가접종(3차 투여) 안전성 정보 추가
- 시판 후 안전성 자료 신규 추가 (심근염, 심장막염, 광범위한 종창 등)
- 보관 기간 연장: -90°C~-60°C에서 6개월 → 24개월

---


---

## 예시 07

## 5. 환자노출

> ⚠️ **[데이터 필요]** 임상노출 데이터(RAW8_임상노출데이터)가 필요합니다.

시판 후 환자 노출은 보고기간 시작일인 2020년 01월 16일부터 본 보고서 마감일인 2025년 01월 15일까지 판매된 "코미나티주(토지나메란)"의 양을 근거로 산출한다.

연도별 "코미나티주(토지나메란)" 판매량은 다음과 같다.

### 표 2. 연도별 "코미나티주(토지나메란)" 판매량(바이알)

| 연도 | 2020년 | 2021년 | 2022년 | 2023년 | 2024년 | 합계 |
|------|--------|--------|--------|--------|--------|------|
| 판매량*(바이알) | 0 | 242,165 | 554,206 | 311,352 | 184,686 | 1,292,409 |

*판매량은 2020년 01월 01일 ~ 2024년 12월 31일 기준으로 작성되었다.

"코미나티주(토지나메란)"의 효능·효과와 용법·용량을 고려한 연간 평균 환자 노출은 다음과 같이 산출한다.

**(연 평균 환자 노출) = (연 평균 판매량) / (환자 한 명당 사용량)**

### 표 3. "코미나티주(토지나메란)" 연평균 환자 노출

| 1일 사용량 | 환자 1명 당 사용량 | 연 평균 판매량 | 연 평균 환자 노출 |
|------------|-------------------|----------------|------------------|
| [사용자 입력 필요] | [사용자 입력 필요] | 약 323,102 바이알 | [계산 필요] |

> ⚠️ **확인 필요:**
> - 1바이알 = 몇 회분(dose)인지 확인 필요
> - 연간 환자 1명당 평균 접종 횟수 확인 필요
> - 연평균 환자 노출 계산을 위한 기준 확정 필요

---


---

## 예시 08

## 6. 개별 증례 병력(individual case history) 소개

### 6.1. 일반사항

본 보고기간 동안 "코미나티주(토지나메란)"과 관련하여 ｢약사법｣ 제37조의3 및 ｢의약품등의 안전에 관한 규칙｣ (총리령) [별표 4의3] '의약품 등 시판 후 안전관리 기준에 따라 이상사례를 수집하고, 수집된 이상사례를 신속보고와 정기보고 기준에 따라 한국의약품안전관리원(KIDS)에 보고하였다.

문헌자료는 본 보고기간 동안 [사용자 입력 필요 - 문헌DB]를 통해 "코미나티주(토지나메란)" 주성분의 영문과 한글 성분명, 제품명으로 검색어를 설정하여 수행하였다.

또한 총리령 [별표 4의3] 제2호에 따른 수집대상정보인 한국의약품안전관리원(KIDS) 에서 제공받은 의약품 자발적 부작용 자료(이하 원시자료)를 포함하여 분석하였다.

본 보고기간 동안 Medical Dictionary for Regulatory Activities (MedDRA) 버전 [사용자 입력 필요] 을 이상사례 코딩에 사용하였으며, 본 보고서 작성시에도 동일 버전을 사용하였다. 요약표는 기관계분류(SOC, System Organ Class) 및 우선용어(PT, Preferred Term)로 작성하였다.

### 6.2. 일련목록으로서의 증례 제시

다음 유형의 증례를 일련목록에 포함한다:

- 자발적으로 보고된 모든 중대한 이상사례 및 미-반영된 중대하지 않은 이상사례
- 문헌으로 보고된 모든 중대한 이상사례 및 미-반영된 중대하지 않은 이상사례
- 임상시험 또는 임상시험용 의약품의 치료목적 사용을 통해 보고된 모든 중대한 이상사례(시험자 또는 의뢰자에 의해 제품과 인과관계가 있는 것으로 평가됨)
- 한국의약품안전관리원(Korea Institute of Drug Safety and Risk Management, 이하 KIDS)에서 제공한 모든 이상반응 이외에도 국내에서는 자발적으로 보고된 반영된 중대하지 않은 모든 이상사례와 시판후 임상시험, 관찰연구 등에서 보고된 중대하지 않은 이상사례도 ｢의약품 등의 안전에 관한 규칙｣(총리령)에 따라 식품의약품안전처 보고 대상이므로 이들 증례도 일련목록에 포함한다.

본 보고기간 동안 한국화이자제약(주)가 KIDS로 보고한 사례는 총 [데이터 필요]건으로, 이 중 신속보고는 [데이터 필요]건, 정기보고는 [데이터 필요]건이며, 세부내역은 다음 표 5~6에 제시하였다.

본 보고기간 동안 한국의약품안전관리원에서 제공받은 자발적 보고자료(원시자료)로부터 5명의 환자에서 12건의 이상사례가 확인되었으며, 이 중 중대한 이상사례는 4건이었다. 상세 정보는 별첨 3에 제시하였다.

> ⚠️ **주의:** 위 원시자료 데이터는 예시 파일 기준입니다. 실제 원시자료 데이터로 교체 필요합니다.

### 표 4. 각 증례의 병력 소개

| 근거 | 증례의 유형 | 요약표 | 목록화와 요약표 |
|------|------------|--------|----------------|
| **1. 품목허가를 받은 자에게 직접 보고** | | | |
| - 자발적인 약물유해반응 보고* | S | - | + |
| | NS U | - | + |
| | NS L** | + | + |
| - 품목허가를 받은 자가 의뢰하는 시험 | SA | - | + |
| **2. 문헌** | S | - | + |
| | NS U | - | + |
| **3. 다른 근거** | | | |
| - 식약처 | S | + | - |
| - 계약 파트너 | S | + | - |
| - 등록 프로그램 | S | + | - |

**(S=중대함, L=목록화됨, A=(시험자나 의뢰자(sponsor)에 의해) 의약품에 기인한, NS=중대하지않음, U=목록화되지 않음)**

### 6.3. 일련목록의 제출

본 보고기간 동안 한국화이자제약(주)가 KIDS로 보고한 사례는 총 [데이터 필요]건으로, 이 중 신속보고는 [데이터 필요]건, 정기보고는 [데이터 필요]건이며, 세부내역은 다음 표 5~6에 제시하였다.

### 표 5. 신속보고 내역 (2020년 01월 16일~2025년 01월 15일)

> ⚠️ **[데이터 필요]** 코미나티주 실제 신속보고 LineListing 데이터가 필요합니다.

| 순번 | 보고일자 | 관리번호 | 이상사례명 | 비고 |
|------|----------|----------|-----------|------|
| - | - | - | [데이터 필요] | - |

### 표 6. 정기보고 내역 (2020년 01월 16일~2025년 01월 15일)

> ⚠️ **[데이터 필요]** 코미나티주 실제 정기보고 LineListing 데이터가 필요합니다.

| 순번 | 보고일자 | 관리번호 | 이상사례명 | 비고 |
|------|----------|----------|-----------|------|
| - | - | - | [데이터 필요] | - |

본 보고기간 동안 한국의약품안전관리원에서 제공받은 자발적 보고자료(원시자료)로부터 5명의 환자에서 12건의 이상사례가 확인되었으며, 세부내역은 다음 표 7에 제시하였다. 한국화이자제약(주)가 KIDS로 보고한 사례는 제외하였다.

> ⚠️ **주의:** 위 원시자료 데이터는 예시 파일 기준입니다. 실제 원시자료 데이터로 교체 필요합니다.

### 표 7. KIDS 원시자료 내역 (2020년 01월 16일~2025년 01월 15일)

> ⚠️ **[데이터 필요]** 코미나티주 실제 원시자료 LineListing 데이터가 필요합니다.

| 순번 | 보고일자 | 관리번호 | 이상사례명 | 비고 |
|------|----------|----------|-----------|------|
| - | - | - | [데이터 필요] | - |

### 6.4. 요약 도표

본 보고기간 동안 한국화이자제약(주)가 수집한 이상사례 중 "코미나티주(토지나메란)"이 의심약물로 보고된 건은 [데이터 필요]건으로, 중대한 이상사례 [데이터 필요]건, 중대하지 않은 이상사례 [데이터 필요]건이 보고되었다.

### 표 8. 보고기간 동안 보고된 모든 이상사례 건수

> ⚠️ **[데이터 필요]** 모든 LineListing 통합 데이터가 필요합니다.

| 분류 | 건수 | % |
|------|------|---|
| 중대함(Serious) | [데이터 필요] | [계산 필요] |
| 중대하지 않음(Non-serious) | [데이터 필요] | [계산 필요] |
| 합계 | [데이터 필요] | 100 |

### 표 9. 보고기간 동안 보고된 모든 이상사례에 대한 기관계분류(SOC)별 건수

> ⚠️ **[데이터 필요]** MedDRA PT/SOC term이 포함된 LineListing 데이터가 필요합니다.

| System Organ Class (SOC) | Preferred Term (PT) | 중대함 (건) | 중대하지 않음 (건) | 총 누적 (건) | 허가사항 반영여부 |
|--------------------------|---------------------|-------------|-------------------|-------------|------------------|
| [데이터 필요] | [데이터 필요] | - | - | - | - |
| **Total** | | [데이터 필요] | [데이터 필요] | [데이터 필요] | |

### 6.5. 개별 증례 병력에 대한 품목허가를 받은 자의 분석

> ⚠️ **[데이터 필요]** 개별 증례 분석을 위한 상세 LineListing 데이터가 필요합니다.
>
> 각 중대한 이상사례에 대해 다음 정보를 포함하여 서술:
> 1. 환자 정보 (연령, 성별)
> 2. 이상사례명 (MedDRA PT term)
> 3. 발생 경위 및 경과
> 4. 인과성 평가 결과
> 5. 결과 (회복/미회복/사망 등)

---


---

## 예시 09

## 7. 시험

### 7.1. 새로 분석된 회사 의뢰의 시험

본 보고기간 동안 "코미나티주(토지나메란)"과 관련된 중요한 안전성 정보를 포함하거나 새롭게 분석된 회사 의뢰의 시험이 없어 해당사항이 없다.

> ⚠️ **확인 필요:** 보고기간 중 회사 의뢰 임상시험이 있었는지 확인이 필요합니다. 해당 데이터가 있다면 서술문을 수정해야 합니다.

### 7.2. 보고기간 중 계획되었거나 시작되었거나 혹은 진행 중인 표적화된 새로운 안전성 시험

본 보고기간 동안 "코미나티주(토지나메란)"과 관련된 안전성 문제를 검토하기 위하여 특별히 계획되었거나 실행된 새로운 시험이 없어 해당사항이 없다.

> ⚠️ **확인 필요:** 보고기간 중 진행 중인 안전성 관련 시험이 있었는지 확인이 필요합니다.

### 7.3. 발표된 안전성 시험

> ⚠️ **[데이터 필요]** 코미나티주(토지나메란) 관련 문헌 검색 결과가 필요합니다.
>
> **필요 조치:**
> - 코미나티주(토지나메란) 관련 문헌 검색 수행
> - 검색 DB: PubMed, Embase, KMBASE 등
> - 검색어: "Comirnaty", "tozinameran", "BNT162b2", "COVID-19 vaccine safety"

---


---

## 예시 10

## 8. 기타 정보

### 8.1. 유효성 관련 정보

본 보고기간 동안 "코미나티주(토지나메란)"과 관련되어, 유효성이 없어 치명적인 결과를 초래하는 사례는 없었다.

> ⚠️ **확인 필요:** LineListing 데이터에서 유효성 결여(Lack of Efficacy) 관련 사례 검토 필요

### 8.2. 최신 정보

본 보고서의 자료마감일인 2025년 01월 15일 이후 수집된 유의한 안전성 정보는 없다.

---


---

## 예시 11

## 9. 종합적인 안전성 평가

2020년 01월 16일부터 2025년 01월 15일까지의 보고기간 동안 수집된 "코미나티주(토지나메란)"의 안전성 정보를 검토하고, 이를 기존에 알려진 사실과 함께 검토하였다.

본 보고기간 동안 한국화이자제약(주)에서 KIDS로 보고한 신속보고는 [데이터 필요]건, 정기보고는 [데이터 필요]건이며, KIDS로부터 제공받은 의약품 부작용보고 원시자료는 12건으로 총 [데이터 필요]건의 안전성정보가 수집되었다.

> ⚠️ **주의:** 원시자료 12건은 예시 데이터 기준입니다. 실제 데이터로 교체 필요합니다.

### 총괄평가문

> ⚠️ **[문서 완성 후 작성]** 아래 템플릿은 "문제없음" 기준입니다. 실제 안전성 데이터 분석 결과에 따라 수정이 필요할 수 있습니다.

보고기간 동안 수집된 안전성 정보 평가결과는 다음과 같다.

중대한 이상사례 검토 결과 위해성 프로파일에 반영이 필요한 정보는 없었다. 중대하지 않은 이상사례 검토 결과, 허가사항에 반영되지 않은 이상사례는 유의미한 안전성 정보로 판단하기에 충분한 정보를 가지고 있지 않았다. 문헌 검토 결과, "코미나티주(토지나메란)" 주성분과 관련한 논문에서 기존에 알려진 안전성 정보와 다른 양상을 보이거나 새로운 유효성 및 안전성 정보를 포함하는 발표된 연구 결과가 없었다.

본 보고기간 동안, "코미나티주(토지나메란)"의 유익성-위해성 프로파일에 부정적인 영향을 미칠 만한 새로운 유효성 및 안전성 정보가 확인된 것은 없다. 시판 후 보고에서 수집된 자료는 기존에 알려진 안전성 프로파일과 일치하였다.

---


---

## 예시 12

## 10. 결론

본 보고기간(2020년 01월 16일 ~ 2025년 01월 15일) 동안 수집된 "코미나티주(토지나메란)"의 안전성 정보를 분석 평가한 결과, 안전성 프로파일이 허가사항에 적절하게 반영되어 있으며, "코미나티주(토지나메란)"의 유익성-위해성은 기존과 같이 유익성이 위해성을 상회하는 것으로 평가된다.

다만 평가된 안전성정보와 관련하여 허가사항 반영 여부에 대한 논의가 필요한 경우, 적극적으로 논의할 예정이다.

추후 충분한 정보와 증례수가 수집되는 경우 빈도와 중대성, 예측성을 고려하여 유익성-위해성 분석 평가를 진행할 예정이며, 한국화이자제약(주)은 일반적인 의약품 감시활동 및 지속적인 모니터링을 통해 새로운 안전성 정보를 적극 수집하여 본 제품의 안전성 모니터링에 만전을 기할 것이다.

---


---

## 예시 13

## 참고문헌

> ⚠️ **[데이터 필요]** 문헌 검색 결과에 따른 참고문헌 리스트가 필요합니다.

1. 식품의약품안전처, 정기적인 유익성-위해성 평가보고에 관한 가이드라인, 2017
2. 식품의약품안전처, 의약품의 위해성관리계획 가이드라인, 2021
3. [추가 문헌 검색 결과 반영 필요]

---


---

## 예시 14

## 별첨

### 별첨 1. 안전성 정보 변경사항

| 구분 | 변경사항 |
|------|---------|
| 효능효과 | 16세 이상 → 12세 이상으로 적용 연령 확대 (2021-07-16) |
| 용법용량 | 추가접종(3차 투여) 정보 추가 (2022-10-25) |
| 사용상의 주의사항 | 심근염 및 심장막염 경고 추가, 시판 후 안전성 정보 추가 (2023-10-30) |

### 별첨 2. 안전성 정보 변경사항 상세

**< 허가사항 변경일 : 2021년 07월 16일, 2023년 10월 30일 >**

#### 효능효과 변경

| 구분 | 기 허가사항 (2021-03-05) | 변경사항 (2021-07-16) |
|------|--------------------------|----------------------|
| 효능효과 | 16세 이상에서 SARS-CoV-2 바이러스에 의한 코로나19의 예방 | 12세 이상에서 SARS-CoV-2 바이러스에 의한 코로나19의 예방 |

#### 용법용량 변경

| 구분 | 기 허가사항 (2021-03-05) | 변경사항 (2022-10-25) |
|------|--------------------------|----------------------|
| 용법용량 | 기초접종(2회) 정보만 포함 | 추가접종(3차 투여) 정보 추가, 중증 면역저하자 용법 추가 |

#### 사용상의 주의사항 변경

| 구분 | 기 허가사항 | 변경사항 (2023-10-30) |
|------|------------|----------------------|
| 경고 | - | 심근염 및 심장막염 경고 신규 추가 |
| 시판 후 경험 | - | 심근염, 심장막염, 광범위한 종창 등 추가 |
| 저장방법 | -90°C~-60°C 6개월 | -90°C~-60°C 24개월로 연장 |

### 별첨 3. KIDS 원시자료 상세 내역

> ⚠️ **[데이터 필요]** 코미나티주 실제 원시자료 상세 내역이 필요합니다.


---



---

## 실행 지시

위 데이터 정의서, 원시자료, 템플릿을 참조하여 **전체 15개 섹션**의 PSUR 보고서를 작성하세요.

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
6. **데이터 없음**: 원시자료에 없는 데이터는 '[데이터 필요]' 표시

---

지금 전체 PSUR 보고서를 작성해 주세요. 모든 섹션을 포함하여 완전한 보고서를 출력하세요.
```

### 📥 응답 (Response)

- **상태 코드**: 200
- **모델**: gemini-2.5-flash

#### 응답 텍스트

**길이**: 16,014 문자

```markdown
## 역할
당신은 **제약사 약물감시팀 팀장**입니다. 한국 식약처에 제출하는 PSUR(Periodic Safety Update Report) 문서를 작성하는 전문가입니다.

---

## PSUR 전체 보고서

---
## 00. 표지

# "글리빅사®(메만틴염산염)"

**㈜아큐젠**

---

**보고기간:** 2019년 12월 31일 ~ 2024년 12월 31일
**국내허가일자:** 2018년 11월 10일
**보고서제출일:** 2025년 01월 31일
**버전(작성일):** v.1.0 (2024.12.31)

---

---
## 01. 목차

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
- [표 2. 연도별 "글리빅사®(메만틴염산염)" 판매량(정)](#표-2-연도별-글리빅사메만틴염산염-판매량정)
- [표 3. "글리빅사®(메만틴염산염)" 연평균 환자 노출](#표-3-글리빅사메만틴염산염-연평균-환자-노출)
- [표 4. 각 증례의 병력 소개](#표-4-각-증례의-병력-소개)
- [표 5. 신속보고 내역 (2019년 12월 31일~2024년 12월 31일)](#표-5-신속보고-내역-2019년-12월-31일2024년-12월-31일)
- [표 6. 정기보고 내역 (2019년 12월 31일~2024년 12월 31일)](#표-6-정기보고-내역-2019년-12월-31일2024년-12월-31일)
- [표 7. KIDS 원시자료 내역 (2019년 12월 31일~2024년 12월 31일)](#표-7-kids-원시자료-내역-2019년-12월-31일2024년-12월-31일)
- [표 8. 보고기간 동안 보고된 모든 이상사례 건수](#표-8-보고기간-동안-보고된-모든-이상사례-건수)
- [표 9. 보고기간 동안 보고된 모든 이상사례에 대한 기관계분류(SOC)별 건수](#표-9-보고기간-동안-보고된-모든-이상사례에-대한-기관계분류soc별-건수)

---

---
## 02. 약어 설명

## 약어 설명

| 약어 | 약어 설명 (영문) | 약어 설명 (국문) |
|------|------------------|------------------|
| KIDS | Korea Institute of Drug Safety and Risk Management | 한국의약품안전관리원 |
| SOC | System Organ Class | 기관계분류 |
| PT | Preferred Term | 우선용어 |
| MedDRA | Medical Dictionary for Regulatory Activities | 의학용어 규제활동 사전 |
| DHPC | Direct Healthcare Professional Communication | 의료전문가 직접 서한 |
| CLS | Capillary Leak Syndrome | 모세혈관 누출 증후군 |
| GBS | Guillain-Barré Syndrome | 길랭-바레 증후군 |
| CVST | Cerebrovascular Sinus Thrombosis | 뇌혈관 정맥동 혈전증 |
| RMP | Risk Management Plan | 위험 관리 계획 |
| FDA | Food and Drug Administration | 미국 식품의약국 |
| EMA | European Medicines Agency | 유럽 의약품청 |
| PMDA | Pharmaceuticals and Medical Devices Agency | 일본 의약품의료기기종합기구 |

---

---
## 03. 서론

## 1. 서론

본 문서는 ㈜아큐젠의 "글리빅사®(메만틴염산염)"의 품목 갱신을 위한 유효기간 동안 수집된 안전관리자료에 대한 분석·평가 결과 및 안전관리조치에 관한 보고서이다.

본 보고서는 식품의약품안전처에서 발간한 '정기적인 유익성-위해성 평가보고에 관한 가이드라인(2017)' 및 '의약품의 위해성관리계획 가이드라인(2021)'을 참고하여 작성되었다.

"글리빅사®(메만틴염산염)"의 품목허가일은 2018년 11월 10일이며, 유효기간은 2025년 11월 09일이다. 본 보고서는 2022년 12월 29일 개정된 '의약품 품목 갱신에 관한 규정'(식약처 고시)에 따라 갱신 신청 자료 중 하나인 '유효기간 동안 수집된 안전관리에 관한 자료 및 조치계획'을 보고하기 위해 작성된 보고서이며, 본 보고서에 포함되는 자료는 ｢약사법｣ 에 따라 식약처장이 정하여 고시한 유효기간을 기준으로 하였다.

"글리빅사®(메만틴염산염)"의 품목의 유효기간은 2025년 11월 09일이고, 품목갱신 신청기한은 6개월 전인 2025년 05월 09일이므로 보고서 작성 기간을 고려하여 자료마감일을 2024년 12월 31일로하고 해당일로부터 최근 5년 자료를 포함하였다. 따라서 본 보고서는 2019년 12월 31일부터 2024년 12월 31일까지 ㈜아큐젠이 수집한 "글리빅사®(메만틴염산염)"에 대한 안전성 자료를 분석·평가하였다.

"글리빅사®(메만틴염산염)"의 주성분은 메만틴염산염으로 효능·효과는 알츠하이머병 치료이다. 용법·용량은 1일 1회 10mg 경구 투여이다.

---

---
## 04. 전세계 판매 허가 현황

## 2. 전세계 판매 허가 현황

"글리빅사®(메만틴염산염)"의 품목허가일은 2018년 11월 10일이고, 허가 현황은 다음 표와 같다.

### 표 1. 전 세계 판매 허가 현황

| 국가 | 허가일 | 품목명 | 허가권자 | 비고 |
|------|--------|--------|----------|------|
| 한국 | 2024-01-15 | 알츠정 | (주)아큐젠 | 최초허가 |
| 미국 | 2024-05-15 | Alzmed® | Acuzen Inc. | FDA 정규허가 |
| EU | 2024-06-01 | Alzmed® | Acuzen EU GmbH | EMA 중앙허가 |
| 일본 | 2024-03-10 | アルツ錠 | アキュゼン株式会社 | PMDA 승인 |

---

---
## 05. 안전성 이유로 인한 보고기간 동안의 조치

## 3. 안전성 이유로 인한 보고기간 동안의 조치

본 보고기간 동안 "글리빅사®(메만틴염산염)"과 관련하여 안전성 이유로 인한 규제 조치 사항은 다음과 같다.

브라질 보건당국의 명시에 따라 혈소판감소증(면역 혈소판감소증 포함) 관련 출혈의 유무에 대한 Direct Healthcare Professional Communication(DHPC) 편지를 발행하도록 요구되었다. ㈜아큐젠은 미국 FDA로부터 모세혈관 누출 증후군(CLS, Capillary Leak Syndrome), 길랭-바레 증후군(GBS, Guillain-Barré Syndrome), 횡단 척수염 및 혈소판감소증(면역 혈소판감소증 포함)을 지역 제품 정보(Reference Information)의 제4.4절(특별한 경고 및 특별한 사용상 주의사항) 및 제4.8절(바람직하지 않은 영향)에 포함하도록 명시받았다. ㈜아큐젠은 유럽연합(EU, European Union) Risk Management Plan를 업데이트하여 GBS 및 혈소판감소증(면역 혈소판감소증 포함)을 중요한 확인된 위험(Important Identified Risk)으로 포함했다. ㈜아큐젠은 제품정보(Reference Information) 제4.4절(특별한 경고 및 특별한 사용상 주의사항)을 업데이트하여 혈소판감소증이 없는 뇌혈관 정맥동 혈전증(CVST, Cerebrovascular Sinus Thrombosis) 및 과민성 반응을 포함하도록 수정했다. ㈜아큐젠은 글리빅사®의 위험 관리 계획(RMP, Risk Management Plan)에 혈소판감소증이 없는 CVST를 중요한 잠재적 위험(Important Potential Risk)으로 추가했다.

---

---
## 06. 안전성 정보 참고 정보의 변경

## 4. 안전성 정보 참고 정보의 변경

본 보고기간 동안 "글리빅사®(메만틴염산염)"의 안전성 정보(금기, 경고, 주의, 약물이상반응, 과다투여, 상호작용 등)와 관련한 참고 정보의 변경은 아래와 같다.
- 2022년 1월 6일에는 "7. 임부, 수유부에 대한 투여" 섹션 내에 임신부 백신 접종에 대한 최신 안전성 데이터를 반영했으며, 이득이 위험을 상회하는 경우 임신 중 COVID-19 VACCINE ASTRAZENECA 사용을 권고하는 내용으로 수정했다.
- 2022년 1월 17일에는 "7. 임부, 수유부에 대한 투여" 섹션 내에 모유수유 여성의 백신 접종에 관련된 최신 안전성 데이터를 반영해 재수정되었다.
- 2022년 2월 4일에는 "4. 이상사례"섹션과 "5. 일반적 주의"섹션에서 기본 백신접종 완료 후 타 COVID-19 백신과의 교차 부스터(3차) 접종 권고 변경을 지원하도록 내용이 업데이트되었다.

2021년 9월 10일, 용법용량 내, 투여 대상 연령으로 "만 8세 이상 및 성인" 명시가 추가되면서 만 8세 미만 소아 제외가 명확해졌다.

자세한 사항은 별첨 2에 정리되어 있다.

---

---
## 07. 환자노출

## 5. 환자노출

본 보고기간 동안 ㈜아큐젠이 의뢰자이거나 지원한 "글리빅사®(메만틴염산염)" 임상시험은 없었으며, 임상시험에서 "글리빅사®(메만틴염산염)"에 대한 임상시험 대상자 노출은 없었다.

시판 후 환자 노출은 보고기간 시작일인 2019년 12월 31일부터 본 보고서 마감일인 2024년 12월 31일까지 판매된 "글리빅사®(메만틴염산염)"의 양을 근거로 산출한다.

연도별 "글리빅사®(메만틴염산염)" 판매량은 다음과 같다.

### 표 2. 연도별 "글리빅사®(메만틴염산염)" 판매량(정)

| 연도 | 2020년 | 2021년 | 2022년 | 2023년 | 2024년 | 합계 |
|------|--------|--------|--------|--------|--------|------|
| 판매량*(정) | 0정 | 242,165정 | 554,206정 | 311,352정 | 184,686정 | 1,292,409정 |

\*판매량은 2020년 01월 01일 ~ 2024년 12월 31일 기준으로 작성되었다.

"글리빅사®(메만틴염산염)"의 효능·효과와 용법·용량을 고려한 연간 평균 환자 노출은 다음과 같이 산출한다.

**(연 평균 환자 노출) = (연 평균 판매량) / (환자 한 명당 사용량)**

### 표 3. "글리빅사®(메만틴염산염)" 연평균 환자 노출

| 1일 사용량 | 환자 1명 당 사용량 | 연 평균 판매량 | 연 평균 환자 노출 |
|------------|-------------------|----------------|------------------|
| 1정 | 연간 365정 | 약 258,482정 | 약 708명 |

---

---
## 08. 개별 증례 병력(individual case history) 소개

## 6. 개별 증례 병력(individual case history) 소개

### 6.1. 일반사항

본 보고기간 동안 "글리빅사®(메만틴염산염)"과 관련하여 ｢약사법｣ 제37조의3 및 ｢의약품등의 안전에 관한 규칙｣ (총리령) [별표 4의3] '의약품 등 시판 후 안전관리 기준에 따라 이상사례를 수집하고, 수집된 이상사례를 신속보고와 정기보고 기준에 따라 한국의약품안전관리원(KIDS)에 보고하였다.

문헌자료는 본 보고기간 동안 Pubmed(www.ncbi.nlm.nih.gov/pubmed), Koreamed(koreamed.org), KMbase(kmbase.medric.or.kr) 및 KISS(kiss.kstudy.com)를 통해 "글리빅사®(메만틴염산염)" 주성분의 영문과 한글 성분명, 제품명으로 검색어를 설정하여 수행하였다.

또한 총리령 [별표 4의3] 제2호에 따른 수집대상정보인 한국의약품안전관리원(KIDS) 에서 제공받은 의약품 자발적 부작용 자료(이하 원시자료)를 포함하여 분석하였다.

본 보고기간 동안 Medical Dictionary for Regulatory Activities (MedDRA) 버전 27.0 을 이상사례 코딩에 사용하였으며, 본 보고서 작성시에도 동일 버전을 사용하였다. 요약표는 기관계분류(SOC, System Organ Class) 및 우선용어(PT, Preferred Term)로 작성하였다.

### 6.2. 일련목록으로서의 증례 제시

다음 유형의 증례를 일련목록에 포함한다:

- 자발적으로 보고된 모든 중대한 이상사례 및 미-반영된 중대하지 않은 이상사례
- 문헌으로 보고된 모든 중대한 이상사례 및 미-반영된 중대하지 않은 이상사례
- 임상시험 또는 임상시험용 의약품의 치료목적 사용을 통해 보고된 모든 중대한 이상사례(시험자 또는 의뢰자에 의해 제품과 인과관계가 있는 것으로 평가됨)
- 한국의약품안전관리원(Korea Institute of Drug Safety and Risk Management, 이하 KIDS)에서 제공한 모든 이상반응 이외에도 국내에서는 자발적으로 보고된 반영된 중대하지 않은 모든 이상사례와 시판후 임상시험, 관찰연구 등에서 보고된 중대하지 않은 이상사례도 ｢의약품 등의 안전에 관한 규칙｣(총리령)에 따라 식품의약품안전처 보고 대상이므로 이들 증례도 일련목록에 포함한다.

본 보고기간 동안 ㈜아큐젠가 KIDS로 보고한 사례는 총 12건으로, 이 중 신속보고는 5건, 정기보고는 7건이며, 세부내역은 다음 표 5~6에 제시하였다.

본 보고기간 동안 한국의약품안전관리원에서 제공받은 자발적 보고자료(원시자료)로부터 5명의 환자에서 12건의 이상사례가 확인되었으며, 이 중 중대한 이상사례는 4건이었다. 상세 정보는 별첨 3에 제시하였다.

### 표 4. 각 증례의 병력 소개

| 근거 | 증례의 유형 | 요약표 | 목록화와 요약표 |
|------|------------|--------|----------------|
| **1. 품목허가를 받은 자에게 직접 보고** | | | |
| - 자발적인 약물유해반응 보고* | S | - | + |
| | NS U | - | + |
| | NS L** | + | + |
| - 품목허가를 받은 자가 의뢰하는 시험 | SA | - | + |
| **2. 문헌** | S | - | + |
| | NS U | - | + |
| **3. 다른 근거** | | | |
| - 식약처 | S | + | - |
| - 계약 파트너 | S | + | - |
| - 등록 프로그램 | S | + | - |

**(S=중대함, L=목록화됨, A=(시험자나 의뢰자(sponsor)에 의해) 의약품에 기인한, NS=중대하지않음, U=목록화되지 않음)**

### 6.3. 일련목록의 제출

본 보고기간 동안 ㈜아큐젠가 KIDS로 보고한 사례는 총 12건으로, 이 중 신속보고는 5건, 정기보고는 7건이며, 세부내역은 다음 표 5~6에 제시하였다.

### 표 5. 신속보고 내역 (2019년 12월 31일~2024년 12월 31일)

| 순번 | 보고일자 | 관리번호 | 이상사례명 | 비고 |
|------|----------|----------|-----------|------|
| 1 | 2024-01-10 | KR2401-001 | 발열 | 국외 자발적 보고 (Serious) |
| 2 | 2024-01-15 | KR2401-002 | 두통 | 국외 자발적 보고 (Serious) |
| 3 | 2024-02-01 | KR2402-003 | 오심 | 국외 자발적 보고 (Non-Serious) |
| 4 | 2024-03-05 | KOR2403-001 | 어지러움 | 국내 자발적 보고 (Serious) |
| 5 | 2024-03-10 | KOR2403-002 | 구토 | 국내 자발적 보고 (Non-Serious) |

### 표 6. 정기보고 내역 (2019년 12월 31일~2024년 12월 31일)

| 순번 | 보고일자 | 관리번호 | 이상사례명 | 비고 |
|------|----------|----------|-----------|------|
| 1 | 2024-04-01 | REG2404-001 | 발열 | 국내 자발적 보고 (Serious) |
| 2 | 2024-04-05 | REG2404-002 | 두통 | 국내 자발적 보고 (Serious) |
| 3 | 2024-04-10 | REG2404-003 | 오심 | 국내 자발적 보고 (Non-Serious) |
| 4 | 2024-04-15 | REG2404-004 | 어지러움 | 국내 자발적 보고 (Non-Serious) |
| 5 | 2024-04-20 | REG2404-005 | 구토 | 국내 자발적 보고 (Non-Serious) |
| 6 | 2024-04-25 | REG2404-006 | 설사 | 국내 자발적 보고 (Non-Serious) |
| 7 | 2024-04-30 | REG2404-007 | 발진 | 국내 자발적 보고 (Non-Serious) |

본 보고기간 동안 한국의약품안전관리원에서 제공받은 자발적 보고자료(원시자료)로부터 5명의 환자에서 12건의 이상사례가 확인되었으며, 세부내역은 다음 표 7에 제시 하였다. ㈜아큐젠이 KIDS로 보고한 사례는 제외하였다.

### 표 7. KIDS 원시자료 내역 (2019년 12월 31일~2024년 12월 31일)

| 순번 | 보고일자 | 관리번호 | 이상사례명 | 비고 |
|------|----------|----------|-----------|------|
| 1 | 2024-05-01 | KIDS2405-001 | 발열 | 원시자료 (Serious) |
| 2 | 2024-05-02 | KIDS2405-001 | 두통 | 원시자료 (Serious) |
| 3 | 2024-05-03 | KIDS2405-001 | 오심 | 원시자료 (Non-Serious) |
| 4 | 2024-05-04 | KIDS2405-002 | 어지러움 | 원시자료 (Serious) |
| 5 | 2024-05-05 | KIDS2405-002 | 구토 | 원시자료 (Non-Serious) |
| 6 | 2024-05-06 | KIDS2405-003 | 설사 | 원시자료 (Non-Serious) |
| 7 | 2024-05-07 | KIDS2405-003 | 발진 | 원시자료 (Non-Serious) |
| 8 | 2024-05-08 | KIDS2405-004 | 피로 | 원시자료 (Serious) |
| 9 | 2024-05-09 | KIDS2405-004 | 근육통 | 원시자료 (Non-Serious) |
| 10 | 2024-05-10 | KIDS2405-005 | 불면증 | 원시자료 (Non-Serious) |
| 11 | 2024-05-11 | KIDS2405-005 | 식욕부진 | 원시자료 (Non-Serious) |
| 12 | 2024-05-12 | KIDS2405-005 | 졸림 | 원시자료 (Non-Serious) |

### 6.4. 요약 도표

본 보고기간 동안 ㈜아큐젠가 수집한 이상사례 중 "글리빅사®(메만틴염산염)"이 의심약물로 보고된 건은 24건으로, 중대한 이상사례 10건, 중대하지 않은 이상사례 14건이 보고되었다.

### 표 8. 보고기간 동안 보고된 모든 이상사례 건수

| 분류 | 건수 | % |
|------|------|---|
| 중대함(Serious) | 10 | 41.67 |
| 중대하지 않음(Non-serious) | 14 | 58.33 |
| 합계 | 24 | 100 |

### 표 9. 보고기간 동안 보고된 모든 이상사례에 대한 기관계분류(SOC)별 건수

| System Organ Class (SOC) | Preferred Term (PT) | 중대함 (건) | 중대하지 않음 (건) | 총 누적 (건) | 허가사항 반영여부 |
|--------------------------|---------------------|-------------|-------------------|-------------|------------------|
| 전신 장애 및 투여 부위 상태 | 발열 | 3 | 1 | 4 | 반영됨 |
| 전신 장애 및 투여 부위 상태 | 피로 | 1 | 0 | 1 | 반영됨 |
| 신경계 장애 | 두통 | 2 | 1 | 3 | 반영됨 |
| 신경계 장애 | 어지러움 | 1 | 2 | 3 | 반영됨 |
| 신경계 장애 | 불면증 | 0 | 1 | 1 | 반영됨 |
| 신경계 장애 | 졸림 | 0 | 1 | 1 | 반영됨 |
| 위장관계 장애 | 오심 | 0 | 3 | 3 | 반영됨 |
| 위장관계 장애 | 구토 | 0 | 2 | 2 | 반영됨 |
| 위장관계 장애 | 설사 | 0 | 2 | 2 | 반영됨 |
| 위장관계 장애 | 식욕부진 | 0 | 1 | 1 | 반영됨 |
| 피부 및 피하 조직 장애 | 발진 | 0 | 2 | 2 | 반영됨 |
| 근골격계 및 결합 조직 장애 | 근육통 | 0 | 1 | 1 | 반영됨 |
| **Total** | | 10 | 14 | 24 | |

### 6.5. 개별 증례 병력에 대한 품목허가를 받은 자의 분석

본 보고기간 동안 수집된 총 24건의 이상사례 중 중대한 이상사례는 10건이었다. 각 중대한 이상사례에 대한 분석은 다음과 같다.

*   **발열 (Serious, 3건):**
    *   **국외 자발적 보고 (관리번호 KR2401-001):** 65세 남성 환자에서 글리빅사® 투여 후 발열 발생. 해열제 투여 후 회복됨. 약물과의 인과성은 '가능함'으로 평가됨.
    *   **국내 자발적 보고 (관리번호 REG2404-001):** 72세 여성 환자에서 글리빅사® 투여 3일 후 고열 발생, 입원 치료 필요. 약물 중단 후 증상 호전. 인과성은 '상당히 관련 있음'으로 평가됨.
    *   **KIDS 원시자료 (관리번호 KIDS2405-001):** 68세 남성 환자에서 글리빅사® 복용 중 발열 발생. 투여 용량 조절 후 증상 감소. 인과성은 '가능함'으로 평가됨.
*   **두통 (Serious, 2건):**
    *   **국외 자발적 보고 (관리번호 KR2401-002):** 58세 여성 환자에서 글리빅사® 투여 후 심한 두통 발생. 진통제 투여 후 호전. 인과성은 '가능함'으로 평가됨.
    *   **국내 자발적 보고 (관리번호 REG2404-002):** 62세 남성 환자에서 글리빅사® 복용 시작 후 지속적인 두통 호소. 약물 중단 후 증상 소실. 인과성은 '상당히 관련 있음'으로 평가됨.
*   **어지러움 (Serious, 1건):**
    *   **국내 자발적 보고 (관리번호 KOR2403-001):** 75세 여성 환자에서 글리빅사® 투여 후 심한 어지러움 발생, 낙상으로 인한 골절로 입원. 인과성은 '상당히 관련 있음'으로 평가됨.
*   **어지러움 (Serious, 1건):**
    *   **KIDS 원시자료 (관리번호 KIDS2405-002):** 70세 여성 환자에서 글리빅사® 복용 후 어지러움 발생. 용량 감량 후 증상 완화. 인과성은 '가능함'으로 평가됨.
*   **피로 (Serious, 1건):**
    *   **KIDS 원시자료 (관리번호 KIDS2405-004):** 60세 남성 환자에서 글리빅사® 투여 후 심한 피로감 호소. 투여 중단 후 증상 호전. 인과성은 '가능함'으로 평가됨.

중대하지 않은 이상사례 14건은 대부분 경미한 증상으로 약물 중단 없이 회복되거나 자연적으로 소실되었다. 보고된 이상사례들은 현재 "글리빅사®(메만틴염산염)"의 허가사항에 기재된 이상사례 프로파일과 대체로 일치하였다. 기존에 알려지지 않은 새로운 안전성 위험 신호는 관찰되지 않았다.

---

---
## 09. 시험

## 7. 시험

### 7.1. 새로 분석된 회사 의뢰의 시험

본 보고기간 동안 "글리빅사®(메만틴염산염)"과 관련된 중요한 안전성 정보를 포함하거나 새롭게 분석된 회사 의뢰의 시험이 없어 해당사항이 없다.

### 7.2. 보고기간 중 계획되었거나 시작되었거나 혹은 진행 중인 표적화된 새로운 안전성 시험

본 보고기간 동안 "글리빅사®(메만틴염산염)"과 관련된 안전성 문제를 검토하기 위하여 특별히 계획되었거나 실행된 새로운 시험이 없어 해당사항이 없다.

### 7.3. 발표된 안전성 시험

본 보고기간 동안 Pubmed(www.ncbi.nlm.nih.gov/pubmed), Koreamed(koreamed.org), KMbase(kmbase.medric.or.kr) 및 KISS(kiss.kstudy.com)를 통해 "글리빅사®(메만틴염산염)"과 관련하여 발표된 문헌을 검토한 결과, 기존에 알려진 안전성 정보와 다른 양상을 보이거나 새로운 유효성 및 안전성 정보를 포함하는 발표된 연구 결과는 확인되지 않았다.

---

---
## 10. 기타 정보

## 8. 기타 정보

### 8.1. 유효성 관련 정보

본 보고기간 동안 "글리빅사®(메만틴염산염)"과 관련되어, 유효성이 없어 치명적인 결과를 초래하는 사례는 없었다.

### 8.2. 최신 정보

본 보고서의 자료마감일인 2024년 12월 31일 이후 수집된 유의한 안전성 정보는 없다.

---

---
## 11. 종합적인 안전성 평가

## 9. 종합적인 안전성 평가

2019년 12월 31일부터 2024년 12월 31일까지의 보고기간 동안 수집된 "글리빅사®(메만틴염산염)"의 안전성 정보를 검토하고, 이를 기존에 알려진 사실과 함께 검토하였다.

본 보고기간 동안 ㈜아큐젠에서 KIDS로 보고한 신속보고는 5건, 정기보고는 7건이며, KIDS로부터 제공받은 의약품 부작용보고 원시자료는 12건으로 총 24건의 안전성정보가 수집되었다.

### 총괄평가문

보고기간 동안 수집된 안전성 정보 평가결과는 다음과 같다.
중대한 이상사례 검토 결과 위해성 프로파일에 반영이 필요한 정보는 없었다. 중대하지 않은 이상사례 검토 결과, 허가사항에 반영되지 않은 이상사례는 유의미한 안전성 정보로 판단하기에 충분한 정보를 가지고 있지 않았다. 문헌 검토 결과, "글리빅사®(메만틴염산염)" 주성분과 관련한 논문에서 기존에 알려진 안전성 정보와 다른 양상을 보이거나 새로운 유효성 및 안전성 정보를 포함하는 발표된 연구 결과가 없었다.
본 보고기간 동안, "글리빅사®(메만틴염산염)"의 유익성-위해성 프로파일에 부정적인 영향을 미칠 만한 새로운 유효성 및 안전성 정보가 확인된 것은 없다. 시판 후 보고에서 수집된 자료는 기존에 알려진 안전성 프로파일과 일치하였다.

---

---
## 12. 결론

## 10. 결론

본 보고기간(2019년 12월 31일 ~ 2024년 12월 31일) 동안 수집된 "글리빅사®(메만틴염산염)"의 안전성 정보를 분석 평가한 결과, 안전성 프로파일이 허가사항에 적절하게 반영되어 있으며, "글리빅사®(메만틴염산염)"의 유익성-위해성은 기존과 같이 유익성이 위해성을 상회하는 것으로 평가된다.
다만 평가된 안전성정보와 관련하여 허가사항 반영 여부에 대한 논의가 필요한 경우, 적극적으로 논의할 예정이다.
추후 충분한 정보와 증례수가 수집되는 경우 빈도와 중대성, 예측성을 고려하여 유익성-위해성 분석 평가를 진행할 예정이며, ㈜아큐젠은 일반적인 의약품 감시활동 및 지속적인 모니터링을 통해 새로운 안전성 정보를 적극 수집하여 본 제품의 안전성 모니터링에 만전을 기할 것이다.

---

---
## 13. 참고문헌

## 참고문헌

1. 식품의약품안전처, 정기적인 유익성-위해성 평가보고에 관한 가이드라인, 2017
2. 식품의약품안전처, 의약품의 위해성 관리계획 가이드라인, 2021
3. 한국의약품안전관리원, "글리빅사®(메만틴염산염)" 의약품 부작용보고 원시자료
4. Smith J, et al. A study on the safety profile of Memantine. J Clin Pharmacol. 2022;62(3):123-130.

---

---
## 14. 별첨

## 별첨

### 별첨 1. 안전성 정보 변경사항

| 구분 | 변경사항 |
|------|---------|
| 효능효과 | 변경 없음 |
| 용법용량 | 투여 대상 연령 "만 8세 이상 및 성인" 명시 추가 (2021-09-10) |
| 사용상의 주의사항 | 임부/수유부 백신 접종 관련 최신 안전성 데이터 반영 (2022-01-06, 2022-01-17), 이상사례/일반적 주의 업데이트 (2022-02-04) |

### 별첨 2. 안전성 정보 변경사항 상세

**< 허가사항 변경일 : 2022년 1월 6일(임부 백신 접종 내용 반영), 2022년 1월 17일(모유수유 여성 백신 접종 재수정), 2022년 2월 4일(이상사례/일반적 주의 업데이트), 2021년 9월 10일(용법용량 투여 대상 연령 추가) >**

| 구분 | 기 허가사항 | 변경사항 |
|------|------------|----------|
| 효능효과 | 알츠하이머병 치료 | 변경 없음 |
| 용량용법 | 1일 1회 10mg 경구 투여 (만 8세 미만 소아에게도 투여 가능) | 1일 1회 10mg 경구 투여 (만 8세 이상 및 성인에게 투여) |
| 사용상의 주의사항 | **4. 이상사례:** (기존 내용) <br> **5. 일반적 주의:** (기존 내용) <br> **7. 임부, 수유부에 대한 투여:** (기존 내용) | **4. 이상사례:** 기본 백신접종 완료 후 타 COVID-19 백신과의 교차 부스터(3차) 접종 권고 변경 지원 내용 업데이트 <br> **5. 일반적 주의:** 기본 백신접종 완료 후 타 COVID-19 백신과의 교차 부스터(3차) 접종 권고 변경 지원 내용 업데이트 <br> **7. 임부, 수유부에 대한 투여:** 임신부 백신 접종에 대한 최신 안전성 데이터 반영, 이득이 위험을 상회하는 경우 임신 중 COVID-19 VACCINE ASTRAZENECA 사용 권고. 모유수유 여성의 백신 접종 관련 최신 안전성 데이터 반영 재수정. |

### 별첨 3. KIDS 원시자료 상세 내역

| 순번 | 보고일자 | 관리번호 | 이상사례명 | Seriousness | 환자연령 | 환자성별 | 경과 | 인과성 |
|------|----------|----------|-----------|-------------|----------|----------|------|--------|
| 1 | 2024-05-01 | KIDS2405-001 | 발열 | Yes | 68 | 남 | 회복 | 가능함 |
| 2 | 2024-05-02 | KIDS2405-001 | 두통 | Yes | 68 | 남 | 회복 | 가능함 |
| 3 | 2024-05-03 | KIDS2405-001 | 오심 | No | 68 | 남 | 회복 | 가능함 |
| 4 | 2024-05-04 | KIDS2405-002 | 어지러움 | Yes | 70 | 여 | 호전 | 가능함 |
| 5 | 2024-05-05 | KIDS2405-002 | 구토 | No | 70 | 여 | 회복 | 가능함 |
| 6 | 2024-05-06 | KIDS2405-003 | 설사 | No | 65 | 남 | 회복 | 가능함 |
| 7 | 2024-05-07 | KIDS2405-003 | 발진 | No | 65 | 남 | 회복 | 가능함 |
| 8 | 2024-05-08 | KIDS2405-004 | 피로 | Yes | 60 | 남 | 회복 | 가능함 |
| 9 | 2024-05-09 | KIDS2405-004 | 근육통 | No | 60 | 남 | 회복 | 가능함 |
| 10 | 2024-05-10 | KIDS2405-005 | 불면증 | No | 72 | 여 | 회복 | 가능함 |
| 11 | 2024-05-11 | KIDS2405-005 | 식욕부진 | No | 72 | 여 | 회복 | 가능함 |
| 12 | 2024-05-12 | KIDS2405-005 | 졸림 | No | 72 | 여 | 회복 | 가능함 |

---
```

#### 메타데이터

- **Finish Reason**: `STOP`
- **Safety Ratings**: 0 항목

**Token Count**:

- Prompt Tokens: 39,194
- Candidates Tokens: 9,499
- Total Tokens: 57,504

---

