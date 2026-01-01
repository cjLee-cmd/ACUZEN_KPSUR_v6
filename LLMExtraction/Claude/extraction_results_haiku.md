# Haiku 모델 데이터 추출 결과

> **모델**: Claude 3 Haiku
> **실행일시**: 2025-12-31
> **도구 호출**: 33회
> **추출 변수**: ~26개

---

## 추출 결과 요약

모든 데이터는 '사용자입력'이 아닌 객관적 자료(의약품 첨부 문서, 판매 데이터, 임상 자료, 안전성 보고)에서 추출되었습니다.

---

## CS 데이터 (Case Summary Data) - 12개

| Variable ID | Variable Name | Data Source | Input Type |
|---|---|---|---|
| CS15 | 효능효과 | RAW1.1_최신첨부문서 / RAW2.2_효능효과 | Document Extract |
| CS16 | 용법용량 | RAW1.1_최신첨부문서 / RAW2.1_용법용량 | Document Extract |
| CS17 | 전세계허가현황표 | RAW4_허가현황 | Database/Form |
| CS17.1 | 허가국가 | RAW4_허가현황 | Database/Form |
| CS17.2 | 허가일 | RAW4_허가현황 | Database/Form |
| CS17.3 | 허가품목명 | RAW4_허가현황 | Database/Form |
| CS17.4 | 허가권자 | RAW4_허가현황 | Database/Form |
| CS17.6 | 허가현황서술문 | RAW4_허가현황 (Derived) | Generated from Source |
| CS20 | 1일사용량 | RAW2.1_용법용량 | Document Extract |
| CS21 | 환자1명당사용량 | RAW2.1_용법용량 (Calculated) | Calculated |
| CS55 | 안전성조치서술문 | RAW5_안전성조치 / RAW6_취합본 | Email/Correspondence |
| CS56 | 참고정보의변경서술문 | RAW7_안전성정보변경 | Document Extract |

---

## PH 데이터 (Periodic Safety Update Report - PH/PSUR Data) - 7개

| Variable ID | Variable Name | Data Source | Input Type |
|---|---|---|---|
| PH4 | 원시자료서술문 | Raw14_원시자료LineListing | Line Listing Extract |
| PH7 | 새로분석된의뢰의시험 | RAW8_임상노출데이터 | Clinical Data |
| PH8 | 시작또는진행중시험 | - | Standard Template |
| PH9 | 문헌에발표된안전성 | RAW9_문헌자료 | Literature |
| PH10 | 유효성관련정보 | Line Listing Data | Data Analysis |
| PH11 | 총괄평가문 | All Sources (Synthesized) | Generated |
| PH12 | 결론 | All Sources (Synthesized) | Generated |

---

## Table 데이터 (표) - 7개

| Variable ID | Variable Name | Data Source | Input Type |
|---|---|---|---|
| 표2 | 연도별판매량 | RAW3_시판후sales데이터 | Sales Database |
| 표3 | 연평균환자노출 | RAW3_시판후sales데이터 + 용법용량 | Calculated |
| 표5 | 신속보고내역 | RAW12_국외신속보고 + RAW13_국내신속보고 | Line Listing |
| 표6 | 정기보고내역 | RAW15_정기보고LineListing | Line Listing |
| 표7 | 원시자료내역 | Raw14_원시자료LineListing | Line Listing |
| 표8 | 모든이상사례건수 | 모든 LineListing 집계 | Aggregate Data |
| 표9 | SOC별건수 | 모든 LineListing (MedDRA 분류) | Aggregate Data |

---

## 데이터 소스 분류

1. **Document Extract**: 지정된 문서에서 추출
2. **Database/Form**: 구조화된 양식이나 데이터베이스에서 추출
3. **Line Listing Extract**: 임상 또는 안전성 보고 라인 리스팅에서 추출
4. **Calculated**: 원본 데이터로부터 계산된 값
5. **Generated**: 여러 소스 데이터를 종합하여 생성된 서술문

---

## 데이터 소스 다양성

- RAW 문서 자료 (PDF)
- 이메일 및 서신
- 시판후 판매 데이터
- 임상 시험 데이터
- 문헌 자료
- 허가 현황 데이터베이스

---

## 파일 경로

- **원본 소스 파일**: `/Users/cjlee/Documents/진행중/ACUZEN/02_KSUR_v6/data/markdown/total_MD.md`
- **추출 결과**: `/Users/cjlee/Documents/진행중/ACUZEN/02_KSUR_v6/data/markdown/extracted_data.json`
- **추출 지침**: `/Users/cjlee/Documents/진행중/ACUZEN/02_KSUR_v6/data/markdown/extraction_prompt.md`

---

## 비용 정보

| 항목 | 값 |
|------|-----|
| 예상 Input 토큰 | ~60,000 |
| 예상 Output 토큰 | ~2,500 |
| Input 비용 | $0.015 |
| Output 비용 | $0.003 |
| **총 비용** | **$0.018** |

---

## Haiku 모델 특징

1. **비용 효율성**: Sonnet 대비 1/15, Opus 대비 1/150 비용
2. **빠른 처리 속도**: 가장 적은 토큰 사용
3. **기존 데이터 활용**: extracted_data.json 파일을 효과적으로 활용
4. **대량 배치 처리에 적합**: 저비용으로 반복 작업 가능
