#!/bin/sh
# Build and publish to GitHub Pages.
set -e

REPO="twynity-studio-demo"
OWNER="sara088"

echo "→ building with BASE_PATH=/$REPO"
BASE_PATH="/$REPO" npm run build >/dev/null

# Without this, Jekyll drops Next's _next/ directory and the page loads blank.
touch out/.nojekyll

# Assets are referenced as absolute paths ("/assets/avatar.mp4"), and next/image
# doesn't prefix those when images are unoptimized. Rewriting ~50 references in
# source would drift this copy from the product, so it happens here instead —
# against the built output, where a deployment concern belongs.
echo "→ prefixing asset paths for /$REPO"
find out -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' -o -name '*.txt' \) -print0 \
  | xargs -0 sed -i '' \
      -e "s|\"/assets/|\"/$REPO/assets/|g" \
      -e "s|\"/hero1.png\"|\"/$REPO/hero1.png\"|g"

echo "→ publishing to gh-pages"
cd out
rm -rf .git
git init -q
git checkout -qb gh-pages
git add -A
git -c user.email="deploy@local" -c user.name="deploy" \
    commit -q -m "Deploy $(date -u '+%Y-%m-%d %H:%M UTC')"
git push -q -f "https://github.com/$OWNER/$REPO.git" gh-pages
cd ..

gh api -X POST "repos/$OWNER/$REPO/pages/builds" --jq '.status' >/dev/null 2>&1 || true
echo "→ https://$OWNER.github.io/$REPO/talk/sara/?start=chat"
