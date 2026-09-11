# Twynity Reimagined: Refactoring & Design Alignment Plan

This document tracks our progress in converting the designer's HTML/CSS application (from `main`) into a React + Next.js + Tailwind CSS application (on `refactor`) with 100% design fidelity. 

---

## 1. Branch Replacement Strategy (Post-Refactor)
Once all pages are verified as 100% aligned with the design styling, animations, and assets, we will execute the following branch management commands:
```bash
# 1. Switch away from main if we are on it
git checkout refactor

# 2. Force delete the local main branch
git branch -D main

# 3. Create a fresh main branch pointing to refactor's HEAD
git checkout -b main

# 4. Force push the new main branch to remote (replacing the old HTML/CSS main)
git push origin main --force

# 5. Create a new design branch off main for future Next.js-based design edits
git checkout -b design
git push origin design
```

---

## 2. Page Conversion & Styling Alignment Checklist

Below is the list of all pages synced from the designer's HTML/CSS (`design/` folder) and their corresponding Next.js routes under `src/app/`.

### Core Pages

| Designer File | Next.js Page Route | Status | Notes / Checklist |
| :--- | :--- | :---: | :--- |
| index.html | src/app/(marketing)/page.tsx | ✅ Tailwind Refactored | Verified animations, layout, hero text transitions |
| demand.html | src/app/(marketing)/demand/page.tsx | ✅ Tailwind Refactored | Verified split layout and page content |
| `activity-demand.html` | `src/app/activity/page.tsx` | ✅ Checked | Verified layout, timeline styling, and alerts |
| `earnings.html` | `src/app/earnings/page.tsx` | ✅ Checked | Verified chart components, lists, summary cards |
| `engagements.html` | `src/app/engagements/page.tsx` | ✅ Checked | Verified tables, status badges, active engagements list |
| `hire.html` | `src/app/hire/page.tsx` | ✅ Tailwind Refactored | Multi-step setup page; dynamic typewriter and guide speech, full matches sync |
| `marketplace-demand.html` | `src/app/marketplace/demand/page.tsx` | ⏳ Pending Diff | Grid cards, filters, and demand stats |
| `marketplace.html` | `src/app/marketplace/page.tsx` | ⏳ Pending Diff | Twin cards layout, inspect drawer/modal, hover cards |
| `messages-demand.html` | `src/app/messages/demand/page.tsx` | ⏳ Pending Diff | Chat bubbles, typing indicator, side list |
| `messages.html` | `src/app/messages/page.tsx` | ⏳ Pending Diff | Chat windows, text area styling, avatar badges |
| `my-twins.html` / `my-twyns.html` | `src/app/twyns/page.tsx` | ⏳ Pending Diff | Twyns list, status dashboard, active/paused toggles |
| `onboarding.html` | `src/app/onboarding/page.tsx` | ⏳ Pending Diff | Onboarding progress bar, onboarding guides |
| `orchestration.html` | `src/app/orchestration/page.tsx` | ⏳ Pending Diff | Node graph layout, drag-and-drop elements, log window |
| `shortlists.html` | `src/app/shortlists/page.tsx` | ⏳ Pending Diff | Candidate lists, rating badges, profiles |
| `spend.html` | `src/app/spend/page.tsx` | ⏳ Pending Diff | Progress bars, invoice table, download interactions |
| `talk-sara.html` | `src/app/twyns/[id]/talk/page.tsx` | ✅ Tailwind Refactored | Live call mockup layout, audio/video toggles, subtitles |
| `workflow-studio.html` | `src/app/workflow-studio/page.tsx` | ⏳ Pending Diff | Advanced flow diagram editor, sidebar tooltips |
| `workforce.html` | `src/app/workforce/page.tsx` | ⏳ Pending Diff | Combined list of all active employee twyns |
| `404.html` | `src/app/not-found.tsx` | ⏳ Pending Diff | Page custom styles, illustration asset |

---

## 3. Verification & Quality Plan
To ensure absolute styling fidelity:
1. **Design Token Sync:** We run `./scripts/sync-design.sh` to extract the updated CSS variables into `src/styles/tokens.css`.
2. **Page Inspections:** Run Next.js server (`npm run dev`) and inspect each page side-by-side with the HTML files (either by opening them in a browser or inspecting the static files).
3. **Animations check:** Ensure micro-animations, loading states, and custom transitions match the designer's HTML implementation exactly.
