-- Add test report to reports table
-- Run this in Supabase SQL Editor

-- Insert test report
INSERT INTO public.reports (
    report_name,
    product_id,
    created_by,
    status,
    current_stage,
    user_inputs,
    qc_model,
    qc_precision_mode
) VALUES (
    '코미나티주_PSUR_2024Q4_테스트',
    'f8732d49-e534-49d4-b764-c397d4196dcd',  -- 코미나티주 product_id
    '86d92a61-ed50-4c4a-b041-23eff42b313f',  -- Master Admin user_id
    'Draft',
    2,
    '{
        "CS0_성분명": "토지나메란",
        "CS1_브랜드명": "코미나티주",
        "CS2_회사명": "한국화이자제약",
        "CS3_보고시작날짜": "2021-03-05",
        "CS4_보고종료날짜": "2026-03-04",
        "CS5_국내허가일자": "2021-03-05",
        "CS6_보고서제출일": "2026-01-01",
        "CS7_버전넘버": "1.0",
        "CS13_유효기간": "24개월",
        "CS15_효능효과": "16세 이상에서 코로나19 예방",
        "CS16_용법용량": "0.3mL를 3주 간격으로 2회 근육주사",
        "CS24_보고주기": "5년"
    }'::jsonb,
    'gemini-3-flash-preview',
    true
)
ON CONFLICT (report_name) DO UPDATE SET
    status = EXCLUDED.status,
    current_stage = EXCLUDED.current_stage,
    user_inputs = EXCLUDED.user_inputs,
    updated_at = now();

-- Verify insertion
SELECT id, report_name, status, current_stage, created_at
FROM public.reports
WHERE report_name = '코미나티주_PSUR_2024Q4_테스트';
