#!/bin/bash

# Integration Verification Script for KPSUR AGENT v1.0
# This script verifies that all modules are properly integrated

echo "========================================="
echo "KPSUR AGENT v1.0 - Integration Verification"
echo "========================================="
echo ""

ERRORS=0
WARNINGS=0

# Check JavaScript modules
echo "📦 Checking JavaScript Modules..."
MODULES=(
    "js/config.js"
    "js/supabase-client.js"
    "js/llm-client.js"
    "js/auth.js"
    "js/file-handler.js"
    "js/markdown-converter.js"
    "js/data-extractor.js"
    "js/template-writer.js"
    "js/review-manager.js"
    "js/qc-validator.js"
    "js/output-generator.js"
)

for module in "${MODULES[@]}"; do
    if [ -f "$module" ]; then
        echo "  ✅ $module"
    else
        echo "  ❌ $module - MISSING"
        ((ERRORS++))
    fi
done
echo ""

# Check UI pages
echo "📄 Checking UI Pages..."
PAGES=(
    "pages/P01_Login.html"
    "pages/P14_FileUpload.html"
    "pages/P15_MarkdownConversion.html"
    "pages/P16_DataExtraction.html"
    "pages/P17_TemplateWriting.html"
    "pages/P18_Review.html"
    "pages/P19_QC.html"
    "pages/P20_Output.html"
)

for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        # Check if page uses ES6 modules
        if grep -q 'type="module"' "$page"; then
            echo "  ✅ $page (ES6 module)"
        else
            echo "  ⚠️  $page (no ES6 module)"
            ((WARNINGS++))
        fi
    else
        echo "  ❌ $page - MISSING"
        ((ERRORS++))
    fi
done
echo ""

# Check module imports in each page
echo "🔗 Checking Module Imports..."

echo "  P14_FileUpload.html:"
if grep -q "import.*file-handler" pages/P14_FileUpload.html; then
    echo "    ✅ file-handler.js"
else
    echo "    ❌ file-handler.js - MISSING IMPORT"
    ((ERRORS++))
fi

echo "  P15_MarkdownConversion.html:"
if grep -q "import.*markdown-converter" pages/P15_MarkdownConversion.html; then
    echo "    ✅ markdown-converter.js"
else
    echo "    ❌ markdown-converter.js - MISSING IMPORT"
    ((ERRORS++))
fi

echo "  P16_DataExtraction.html:"
if grep -q "import.*data-extractor" pages/P16_DataExtraction.html; then
    echo "    ✅ data-extractor.js"
else
    echo "    ❌ data-extractor.js - MISSING IMPORT"
    ((ERRORS++))
fi

echo "  P17_TemplateWriting.html:"
if grep -q "import.*template-writer" pages/P17_TemplateWriting.html; then
    echo "    ✅ template-writer.js"
else
    echo "    ❌ template-writer.js - MISSING IMPORT"
    ((ERRORS++))
fi

echo "  P18_Review.html:"
if grep -q "import.*review-manager" pages/P18_Review.html; then
    echo "    ✅ review-manager.js"
else
    echo "    ❌ review-manager.js - MISSING IMPORT"
    ((ERRORS++))
fi

echo "  P19_QC.html:"
if grep -q "import.*qc-validator" pages/P19_QC.html; then
    echo "    ✅ qc-validator.js"
else
    echo "    ❌ qc-validator.js - MISSING IMPORT"
    ((ERRORS++))
fi

echo "  P20_Output.html:"
if grep -q "import.*output-generator" pages/P20_Output.html; then
    echo "    ✅ output-generator.js"
else
    echo "    ❌ output-generator.js - MISSING IMPORT"
    ((ERRORS++))
fi

echo ""

# Check documentation
echo "📚 Checking Documentation..."
DOCS=(
    "README.md"
    "DEVELOPMENT.md"
    "TESTING.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "  ✅ $doc"
    else
        echo "  ⚠️  $doc - MISSING"
        ((WARNINGS++))
    fi
done
echo ""

# Summary
echo "========================================="
echo "Verification Summary"
echo "========================================="
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ All critical checks passed!"
    exit 0
else
    echo "❌ $ERRORS error(s) found. Please fix before deployment."
    exit 1
fi
