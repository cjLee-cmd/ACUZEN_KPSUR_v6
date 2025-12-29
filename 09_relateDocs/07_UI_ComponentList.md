# KSUR 시스템 UI 컴포넌트 및 팝업 리스트

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | KSUR UI 컴포넌트 및 팝업 리스트 |
| 문서 버전 | 1.1 (temp.txt 요구사항 반영) |
| 작성일 | 2025-12-29 |
| 최종 수정일 | 2025-12-29 |
| 목적 | 전체 UI 페이지, 컴포넌트, 팝업/모달 목록 정의 |

### 버전 1.1 변경 사항
- ✅ P-34: 약품명 데이터베이스 관리 페이지 추가
- ✅ C-207, C-1007~C-1008: 약품명 DB 관리 컴포넌트 추가
- ✅ C-02a, C-05a, C-1009: 테스트/프로덕션 모드 관리 컴포넌트 추가
- ✅ C-307: RAW ID 필수/선택 검증 컴포넌트 추가
- ✅ C-502a~C-502b: CS 데이터 60개 관리 컴포넌트 추가
- ✅ C-808~C-810: QC LLM 선택 및 비용 모니터링 컴포넌트 추가
- ✅ M-105~M-107, M-206, M-707, M-906: 누락 모달 추가
- ✅ T-14~T-15, T-57~T-58: 누락 토스트 추가
- ✅ Phase 1~7: 개발 우선순위 재구성

---

## 목차

1. [페이지 목록](#1-페이지-목록)
2. [공통 컴포넌트](#2-공통-컴포넌트)
3. [단계별 전용 컴포넌트](#3-단계별-전용-컴포넌트)
4. [팝업/모달 목록](#4-팝업모달-목록)
5. [알림/토스트 메시지](#5-알림토스트-메시지)
6. [컴포넌트 계층 구조](#6-컴포넌트-계층-구조)

---

# 1. 페이지 목록

## 1.1 인증 관련 페이지

| # | 페이지명 | 라우트 | 설명 | 접근 권한 |
|---|---------|--------|------|-----------|
| P-01 | 로그인 페이지 | `/login` | 이메일/비밀번호 로그인 | Public |
| P-02 | 회원가입 페이지 | `/signup` | 신규 사용자 등록 | Public |
| P-03 | 비밀번호 재설정 페이지 | `/reset-password` | 비밀번호 재설정 요청 | Public |
| P-04 | 비밀번호 변경 페이지 | `/change-password` | 이메일 링크로 접근 | Public |

## 1.2 메인 워크플로우 페이지

| # | 페이지명 | 라우트 | 설명 | 접근 권한 |
|---|---------|--------|------|-----------|
| P-10 | 대시보드 | `/dashboard` | 전체 현황 및 통계 | All |
| P-11 | 보고서 목록 | `/reports` | 모든 보고서 목록 조회 | All |
| P-12 | 보고서 상세 | `/reports/:id` | 특정 보고서 상세 정보 | All |
| P-13 | 새 보고서 생성 | `/reports/new` | 새 보고서 생성 (사용자 입력) | Master, Author |
| P-14 | 파일 업로드 | `/reports/:id/upload` | 소스 문서 업로드 및 분류 | Master, Author |
| P-15 | 마크다운 변환 | `/reports/:id/convert` | 파일 → 마크다운 변환 현황 | Master, Author |
| P-16 | 데이터 추출 | `/reports/:id/extract` | CS/PH/Table 데이터 추출 | Master, Author |
| P-17 | 템플릿 작성 | `/reports/:id/template` | 템플릿에 데이터 적용 | Master, Author |
| P-18 | 리뷰 | `/reports/:id/review` | 섹션별 검토 및 수정 | Master, Author, Reviewer |
| P-19 | QC 검증 | `/reports/:id/qc` | 품질 검증 및 수정 | Master, Author |
| P-20 | 최종 출력 | `/reports/:id/output` | Word 파일 생성 및 다운로드 | Master, Author |

## 1.3 관리 페이지

| # | 페이지명 | 라우트 | 설명 | 접근 권한 |
|---|---------|--------|------|-----------|
| P-30 | 사용자 관리 | `/admin/users` | 사용자 목록 및 권한 관리 | Master |
| P-31 | 시스템 설정 | `/admin/settings` | LLM 설정, API 키 관리 | Master |
| P-32 | 감사 로그 | `/admin/audit-logs` | 시스템 활동 로그 조회 | Master |
| P-33 | 내 프로필 | `/profile` | 사용자 프로필 및 설정 | All |
| P-34 | 약품명 데이터베이스 관리 | `/admin/drug-master` | 약품명 마스터 데이터 관리 (약품명 선택 시 자동 입력되는 데이터) | Master |

---

# 2. 공통 컴포넌트

## 2.1 레이아웃 컴포넌트

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-01 | AppLayout | `src/components/layout/AppLayout.tsx` | 전체 앱 레이아웃 (헤더+사이드바+컨텐츠) |
| C-02 | Header | `src/components/layout/Header.tsx` | 상단 헤더 (로고, 사용자 메뉴, 배포 모드 표시) |
| C-02a | DeploymentModeBadge | `src/components/layout/DeploymentModeBadge.tsx` | 헤더에 표시되는 현재 모드 뱃지 (TEST/PROD) |
| C-03 | Sidebar | `src/components/layout/Sidebar.tsx` | 좌측 네비게이션 사이드바 |
| C-04 | Breadcrumb | `src/components/layout/Breadcrumb.tsx` | 현재 위치 표시 |
| C-05 | Footer | `src/components/layout/Footer.tsx` | 하단 푸터 |
| C-05a | StorageStatusIndicator | `src/components/layout/StorageStatusIndicator.tsx` | 푸터에 표시되는 Supabase Storage 연결 상태 |

## 2.2 네비게이션 컴포넌트

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-10 | NavMenu | `src/components/nav/NavMenu.tsx` | 메인 네비게이션 메뉴 |
| C-11 | UserMenu | `src/components/nav/UserMenu.tsx` | 사용자 드롭다운 메뉴 |
| C-12 | WorkflowStepper | `src/components/nav/WorkflowStepper.tsx` | 워크플로우 단계 표시 (1-9단계) |
| C-13 | TabNavigation | `src/components/nav/TabNavigation.tsx` | 탭 네비게이션 |

## 2.3 폼 컴포넌트 (shadcn/ui 기반)

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-20 | Button | `src/components/ui/button.tsx` | 버튼 |
| C-21 | Input | `src/components/ui/input.tsx` | 텍스트 입력 |
| C-22 | Textarea | `src/components/ui/textarea.tsx` | 긴 텍스트 입력 |
| C-23 | Select | `src/components/ui/select.tsx` | 드롭다운 선택 |
| C-24 | Checkbox | `src/components/ui/checkbox.tsx` | 체크박스 |
| C-25 | RadioGroup | `src/components/ui/radio-group.tsx` | 라디오 버튼 그룹 |
| C-26 | Switch | `src/components/ui/switch.tsx` | 토글 스위치 |
| C-27 | Label | `src/components/ui/label.tsx` | 폼 레이블 |
| C-28 | DatePicker | `src/components/ui/date-picker.tsx` | 날짜 선택기 |

## 2.4 데이터 표시 컴포넌트

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-30 | Table | `src/components/ui/table.tsx` | 데이터 테이블 |
| C-31 | Card | `src/components/ui/card.tsx` | 카드 컨테이너 |
| C-32 | Badge | `src/components/ui/badge.tsx` | 뱃지 (상태 표시 등) |
| C-33 | Avatar | `src/components/ui/avatar.tsx` | 사용자 아바타 |
| C-34 | ProgressBar | `src/components/ui/progress.tsx` | 진행률 표시 |
| C-35 | Spinner | `src/components/ui/spinner.tsx` | 로딩 스피너 |
| C-36 | Skeleton | `src/components/ui/skeleton.tsx` | 로딩 스켈레톤 |

## 2.5 피드백 컴포넌트

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-40 | Alert | `src/components/ui/alert.tsx` | 알림 메시지 |
| C-41 | Toast | `src/components/ui/toast.tsx` | 토스트 알림 |
| C-42 | Tooltip | `src/components/ui/tooltip.tsx` | 툴팁 |
| C-43 | ErrorBoundary | `src/components/ErrorBoundary.tsx` | 에러 경계 |
| C-44 | EmptyState | `src/components/EmptyState.tsx` | 빈 상태 표시 |

## 2.6 파일 관련 컴포넌트

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-50 | FileUploader | `src/components/file/FileUploader.tsx` | 드래그앤드롭 파일 업로드 |
| C-51 | FileList | `src/components/file/FileList.tsx` | 업로드된 파일 목록 |
| C-52 | FilePreview | `src/components/file/FilePreview.tsx` | 파일 미리보기 (PDF, 이미지) |
| C-53 | FileIcon | `src/components/file/FileIcon.tsx` | 파일 타입별 아이콘 |

## 2.7 마크다운 관련 컴포넌트

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-60 | MarkdownViewer | `src/components/markdown/MarkdownViewer.tsx` | 마크다운 렌더링 (읽기 전용) |
| C-61 | MarkdownEditor | `src/components/markdown/MarkdownEditor.tsx` | 마크다운 편집기 |
| C-62 | MarkdownPreview | `src/components/markdown/MarkdownPreview.tsx` | 실시간 미리보기 |

---

# 3. 단계별 전용 컴포넌트

## 3.1 Stage 1: 로그인 (P-01~P-04)

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-101 | LoginForm | `src/components/auth/LoginForm.tsx` | 로그인 폼 |
| C-102 | SignupForm | `src/components/auth/SignupForm.tsx` | 회원가입 폼 |
| C-103 | ResetPasswordForm | `src/components/auth/ResetPasswordForm.tsx` | 비밀번호 재설정 폼 |
| C-104 | AuthGuard | `src/components/auth/AuthGuard.tsx` | 라우트 보호 (권한 검사) |

## 3.2 Stage 2: 보고서 상태 (P-10~P-13)

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-201 | DashboardStats | `src/components/dashboard/DashboardStats.tsx` | 통계 카드 (총 보고서 수 등) |
| C-202 | RecentReports | `src/components/dashboard/RecentReports.tsx` | 최근 보고서 목록 |
| C-203 | ReportListTable | `src/components/report/ReportListTable.tsx` | 보고서 목록 테이블 |
| C-204 | ReportCard | `src/components/report/ReportCard.tsx` | 보고서 카드 |
| C-205 | ReportStatusBadge | `src/components/report/ReportStatusBadge.tsx` | 보고서 상태 뱃지 (Draft/InProgress/Completed) |
| C-206 | NewReportForm | `src/components/report/NewReportForm.tsx` | 새 보고서 생성 폼 (약품명 선택 + 6개 사용자 입력) |
| C-207 | DrugMasterSelector | `src/components/report/DrugMasterSelector.tsx` | 약품명 선택 드롭다운 (선택 시 마스터 DB에서 관련 데이터 자동 입력) |
| C-208 | ReportDetailHeader | `src/components/report/ReportDetailHeader.tsx` | 보고서 상세 헤더 |

## 3.3 Stage 3: 파일 업로드 및 분류 (P-14)

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-301 | UploadZone | `src/components/upload/UploadZone.tsx` | 파일 드래그앤드롭 영역 |
| C-302 | UploadedFileList | `src/components/upload/UploadedFileList.tsx` | 업로드된 파일 목록 + RAW ID |
| C-303 | FileClassificationCard | `src/components/upload/FileClassificationCard.tsx` | 개별 파일 분류 카드 |
| C-304 | RawIdBadge | `src/components/upload/RawIdBadge.tsx` | RAW ID 태그 뱃지 (필수/선택 색상 구분) |
| C-305 | ClassificationProgress | `src/components/upload/ClassificationProgress.tsx` | 분류 진행률 |
| C-306 | RawIdTable | `src/components/upload/RawIdTable.tsx` | RAW ID 정의 참조 테이블 (필수/선택 표시 포함) |
| C-307 | UploadValidationStatus | `src/components/upload/UploadValidationStatus.tsx` | 필수 RAW ID 업로드 완료 여부 체크리스트 |

## 3.4 Stage 4: 마크다운 변환 (P-15)

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-401 | ConversionQueue | `src/components/convert/ConversionQueue.tsx` | 변환 대기열 표시 |
| C-402 | ConversionStatusCard | `src/components/convert/ConversionStatusCard.tsx` | 개별 파일 변환 상태 |
| C-403 | MarkdownPreviewPanel | `src/components/convert/MarkdownPreviewPanel.tsx` | 변환된 마크다운 미리보기 |
| C-404 | ConversionErrorAlert | `src/components/convert/ConversionErrorAlert.tsx` | 변환 오류 알림 |

## 3.5 Stage 5: 데이터 추출 (P-16)

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-501 | ExtractionDashboard | `src/components/extract/ExtractionDashboard.tsx` | 추출 전체 현황 |
| C-502 | CSDataTable | `src/components/extract/CSDataTable.tsx` | CS 데이터 60개 표시 테이블 (카테고리별 탭: 기본정보/날짜/안전성/허가/판매) |
| C-502a | CSDataSearch | `src/components/extract/CSDataSearch.tsx` | CS 데이터 변수명/값 검색 필터 |
| C-502b | CSDataCategoryFilter | `src/components/extract/CSDataCategoryFilter.tsx` | CS 데이터 카테고리별 필터링 |
| C-503 | PHDataTable | `src/components/extract/PHDataTable.tsx` | PH 데이터 9개 표시 테이블 |
| C-504 | TableDataDisplay | `src/components/extract/TableDataDisplay.tsx` | Table 데이터 7개 표시 |
| C-505 | DataSourceLink | `src/components/extract/DataSourceLink.tsx` | 데이터 출처 링크 (RAW ID) |
| C-506 | ExtractionProgress | `src/components/extract/ExtractionProgress.tsx` | 추출 진행률 (60/60 등) |
| C-507 | MissingDataAlert | `src/components/extract/MissingDataAlert.tsx` | 누락 데이터 경고 |
| C-508 | ConflictDataAlert | `src/components/extract/ConflictDataAlert.tsx` | 충돌 데이터 경고 |
| C-509 | DataInputDialog | `src/components/extract/DataInputDialog.tsx` | 수동 데이터 입력 (누락 시) |
| C-510 | ConflictResolutionPanel | `src/components/extract/ConflictResolutionPanel.tsx` | 충돌 데이터 선택 UI |

## 3.6 Stage 6: 템플릿 작성 (P-17)

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-601 | TemplateEditor | `src/components/template/TemplateEditor.tsx` | 템플릿 편집기 |
| C-602 | SectionList | `src/components/template/SectionList.tsx` | 섹션 목록 (00_표지 ~ 14_별첨) |
| C-603 | SectionPreview | `src/components/template/SectionPreview.tsx` | 섹션 미리보기 |
| C-604 | DataVariableTag | `src/components/template/DataVariableTag.tsx` | 변수 태그 표시 ({{CS1}} 등) |
| C-605 | TemplateProgress | `src/components/template/TemplateProgress.tsx` | 템플릿 작성 진행률 |

## 3.7 Stage 7: 리뷰 (P-18)

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-701 | ReviewLayout | `src/components/review/ReviewLayout.tsx` | 좌우 분할 레이아웃 (원본/수정) |
| C-702 | SectionNavigator | `src/components/review/SectionNavigator.tsx` | 섹션 네비게이터 |
| C-703 | OriginalSectionView | `src/components/review/OriginalSectionView.tsx` | 원본 섹션 표시 (좌측) |
| C-704 | EditableSectionView | `src/components/review/EditableSectionView.tsx` | 편집 가능 섹션 (우측) |
| C-705 | ReviewToolbar | `src/components/review/ReviewToolbar.tsx` | 리뷰 도구바 (저장, 머지, 출력 버튼) |
| C-706 | ChangeHistory | `src/components/review/ChangeHistory.tsx` | 수정 이력 표시 |
| C-707 | CommentPanel | `src/components/review/CommentPanel.tsx` | 코멘트 패널 (Reviewer용) |
| C-708 | DiffViewer | `src/components/review/DiffViewer.tsx` | 변경 사항 비교 (수정 전/후) |

## 3.8 Stage 8: QC 검증 (P-19)

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-801 | QCDashboard | `src/components/qc/QCDashboard.tsx` | QC 검증 대시보드 |
| C-802 | QCIssueList | `src/components/qc/QCIssueList.tsx` | 발견된 이슈 목록 |
| C-803 | QCIssueCard | `src/components/qc/QCIssueCard.tsx` | 개별 이슈 카드 |
| C-804 | QCValidationProgress | `src/components/qc/QCValidationProgress.tsx` | 검증 진행률 |
| C-805 | IssueFixEditor | `src/components/qc/IssueFixEditor.tsx` | 이슈 수정 편집기 |
| C-806 | QCReportViewer | `src/components/qc/QCReportViewer.tsx` | QC 리포트 뷰어 |
| C-807 | QCApprovalButton | `src/components/qc/QCApprovalButton.tsx` | QC 승인 버튼 |
| C-808 | QCModelSelector | `src/components/qc/QCModelSelector.tsx` | QC 페이지 내 LLM 모델 선택 (Flash-Thinking 기본값) |
| C-809 | LLMUsageMonitor | `src/components/qc/LLMUsageMonitor.tsx` | LLM 사용량 및 예상 비용 표시 (토큰 수, 비용) |
| C-810 | LLMCostAlert | `src/components/qc/LLMCostAlert.tsx` | LLM 비용 임계값 경고 알림 |

## 3.9 Stage 9: 최종 출력 (P-20)

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-901 | OutputPreview | `src/components/output/OutputPreview.tsx` | 최종 문서 미리보기 |
| C-902 | OutputFormatSelector | `src/components/output/OutputFormatSelector.tsx` | 출력 포맷 선택 (Word) |
| C-903 | DownloadButton | `src/components/output/DownloadButton.tsx` | 다운로드 버튼 |
| C-904 | OutputMetadata | `src/components/output/OutputMetadata.tsx` | 출력 문서 메타데이터 |
| C-905 | ExportHistory | `src/components/output/ExportHistory.tsx` | 출력 이력 |

## 3.10 관리 페이지 컴포넌트 (P-30~P-34)

| # | 컴포넌트명 | 파일 경로 | 설명 |
|---|-----------|-----------|------|
| C-1001 | UserManagementTable | `src/components/admin/UserManagementTable.tsx` | 사용자 관리 테이블 |
| C-1002 | UserRoleSelector | `src/components/admin/UserRoleSelector.tsx` | 사용자 역할 선택 |
| C-1003 | LLMSettings | `src/components/admin/LLMSettings.tsx` | LLM 설정 (모델, API 키) |
| C-1004 | AuditLogTable | `src/components/admin/AuditLogTable.tsx` | 감사 로그 테이블 |
| C-1005 | SystemHealthDashboard | `src/components/admin/SystemHealthDashboard.tsx` | 시스템 상태 모니터링 |
| C-1006 | ProfileSettings | `src/components/profile/ProfileSettings.tsx` | 프로필 설정 |
| C-1007 | DrugMasterTable | `src/components/admin/DrugMasterTable.tsx` | 약품명 마스터 데이터 목록 테이블 (P-34) |
| C-1008 | DrugMasterForm | `src/components/admin/DrugMasterForm.tsx` | 약품명 + 종속 데이터 입력/수정 폼 (CS0, CS1, CS2, CS5 등) |
| C-1009 | DeploymentModeToggle | `src/components/admin/DeploymentModeToggle.tsx` | 테스트/프로덕션 모드 전환 토글 (P-31) |

---

# 4. 팝업/모달 목록

## 4.1 일반 모달

| # | 모달명 | 트리거 | 설명 | 액션 |
|---|--------|--------|------|------|
| M-01 | 확인 모달 | 삭제, 중요 작업 전 | "정말 삭제하시겠습니까?" | 확인/취소 |
| M-02 | 알림 모달 | 작업 완료/실패 | "작업이 완료되었습니다" | 확인 |
| M-03 | 에러 모달 | API 오류 등 | 에러 메시지 상세 표시 | 확인 |
| M-04 | 로딩 모달 | 긴 작업 진행 중 | 스피너 + 진행률 | 자동 닫힘 |

## 4.2 Stage 2: 보고서 상태

| # | 모달명 | 트리거 | 설명 | 액션 |
|---|--------|--------|------|------|
| M-101 | 새 보고서 생성 모달 | "처음 작성" 버튼 클릭 | 약품명 선택 + 6개 사용자 입력 폼 | 생성/취소 |
| M-102 | 계속 작성 선택 모달 | "계속 작성" 버튼 클릭 | Draft 보고서 목록 표시 | 선택/취소 |
| M-103 | 보고서 삭제 확인 모달 | 보고서 삭제 버튼 클릭 | "이 보고서를 삭제하시겠습니까?" | 삭제/취소 |
| M-104 | 보고서 정보 보기 모달 | 보고서 카드 클릭 | 보고서 상세 정보 (메타데이터) | 닫기 |
| M-105 | 약품명 추가 모달 | 약품명 DB 관리에서 "추가" 버튼 | 약품명 마스터 데이터 입력 폼 (CS0, CS1, CS2, CS5 등) | 저장/취소 |
| M-106 | 약품명 수정 모달 | 약품명 DB 관리에서 "수정" 버튼 | 기존 약품명 데이터 수정 폼 | 저장/취소 |
| M-107 | 약품명 삭제 확인 모달 | 약품명 DB 관리에서 "삭제" 버튼 | "이 약품명을 삭제하시겠습니까?" | 삭제/취소 |

## 4.3 Stage 3: 파일 업로드 및 분류

| # | 모달명 | 트리거 | 설명 | 액션 |
|---|--------|--------|------|------|
| M-201 | 파일 업로드 모달 | "파일 업로드" 버튼 | 드래그앤드롭 또는 파일 선택 | 업로드/취소 |
| M-202 | RAW ID 수동 분류 모달 | 자동 분류 실패 시 | RAW ID 목록에서 수동 선택 | 적용/취소 |
| M-203 | RAW ID 정보 모달 | RAW ID 뱃지 클릭 | RAW ID 설명 (영문/한글) | 닫기 |
| M-204 | 파일 삭제 확인 모달 | 파일 삭제 버튼 | "이 파일을 삭제하시겠습니까?" | 삭제/취소 |
| M-205 | 중복 파일 경고 모달 | 동일 RAW ID 파일 업로드 | "같은 RAW ID 파일이 이미 존재합니다" | 덮어쓰기/취소 |
| M-206 | 업로드 불완전 경고 모달 | "다음 단계" 버튼 클릭 시 필수 파일 누락 | "필수 RAW ID: RAW1, RAW3이 업로드되지 않았습니다" | 확인 |

## 4.4 Stage 4: 마크다운 변환

| # | 모달명 | 트리거 | 설명 | 액션 |
|---|--------|--------|------|------|
| M-301 | 마크다운 미리보기 모달 | 파일 미리보기 버튼 | 변환된 마크다운 전체 보기 | 닫기 |
| M-302 | 변환 재시도 확인 모달 | 변환 실패 파일 재시도 | "다시 변환하시겠습니까?" | 재시도/취소 |
| M-303 | 변환 진행 모달 | 변환 시작 시 | 변환 진행률 표시 (파일별) | 자동 닫힘 |

## 4.5 Stage 5: 데이터 추출

| # | 모달명 | 트리거 | 설명 | 액션 |
|---|--------|--------|------|------|
| M-401 | 누락 데이터 입력 모달 | 필수 데이터 누락 시 | "다음 데이터가 누락되었습니다. 입력하세요" | 저장/건너뛰기 |
| M-402 | 충돌 데이터 선택 모달 | 동일 변수 다른 값 발견 | 여러 값 중 선택 UI + 출처 표시 | 선택/취소 |
| M-403 | 데이터 상세 보기 모달 | 변수 클릭 | 변수 정의, 출처, 값 | 닫기 |
| M-404 | 데이터 수동 수정 모달 | 수정 버튼 클릭 | 특정 변수 값 수정 | 저장/취소 |
| M-405 | 추출 완료 알림 모달 | 추출 완료 시 | "총 76개 데이터 중 70개 추출 완료" | 확인 |

## 4.6 Stage 6: 템플릿 작성

| # | 모달명 | 트리거 | 설명 | 액션 |
|---|--------|--------|------|------|
| M-501 | 템플릿 변수 안내 모달 | ? 아이콘 클릭 | 변수 사용법 설명 ({{CS1}} 등) | 닫기 |
| M-502 | 섹션 미리보기 모달 | 섹션 미리보기 버튼 | 전체 섹션 렌더링 결과 | 닫기 |

## 4.7 Stage 7: 리뷰

| # | 모달명 | 트리거 | 설명 | 액션 |
|---|--------|--------|------|------|
| M-601 | 섹션 저장 확인 모달 | 저장 버튼 클릭 | "변경 사항을 저장하시겠습니까?" | 저장/취소 |
| M-602 | 머지 확인 모달 | 머지 버튼 클릭 | "모든 섹션을 병합하시겠습니까?" | 머지/취소 |
| M-603 | Draft 출력 확인 모달 | 출력 버튼 클릭 | "Draft 버전 Word 파일을 생성합니다" | 생성/취소 |
| M-604 | 코멘트 작성 모달 | 코멘트 버튼 클릭 (Reviewer) | 리뷰 코멘트 작성 | 저장/취소 |
| M-605 | 변경 이력 모달 | 이력 보기 버튼 | 수정 전/후 비교 (diff) | 닫기 |
| M-606 | 이전 버전 복원 모달 | 복원 버튼 클릭 | "이전 버전으로 복원하시겠습니까?" | 복원/취소 |

## 4.8 Stage 8: QC 검증

| # | 모달명 | 트리거 | 설명 | 액션 |
|---|--------|--------|------|------|
| M-701 | QC 시작 확인 모달 | QC 시작 버튼 | "QC 검증을 시작합니다 (예상 비용: ₩15,000)" | 시작/취소 |
| M-702 | QC 진행 모달 | QC 실행 중 | 진행률 + 현재 검증 항목 + 실시간 비용 | 자동 닫힘 |
| M-703 | 이슈 상세 모달 | 이슈 카드 클릭 | 이슈 설명, 위치, 수정 권장 사항 | 수정/무시/닫기 |
| M-704 | 수정 확인 모달 | 수정 적용 버튼 | "수정 사항을 적용하시겠습니까?" | 적용/취소 |
| M-705 | QC 재실행 확인 모달 | 수정 후 재실행 | "수정 후 QC를 다시 실행하시겠습니까?" | 재실행/나중에 |
| M-706 | QC 승인 모달 | QC 승인 버튼 | "문제 없음. Draft 상태를 해제합니다" | 승인/취소 |
| M-707 | LLM 비용 경고 모달 | 예상 비용이 임계값 초과 시 | "예상 LLM 비용이 ₩50,000을 초과합니다. 계속하시겠습니까?" | 계속/취소 |

## 4.9 Stage 9: 최종 출력

| # | 모달명 | 트리거 | 설명 | 액션 |
|---|--------|--------|------|------|
| M-801 | 최종 출력 확인 모달 | 출력 버튼 클릭 | "최종 Word 파일을 생성합니다" | 생성/취소 |
| M-802 | 출력 진행 모달 | 출력 실행 중 | 문서 생성 진행률 | 자동 닫힘 |
| M-803 | 다운로드 완료 모달 | 다운로드 완료 시 | "파일이 다운로드되었습니다" | 확인 |
| M-804 | 이전 출력 이력 모달 | 이력 보기 버튼 | 과거 출력 파일 목록 | 다운로드/닫기 |

## 4.10 관리 페이지 모달

| # | 모달명 | 트리거 | 설명 | 액션 |
|---|--------|--------|------|------|
| M-901 | 사용자 추가 모달 | 사용자 추가 버튼 | 이메일, 이름, 역할 입력 | 추가/취소 |
| M-902 | 사용자 수정 모달 | 사용자 수정 버튼 | 역할 변경, 정보 수정 | 저장/취소 |
| M-903 | 사용자 삭제 확인 모달 | 사용자 삭제 버튼 | "사용자를 삭제하시겠습니까?" | 삭제/취소 |
| M-904 | API 키 입력 모달 | API 키 설정 버튼 | Gemini API 키 입력 | 저장/취소 |
| M-905 | 설정 저장 확인 모달 | 설정 저장 버튼 | "설정을 저장하시겠습니까?" | 저장/취소 |
| M-906 | 프로덕션 모드 전환 경고 모달 | 배포 모드 토글 클릭 (TEST→PROD) | "프로덕션 모드로 전환하시겠습니까? 모든 데이터가 Supabase Storage에 저장됩니다" | 전환/취소 |

---

# 5. 알림/토스트 메시지

## 5.1 성공 토스트

| # | 메시지 | 트리거 |
|---|--------|--------|
| T-01 | "로그인되었습니다" | 로그인 성공 |
| T-02 | "보고서가 생성되었습니다" | 새 보고서 생성 |
| T-03 | "파일이 업로드되었습니다" | 파일 업로드 완료 |
| T-04 | "파일이 분류되었습니다" | RAW ID 분류 완료 |
| T-05 | "마크다운 변환이 완료되었습니다" | 변환 완료 |
| T-06 | "데이터 추출이 완료되었습니다" | 추출 완료 |
| T-07 | "템플릿이 저장되었습니다" | 템플릿 저장 |
| T-08 | "섹션이 저장되었습니다" | 리뷰 저장 |
| T-09 | "모든 섹션이 병합되었습니다" | 머지 완료 |
| T-10 | "QC 검증이 완료되었습니다" | QC 완료 |
| T-11 | "Draft 상태가 해제되었습니다" | QC 승인 |
| T-12 | "파일이 다운로드되었습니다" | 파일 다운로드 |
| T-13 | "설정이 저장되었습니다" | 설정 저장 |
| T-14 | "약품명 데이터가 저장되었습니다" | 약품명 DB 추가/수정 완료 |
| T-15 | "배포 모드가 변경되었습니다" | 테스트/프로덕션 모드 전환 완료 |

## 5.2 경고 토스트

| # | 메시지 | 트리거 |
|---|--------|--------|
| T-51 | "필수 항목을 입력하세요" | 폼 검증 실패 |
| T-52 | "파일 크기가 너무 큽니다 (최대 50MB)" | 파일 크기 초과 |
| T-53 | "지원하지 않는 파일 형식입니다" | 잘못된 파일 타입 |
| T-54 | "일부 데이터가 누락되었습니다" | 데이터 추출 불완전 |
| T-55 | "충돌하는 데이터가 발견되었습니다" | 데이터 충돌 |
| T-56 | "QC에서 문제가 발견되었습니다" | QC 이슈 발견 |
| T-57 | "필수 RAW ID 파일이 업로드되지 않았습니다" | 필수 파일 누락 상태로 다음 단계 이동 시도 |
| T-58 | "예상 LLM 비용: ₩15,000" | QC 시작 전 비용 정보 표시 |

## 5.3 에러 토스트

| # | 메시지 | 트리거 |
|---|--------|--------|
| T-101 | "로그인에 실패했습니다" | 로그인 실패 |
| T-102 | "네트워크 오류가 발생했습니다" | API 호출 실패 |
| T-103 | "파일 업로드에 실패했습니다" | 업로드 실패 |
| T-104 | "마크다운 변환에 실패했습니다" | 변환 실패 |
| T-105 | "데이터 추출에 실패했습니다" | 추출 실패 |
| T-106 | "QC 검증에 실패했습니다" | QC 실패 |
| T-107 | "파일 생성에 실패했습니다" | 출력 실패 |

## 5.4 정보 토스트

| # | 메시지 | 트리거 |
|---|--------|--------|
| T-201 | "파일 분류 중입니다..." | 분류 진행 중 |
| T-202 | "마크다운 변환 중입니다..." | 변환 진행 중 |
| T-203 | "데이터 추출 중입니다..." | 추출 진행 중 |
| T-204 | "QC 검증 중입니다..." | QC 진행 중 |
| T-205 | "파일을 생성 중입니다..." | 출력 진행 중 |

---

# 6. 컴포넌트 계층 구조

## 6.1 전체 앱 구조

```
App
├── Router
│   ├── PublicRoutes (로그인 전)
│   │   ├── LoginPage (P-01)
│   │   │   └── LoginForm (C-101)
│   │   ├── SignupPage (P-02)
│   │   │   └── SignupForm (C-102)
│   │   └── ResetPasswordPage (P-03)
│   │       └── ResetPasswordForm (C-103)
│   │
│   └── PrivateRoutes (로그인 후)
│       └── AppLayout (C-01)
│           ├── Header (C-02)
│           │   └── UserMenu (C-11)
│           ├── Sidebar (C-03)
│           │   └── NavMenu (C-10)
│           ├── MainContent
│           │   ├── Breadcrumb (C-04)
│           │   ├── WorkflowStepper (C-12)
│           │   └── PageContent
│           │       ├── DashboardPage (P-10)
│           │       ├── ReportListPage (P-11)
│           │       ├── ReportDetailPage (P-12)
│           │       ├── NewReportPage (P-13)
│           │       ├── FileUploadPage (P-14)
│           │       ├── ConvertPage (P-15)
│           │       ├── ExtractPage (P-16)
│           │       ├── TemplatePage (P-17)
│           │       ├── ReviewPage (P-18)
│           │       ├── QCPage (P-19)
│           │       ├── OutputPage (P-20)
│           │       └── AdminPages (P-30~P-33)
│           └── Footer (C-05)
│
├── Modals (전역 모달 관리)
│   ├── ConfirmModal (M-01)
│   ├── AlertModal (M-02)
│   ├── ErrorModal (M-03)
│   └── LoadingModal (M-04)
│
└── ToastProvider (토스트 알림 관리)
```

## 6.2 주요 페이지별 컴포넌트 구조

### P-14: 파일 업로드 페이지

```
FileUploadPage
├── WorkflowStepper (현재: Stage 3)
├── UploadZone (C-301)
│   └── FileUploader (C-50)
├── UploadedFileList (C-302)
│   └── FileClassificationCard[] (C-303)
│       ├── FileIcon (C-53)
│       ├── RawIdBadge (C-304)
│       └── Button (삭제, 미리보기)
├── ClassificationProgress (C-305)
└── RawIdTable (C-306) - 참조용
```

### P-16: 데이터 추출 페이지

```
ExtractPage
├── WorkflowStepper (현재: Stage 5)
├── ExtractionDashboard (C-501)
│   └── ExtractionProgress (C-506)
├── TabNavigation (CS/PH/Table)
│   ├── CSDataTable (C-502)
│   │   ├── DataSourceLink[] (C-505)
│   │   ├── MissingDataAlert (C-507)
│   │   └── ConflictDataAlert (C-508)
│   ├── PHDataTable (C-503)
│   └── TableDataDisplay (C-504)
└── ActionButtons
    ├── Button (데이터 입력) → DataInputDialog (C-509)
    └── Button (충돌 해결) → ConflictResolutionPanel (C-510)
```

### P-18: 리뷰 페이지

```
ReviewPage
├── WorkflowStepper (현재: Stage 7)
├── SectionNavigator (C-702)
│   └── SectionList (C-602)
├── ReviewLayout (C-701) - 좌우 분할
│   ├── OriginalSectionView (C-703) - 좌측
│   │   └── MarkdownViewer (C-60)
│   └── EditableSectionView (C-704) - 우측
│       └── MarkdownEditor (C-61)
├── ReviewToolbar (C-705)
│   ├── Button (저장) → M-601
│   ├── Button (머지) → M-602
│   └── Button (출력) → M-603
├── CommentPanel (C-707) - Reviewer용
└── ChangeHistory (C-706)
    └── DiffViewer (C-708)
```

### P-19: QC 페이지

```
QCPage
├── WorkflowStepper (현재: Stage 8)
├── QCDashboard (C-801)
│   └── QCValidationProgress (C-804)
├── QCIssueList (C-802)
│   └── QCIssueCard[] (C-803)
│       └── Button (수정) → IssueFixEditor (C-805)
├── QCReportViewer (C-806)
└── QCApprovalButton (C-807) → M-706
```

---

# 7. 컴포넌트 개발 우선순위

## Phase 1: 기본 인프라 (필수 공통 컴포넌트)

1. **레이아웃** (C-01~C-05, C-02a, C-05a)
2. **배포 모드 관리** (C-02a: DeploymentModeBadge, C-05a: StorageStatusIndicator)
3. **shadcn/ui 기본** (C-20~C-28, C-30~C-36, C-40~C-44)
4. **인증** (C-101~C-104)

## Phase 2: 보고서 관리 + 약품명 DB

5. **대시보드** (C-201~C-208)
6. **약품명 DB 관리** (C-1007~C-1008, P-34)
7. **모달**: M-01~M-04, M-101~M-107 (약품명 모달 M-105~M-107 포함)

## Phase 3: 파일 처리 + RAW ID 검증

8. **파일 업로드** (C-301~C-307, C-50~C-53)
9. **RAW ID 검증** (C-307: UploadValidationStatus, C-304/C-306 개선)
10. **모달**: M-201~M-206 (업로드 불완전 경고 M-206 포함)

## Phase 4: 데이터 처리 + CS 데이터 관리

11. **마크다운 변환** (C-401~C-404, C-60~C-62)
12. **데이터 추출** (C-501~C-510, C-502a~C-502b)
13. **CS 데이터 검색/필터** (C-502a~C-502b: 60개 데이터 관리)
14. **모달**: M-301~M-303, M-401~M-405

## Phase 5: 템플릿 및 리뷰

15. **템플릿** (C-601~C-605)
16. **리뷰** (C-701~C-708)
17. **모달**: M-501~M-502, M-601~M-606

## Phase 6: QC (LLM 포함) + 출력

18. **QC** (C-801~C-810)
19. **LLM 모델 선택 및 비용 모니터링** (C-808~C-810)
20. **출력** (C-901~C-905)
21. **모달**: M-701~M-707, M-801~M-804 (LLM 비용 경고 M-707 포함)

## Phase 7: 관리 기능 (확장)

22. **사용자 및 시스템 관리** (C-1001~C-1006)
23. **약품명 DB 및 배포 모드** (C-1007~C-1009, 이미 Phase 2에서 구현)
24. **모달**: M-901~M-906 (프로덕션 모드 경고 M-906 포함)

---

# 8. 기술 스택별 컴포넌트 분류

## React 컴포넌트 (TypeScript)

- **전체**: 약 100+ 개 컴포넌트
- **페이지**: 20개
- **공통 컴포넌트**: 50개
- **단계별 전용**: 40개

## shadcn/ui 기반 (Radix UI)

- Button, Input, Select, Table, Card, Dialog, Toast 등
- 총 15개 기본 UI 컴포넌트

## 모달/팝업

- **총 36개** 모달/다이얼로그
- 단계별 평균 4-6개

## 토스트 알림

- **성공**: 13개
- **경고**: 6개
- **에러**: 7개
- **정보**: 5개

---

# 9. 반응형 디자인

모든 컴포넌트는 다음 브레이크포인트를 지원해야 합니다:

- **Mobile**: < 640px
- **Tablet**: 640px ~ 1024px
- **Desktop**: ≥ 1024px

주요 반응형 처리:

- **모바일**: 사이드바 햄버거 메뉴, 단일 컬럼 레이아웃
- **태블릿**: 축소 사이드바, 2컬럼 레이아웃
- **데스크톱**: 전체 사이드바, 멀티 컬럼 레이아웃

---

# 10. 접근성 (Accessibility)

모든 컴포넌트는 WCAG 2.1 AA 수준을 준수해야 합니다:

- **키보드 네비게이션**: Tab, Enter, Esc 지원
- **스크린 리더**: aria-label, aria-describedby 속성
- **색상 대비**: 4.5:1 이상
- **포커스 인디케이터**: 명확한 포커스 표시

---

**문서 끝**
