#!/bin/bash
# Port Said Prime Shoes — local setup script
# Usage: bash setup.sh

set -e

echo "================================================"
echo " Port Said Prime Shoes — Local Setup"
echo "================================================"

# 1. Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js غير مثبّت. حمّله من https://nodejs.org ثم أعد المحاولة."
  exit 1
fi
echo "✓ Node.js: $(node -v)"

# 2. Check .env is filled in
if grep -q "your-project" .env 2>/dev/null || ! grep -q "VITE_SUPABASE_URL=https://" .env 2>/dev/null; then
  echo ""
  echo "⚠️  ملف .env لسه مش متعبّى ببيانات Supabase بتاعتك."
  echo "   افتح ملف .env وحدّث القيمتين دول قبل ما تكمل:"
  echo "   VITE_SUPABASE_URL=..."
  echo "   VITE_SUPABASE_ANON_KEY=..."
  echo ""
  read -p "اضغط Enter لو خلصت تحديث .env، أو Ctrl+C للخروج وتعديله الأول: "
fi

# 3. Install dependencies
echo ""
echo "📦 جارٍ تثبيت الحزم (npm install)..."
npm install

# 4. Reminder about database setup
echo ""
echo "================================================"
echo "✓ التثبيت خلص."
echo ""
echo "⚠️  لو لسه ما طبّقتش قاعدة البيانات على Supabase:"
echo "   روح لوحة Supabase → SQL Editor → افتح ملف"
echo "   clarks-port-said-database-setup.sql → نسخ ولصق → Run"
echo "================================================"
echo ""

# 5. Start dev server
echo "🚀 جارٍ تشغيل المشروع..."
npm run dev
