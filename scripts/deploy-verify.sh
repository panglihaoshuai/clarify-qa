#!/usr/bin/env bash
# Deploy → Wait → E2E Verify loop
# Usage: ./scripts/deploy-verify.sh [--skip-deploy] [--url <url>]

set -e

APP_URL="${APP_URL:-https://clarify-qa-production.up.railway.app}"
SKIP_DEPLOY=false
MAX_RETRIES=3

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --skip-deploy) SKIP_DEPLOY=true ;;
    --url) APP_URL="$2"; shift ;;
    *) echo "Unknown flag: $1"; exit 1 ;;
  esac
  shift
done

echo "🚀 Clarify Q&A Deploy & Verify"
echo "   App URL: $APP_URL"
echo ""

# Step 1: Deploy (push to Railway via railway up, or just push to GitHub)
if [ "$SKIP_DEPLOY" = false ]; then
  echo "📦 Deploying to Railway..."
  if command -v railway &> /dev/null; then
    railway up --service clarify-qa
    echo "✓ Deployed via Railway CLI"
  else
    echo "⚠ Railway CLI not found. Push to GitHub to trigger auto-deploy."
    git push origin main
    echo "✓ Pushed to GitHub, Railway will auto-deploy"
  fi

  # Wait for deployment
  echo ""
  echo "⏳ Waiting for deployment (up to 3 minutes)..."
  for i in $(seq 1 18); do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL" 2>/dev/null || echo "000")
    printf "\r   Attempt %d/18: HTTP %s" "$i" "$STATUS"
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "302" ]; then
      echo ""
      echo "✓ App is responding"
      break
    fi
    sleep 10
  done
  echo ""
fi

# Step 2: Install Playwright if needed
if ! npx playwright --version &>/dev/null 2>&1; then
  echo "📦 Installing Playwright..."
  npm ci
  npx playwright install chromium
fi

# Step 3: Run E2E tests
echo "🧪 Running E2E tests against $APP_URL..."
echo ""

ATTEMPT=1
while [ $ATTEMPT -le $MAX_RETRIES ]; do
  echo "--- Test run $ATTEMPT/$MAX_RETRIES ---"

  if BASE_URL="$APP_URL" npx playwright test --reporter=list; then
    echo ""
    echo "✅ All E2E tests passed! App is healthy."
    exit 0
  else
    echo ""
    echo "❌ Tests failed on attempt $ATTEMPT."

    if [ $ATTEMPT -lt $MAX_RETRIES ]; then
      echo ""
      echo "📋 Fetching Railway logs for diagnosis..."
      railway logs --service clarify-qa 2>/dev/null | tail -50 || true

      echo ""
      echo "🔍 Check playwright-report/ for screenshots and traces."
      echo "   Fix the issues above, then this script will retry in 30 seconds..."
      sleep 30
      ATTEMPT=$((ATTEMPT + 1))
    else
      echo ""
      echo "📋 Final Railway deploy logs:"
      railway logs --service clarify-qa 2>/dev/null | tail -100 || true
      echo ""
      echo "🔍 Playwright report saved to playwright-report/"
      echo "   Run: npx playwright show-report"
      exit 1
    fi
  fi
done
