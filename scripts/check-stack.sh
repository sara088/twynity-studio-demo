#!/bin/sh
#
# Stack-compliance check — fails if old-prototype (vanilla HTML/CSS/jQuery)
# patterns leak into the Next 16 + Tailwind v4 + shadcn codebase.
#
# Reading the prototype's CSS to extract design VALUES is fine; copying its
# CODE is not. This guards the boundary. Run: sh scripts/check-stack.sh
#
# What it flags in src/app + src/features (.ts/.tsx):
#   1. Hard-coded hex colors        -> use design tokens (globals.css @theme)
#   2. <style> blocks in components  -> CSS belongs in globals.css
#   3. raw rgba()/hsl() color fills  -> use tokens / Tailwind utilities
#   4. jQuery / direct-DOM CSS hacks -> use React + Tailwind
#
# Allowed exception: multi-color brand logos via SVG `fill="#..."` (e.g. Google).

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# Quote paths — the repo may live under a directory with spaces (e.g.
# "Claude Projects"). Unquoted word-splitting here silently fed grep bogus
# paths, making every check a false pass. Always quote "$APP" "$FEAT".
APP="$ROOT/src/app"
FEAT="$ROOT/src/features"
fail=0

# 1. Hard-coded hex in JSX (exclude SVG brand-logo fill/stop-color attributes)
hex=$(grep -rnE "#[0-9a-fA-F]{6}\b" "$APP" "$FEAT" --include=*.tsx --include=*.ts 2>/dev/null \
  | grep -vE 'fill="#|stop-color="#|stopColor="#' || true)
if [ -n "$hex" ]; then
  echo "✗ Hard-coded hex colors (use tokens):"; echo "$hex"; fail=1
fi

# 2. <style> blocks inside components (CSS belongs in globals.css)
sty=$(grep -rnE "<style" "$APP" "$FEAT" --include=*.tsx 2>/dev/null || true)
if [ -n "$sty" ]; then
  echo "✗ <style> block in a component (move to globals.css):"; echo "$sty"; fail=1
fi

# 3. raw rgba()/hsl() used as a COLOR fill in inline styles (shadows are ok)
col=$(grep -rnE "(background|color|borderColor|fill):[^;\"]*(rgba|hsl)\(" "$APP" "$FEAT" --include=*.tsx 2>/dev/null \
  | grep -vE "var\(--" || true)
if [ -n "$col" ]; then
  echo "✗ raw rgba()/hsl() color fill (use tokens):"; echo "$col"; fail=1
fi

# 4. jQuery / direct stylesheet manipulation
dom=$(grep -rnE "\\\$\(|jquery|document\.write|\.style\.cssText|insertRule" "$APP" "$FEAT" --include=*.tsx --include=*.ts 2>/dev/null || true)
if [ -n "$dom" ]; then
  echo "✗ jQuery / direct-DOM CSS manipulation (use React + Tailwind):"; echo "$dom"; fail=1
fi

if [ "$fail" -eq 0 ]; then
  echo "✓ stack-compliance: clean (no old-stack patterns in src/app + src/features)"
fi
exit $fail
