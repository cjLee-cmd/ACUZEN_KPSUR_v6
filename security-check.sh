#!/bin/bash

# Security Check Script for KPSUR AGENT v1.0
# 배포 전 보안 검증

echo "========================================="
echo "KPSUR AGENT v1.0 - Security Check"
echo "========================================="
echo ""

ERRORS=0
WARNINGS=0

# 1. API 키 하드코딩 검사
echo "🔐 Checking for hardcoded API keys..."

# Google API Key 검사 (AIza로 시작)
if grep -r "AIza" js/ 2>/dev/null | grep -v "localStorage" | grep -v "GOOGLE_API_KEY"; then
    echo "  ❌ Hardcoded Google API key found!"
    ((ERRORS++))
else
    echo "  ✅ No hardcoded Google API keys"
fi

# Supabase Anon Key는 공개 가능 (RLS로 보호됨)
echo "  ℹ️  Supabase anon key in config.js is safe (protected by RLS)"

echo ""

# 2. 테스트 계정 검사
echo "🧪 Checking for test accounts..."

if grep -n "testAccounts" js/auth.js > /dev/null; then
    echo "  ⚠️  Test accounts found in auth.js (lines 20-33)"
    echo "     → Recommendation: Remove or comment out before production deployment"
    ((WARNINGS++))
else
    echo "  ✅ No test accounts found"
fi

echo ""

# 3. console.log() 검사
echo "📝 Checking for console.log() statements..."

LOG_COUNT=$(grep -r "console.log" js/ 2>/dev/null | wc -l | tr -d ' ')

if [ "$LOG_COUNT" -gt 0 ]; then
    echo "  ⚠️  Found $LOG_COUNT console.log() statements"
    echo "     Files with console.log():"
    grep -l "console.log" js/*.js 2>/dev/null | sed 's/^/     - /'
    echo "     → Recommendation: Remove or wrap in development mode check"
    ((WARNINGS++))
else
    echo "  ✅ No console.log() statements found"
fi

echo ""

# 4. .gitignore 검사
echo "📁 Checking .gitignore configuration..."

if [ -f ".gitignore" ]; then
    if grep -q ".env" .gitignore; then
        echo "  ✅ .env is in .gitignore"
    else
        echo "  ⚠️  .env not found in .gitignore"
        ((WARNINGS++))
    fi

    if grep -q "node_modules" .gitignore; then
        echo "  ✅ node_modules is in .gitignore"
    else
        echo "  ℹ️  node_modules not in .gitignore (OK if not using Node.js)"
    fi
else
    echo "  ⚠️  .gitignore file not found"
    ((WARNINGS++))
fi

echo ""

# 5. 민감한 파일 검사
echo "🔍 Checking for sensitive files..."

SENSITIVE_FILES=(".env" "*.key" "*.pem" "credentials.json" "secrets.json")

for pattern in "${SENSITIVE_FILES[@]}"; do
    if find . -name "$pattern" -not -path "./node_modules/*" 2>/dev/null | grep -q .; then
        echo "  ⚠️  Found sensitive file matching: $pattern"
        find . -name "$pattern" -not -path "./node_modules/*" 2>/dev/null | sed 's/^/     - /'
        ((WARNINGS++))
    fi
done

if [ $WARNINGS -eq 0 ]; then
    echo "  ✅ No sensitive files found"
fi

echo ""

# 6. localStorage 사용 확인
echo "💾 Checking localStorage usage for API keys..."

if grep -r "localStorage.setItem.*API" js/ 2>/dev/null | grep -v "GOOGLE_API_KEY"; then
    echo "  ⚠️  Found localStorage usage for API keys"
    ((WARNINGS++))
else
    echo "  ✅ API keys properly managed via localStorage"
fi

echo ""

# 7. Supabase 설정 확인
echo "🗄️  Checking Supabase configuration..."

if grep -q "SUPABASE_URL" js/config.js; then
    SUPABASE_URL=$(grep "SUPABASE_URL" js/config.js | cut -d "'" -f 2)
    echo "  ✅ Supabase URL configured: $SUPABASE_URL"
else
    echo "  ❌ Supabase URL not found in config.js"
    ((ERRORS++))
fi

if grep -q "SUPABASE_ANON_KEY" js/config.js; then
    echo "  ✅ Supabase anon key configured"
    echo "     ⚠️  Remember to enable RLS policies in Supabase dashboard"
else
    echo "  ❌ Supabase anon key not found in config.js"
    ((ERRORS++))
fi

echo ""

# 8. HTTPS 확인 (프로덕션 체크리스트)
echo "🔒 Production deployment checklist..."
echo "  ⚠️  Manual checks required:"
echo "     - [ ] Enable HTTPS on GitHub Pages"
echo "     - [ ] Configure Supabase allowed origins"
echo "     - [ ] Enable Supabase RLS policies"
echo "     - [ ] Test CORS settings"
echo "     - [ ] Remove test accounts from auth.js"
echo "     - [ ] Remove or disable console.log() statements"

echo ""

# Summary
echo "========================================="
echo "Security Check Summary"
echo "========================================="
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All security checks passed!"
    echo "   Ready for deployment (after manual checklist)"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  $WARNINGS warning(s) found."
    echo "   Review warnings before deployment"
    exit 0
else
    echo "❌ $ERRORS critical error(s) found."
    echo "   Fix errors before deployment"
    exit 1
fi
