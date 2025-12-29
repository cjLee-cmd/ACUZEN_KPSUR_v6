#!/usr/bin/env python3
"""
Test All Gemini Models - Comprehensive Testing
"""

import os
import sys
import time
import json
from typing import Dict, Any, List

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

# Models to test
MODELS = [
    "gemini-3-pro-preview",
    "gemini-3-flash-preview",
    "gemini-2.5-pro",
    "gemini-2.5-flash"
]

class ModelTester:
    """Comprehensive model testing framework"""

    def __init__(self, model_name: str):
        self.model_name = model_name
        self.client = genai.Client(api_key=GOOGLE_API_KEY)
        self.results = {
            "model": model_name,
            "tests": {}
        }

    def test_basic_connection(self) -> Dict[str, Any]:
        """Test 1: Basic connection"""
        print(f"\n   1️⃣  기본 연결 테스트...")

        start_time = time.time()
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents="Hello! Respond with 'Connection successful' in Korean."
            )
            duration = time.time() - start_time

            result = {
                "success": True,
                "response": response.text,
                "duration": round(duration, 2)
            }
            print(f"      ✅ 성공 - {result['duration']}초")
            print(f"      응답: {response.text[:50]}...")

        except Exception as e:
            result = {
                "success": False,
                "error": str(e),
                "duration": round(time.time() - start_time, 2)
            }
            print(f"      ❌ 실패 - {str(e)[:50]}")

        return result

    def test_korean_response(self) -> Dict[str, Any]:
        """Test 2: Korean language response"""
        print(f"\n   2️⃣  한국어 응답 테스트...")

        start_time = time.time()
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents="약물감시(Pharmacovigilance)란 무엇인가요? 한국어로 2-3문장으로 설명해주세요."
            )
            duration = time.time() - start_time

            result = {
                "success": True,
                "response": response.text,
                "duration": round(duration, 2),
                "quality": self._assess_korean_quality(response.text)
            }
            print(f"      ✅ 성공 - {result['duration']}초")
            print(f"      품질: ⭐ {result['quality']}/5")
            print(f"      응답: {response.text[:100]}...")

        except Exception as e:
            result = {
                "success": False,
                "error": str(e),
                "duration": round(time.time() - start_time, 2)
            }
            print(f"      ❌ 실패 - {str(e)[:50]}")

        return result

    def test_system_instruction(self) -> Dict[str, Any]:
        """Test 3: System instruction with KSUR context"""
        print(f"\n   3️⃣  System Instruction 테스트...")

        start_time = time.time()
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents="PSUR 보고서의 주요 섹션을 3가지만 나열해주세요.",
                config=types.GenerateContentConfig(
                    system_instruction="당신은 의약품 안전성 보고서(PSUR) 작성 전문가입니다. 정확하고 간결하게 답변하세요."
                )
            )
            duration = time.time() - start_time

            result = {
                "success": True,
                "response": response.text,
                "duration": round(duration, 2)
            }
            print(f"      ✅ 성공 - {result['duration']}초")
            print(f"      응답: {response.text[:100]}...")

        except Exception as e:
            result = {
                "success": False,
                "error": str(e),
                "duration": round(time.time() - start_time, 2)
            }
            print(f"      ❌ 실패 - {str(e)[:50]}")

        return result

    def test_json_mode(self) -> Dict[str, Any]:
        """Test 4: JSON mode for structured data"""
        print(f"\n   4️⃣  JSON 모드 테스트...")

        start_time = time.time()
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents="""다음 정보를 JSON 형식으로 추출하세요:

제품명: 코미나티주
성분명: 토지나메란
제조사: 한국화이자제약
허가일: 2021-03-05

JSON 키: product_name, ingredient_name, company_name, approval_date""",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            duration = time.time() - start_time

            # Validate JSON
            try:
                json_data = json.loads(response.text)
                is_valid_json = True
            except:
                is_valid_json = False

            result = {
                "success": True,
                "response": response.text,
                "duration": round(duration, 2),
                "valid_json": is_valid_json
            }
            print(f"      ✅ 성공 - {result['duration']}초")
            print(f"      JSON 유효성: {'✅' if is_valid_json else '❌'}")
            print(f"      응답: {response.text[:150]}...")

        except Exception as e:
            result = {
                "success": False,
                "error": str(e),
                "duration": round(time.time() - start_time, 2)
            }
            print(f"      ❌ 실패 - {str(e)[:50]}")

        return result

    def test_token_counting(self) -> Dict[str, Any]:
        """Test 5: Token counting"""
        print(f"\n   5️⃣  토큰 카운팅 테스트...")

        test_text = "This is a test message for KSUR system integration with multiple models."

        try:
            token_response = self.client.models.count_tokens(
                model=self.model_name,
                contents=test_text
            )

            result = {
                "success": True,
                "token_count": token_response.total_tokens,
                "test_text": test_text
            }
            print(f"      ✅ 성공")
            print(f"      토큰 수: {result['token_count']}")

        except Exception as e:
            result = {
                "success": False,
                "error": str(e)
            }
            print(f"      ❌ 실패 - {str(e)[:50]}")

        return result

    def test_raw_id_classification(self) -> Dict[str, Any]:
        """Test 6: RAW ID classification (KSUR specific)"""
        print(f"\n   6️⃣  RAW ID 분류 테스트...")

        start_time = time.time()
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents="""다음 문서를 RAW ID로 분류하세요:

파일명: patient_case_report_2024.pdf
내용 미리보기: "Patient ID: 12345, Age: 45, Gender: Male. Adverse Event: Headache after vaccination. Onset: 2 hours post-injection..."

다음 중 하나로 분류:
- CS_Summary (Case Summary)
- PH_Literature (Published Literature)
- PH_Clinical (Clinical Trial)
- Table_LineList (Line Listing)
- Other

JSON 형식으로 응답: {"raw_id": "...", "confidence": 0.95, "reason": "..."}
""",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            duration = time.time() - start_time

            try:
                json_data = json.loads(response.text)
                is_valid = "raw_id" in json_data
            except:
                is_valid = False

            result = {
                "success": True,
                "response": response.text,
                "duration": round(duration, 2),
                "valid_classification": is_valid
            }
            print(f"      ✅ 성공 - {result['duration']}초")
            print(f"      분류 유효성: {'✅' if is_valid else '❌'}")
            print(f"      응답: {response.text[:100]}...")

        except Exception as e:
            result = {
                "success": False,
                "error": str(e),
                "duration": round(time.time() - start_time, 2)
            }
            print(f"      ❌ 실패 - {str(e)[:50]}")

        return result

    def test_data_extraction(self) -> Dict[str, Any]:
        """Test 7: Structured data extraction"""
        print(f"\n   7️⃣  데이터 추출 테스트...")

        start_time = time.time()
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents="""다음 마크다운 문서에서 제품 정보를 추출하세요:

# 제품 정보

- **제품명**: 코미나티주 근육주사
- **성분명**: 토지나메란 30μg
- **제조사**: 한국화이자제약 주식회사
- **허가일**: 2021년 3월 5일
- **유효기간**: 24개월

JSON으로 추출: product_name, ingredient_name, company_name, approval_date, shelf_life_months
""",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            duration = time.time() - start_time

            try:
                json_data = json.loads(response.text)
                required_fields = ["product_name", "ingredient_name", "company_name"]
                has_required = all(field in json_data for field in required_fields)
            except:
                has_required = False

            result = {
                "success": True,
                "response": response.text,
                "duration": round(duration, 2),
                "has_required_fields": has_required
            }
            print(f"      ✅ 성공 - {result['duration']}초")
            print(f"      필수 필드: {'✅' if has_required else '❌'}")
            print(f"      응답: {response.text[:150]}...")

        except Exception as e:
            result = {
                "success": False,
                "error": str(e),
                "duration": round(time.time() - start_time, 2)
            }
            print(f"      ❌ 실패 - {str(e)[:50]}")

        return result

    def test_qc_validation(self) -> Dict[str, Any]:
        """Test 8: QC validation"""
        print(f"\n   8️⃣  QC 검증 테스트...")

        start_time = time.time()
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents="""다음 PSUR 보고서 요약을 검증하세요:

# PSUR 보고서 (2024년 상반기)

## 제품 정보
- 제품명: 코미나티주
- 보고 기간: 2024-01-01 ~ 2024-06-30

## 안전성 데이터
- 총 이상사례: 150건
- 중대한 이상사례: 5건
- 사망 사례: 0건

## 결론
유익성-위해성 균형이 양호함

---

JSON 형식으로 QC 결과 제공:
{
  "status": "PASS/FAIL",
  "completeness_score": 0-100,
  "issues": [...],
  "recommendations": [...]
}
""",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    system_instruction="당신은 PSUR 보고서 품질 검증 전문가입니다."
                )
            )
            duration = time.time() - start_time

            try:
                json_data = json.loads(response.text)
                is_valid_qc = "status" in json_data
            except:
                is_valid_qc = False

            result = {
                "success": True,
                "response": response.text,
                "duration": round(duration, 2),
                "valid_qc_result": is_valid_qc
            }
            print(f"      ✅ 성공 - {result['duration']}초")
            print(f"      QC 결과 유효성: {'✅' if is_valid_qc else '❌'}")
            print(f"      응답: {response.text[:150]}...")

        except Exception as e:
            result = {
                "success": False,
                "error": str(e),
                "duration": round(time.time() - start_time, 2)
            }
            print(f"      ❌ 실패 - {str(e)[:50]}")

        return result

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all tests for this model"""
        print(f"\n{'='*60}")
        print(f"  🧪 모델 테스트: {self.model_name}")
        print(f"{'='*60}")

        # Run all tests
        self.results["tests"]["basic_connection"] = self.test_basic_connection()
        self.results["tests"]["korean_response"] = self.test_korean_response()
        self.results["tests"]["system_instruction"] = self.test_system_instruction()
        self.results["tests"]["json_mode"] = self.test_json_mode()
        self.results["tests"]["token_counting"] = self.test_token_counting()
        self.results["tests"]["raw_id_classification"] = self.test_raw_id_classification()
        self.results["tests"]["data_extraction"] = self.test_data_extraction()
        self.results["tests"]["qc_validation"] = self.test_qc_validation()

        # Calculate success rate
        total_tests = len(self.results["tests"])
        passed_tests = sum(1 for test in self.results["tests"].values() if test.get("success"))
        success_rate = (passed_tests / total_tests) * 100

        self.results["summary"] = {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": total_tests - passed_tests,
            "success_rate": round(success_rate, 1)
        }

        print(f"\n   📊 테스트 요약:")
        print(f"      전체: {total_tests}개")
        print(f"      성공: {passed_tests}개")
        print(f"      실패: {total_tests - passed_tests}개")
        print(f"      성공률: {success_rate}%")

        return self.results

    def _assess_korean_quality(self, text: str) -> int:
        """Assess Korean language quality (1-5)"""
        # Simple heuristic: check length and Korean character ratio
        if not text:
            return 1

        korean_chars = sum(1 for c in text if '\uac00' <= c <= '\ud7a3')
        total_chars = len(text.replace(" ", ""))

        if total_chars == 0:
            return 1

        korean_ratio = korean_chars / total_chars

        if korean_ratio > 0.7 and len(text) > 50:
            return 5
        elif korean_ratio > 0.5:
            return 4
        elif korean_ratio > 0.3:
            return 3
        elif korean_ratio > 0.1:
            return 2
        else:
            return 1


def main():
    """Run tests for all models"""

    print("\n" + "="*60)
    print("  🚀 GEMINI 모델 종합 테스트")
    print("="*60)
    print(f"\n📋 테스트 대상 모델: {len(MODELS)}개")
    for i, model in enumerate(MODELS, 1):
        print(f"   {i}. {model}")

    all_results = []

    for model in MODELS:
        try:
            tester = ModelTester(model)
            result = tester.run_all_tests()
            all_results.append(result)

            # Wait between models to avoid rate limits
            if model != MODELS[-1]:
                print("\n⏳ 다음 모델 테스트 전 대기 중... (3초)")
                time.sleep(3)

        except Exception as e:
            print(f"\n❌ 모델 {model} 테스트 중 오류: {e}")
            all_results.append({
                "model": model,
                "error": str(e),
                "summary": {
                    "total_tests": 0,
                    "passed_tests": 0,
                    "failed_tests": 0,
                    "success_rate": 0
                }
            })

    # Final comparison
    print("\n" + "="*60)
    print("  📊 전체 모델 비교")
    print("="*60)

    print(f"\n{'모델':40s} {'성공률':10s} {'통과/전체':10s}")
    print("-" * 65)

    for result in all_results:
        model_name = result["model"]
        summary = result.get("summary", {})
        success_rate = summary.get("success_rate", 0)
        passed = summary.get("passed_tests", 0)
        total = summary.get("total_tests", 0)

        print(f"{model_name:40s} {success_rate:>6.1f}%   {passed:>2d}/{total:<2d}")

    # Save results to file
    results_file = os.path.join(os.path.dirname(__file__), "test_results.json")
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    print(f"\n💾 상세 결과 저장: {results_file}")

    print("\n" + "="*60)
    print("  ✅ 전체 테스트 완료!")
    print("="*60)
    print("\n")


if __name__ == '__main__':
    main()
