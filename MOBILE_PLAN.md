# Mobile Optimization — Plan & Rules

> **Status:** ✅ Largely implemented (verified by mobile audit at 360/390/414).
> Decisions resolved: **app nav = bottom tab bar** (`SupplyBottomNav`, shown < `lg`),
> marketing = hamburger sheet. Phases 0–3 are in place; what remains is QA polish only.
> **Scope note:** This is a *local-only* working doc — not committed or pushed to `design`.
> Descoped pages (do **not** build/audit): earnings, engagements, messages.
>
> **Audit (390px, 2026-06-17) — no horizontal overflow on any route:**
> landing (hamburger), onboarding (stacked), my-twyns, account, workshop, marketplace
> (rails + bottom-sheet purchase), top-up, studio /talk (chat stacks, equip → full-screen),
> edit `BrowseDrawer` (two-pane → single catalog). Modals render as bottom sheets < md.
> Remaining: minor QA only (e.g. the dev-tools "N" badge overlaps the drawer "Done" button —
> not our UI).

---

## 1. Current state (baseline found on audit)

- **App nav is desktop-only.** `src/features/shared/components/SupplySidebar.tsx` is a 64px
  icon rail that **expands on hover** to reveal labels + usage card + settings/help. Touch has no
  hover, so on mobile you get an unlabeled rail you can't expand, and the bottom section
  (account/usage/settings) is **unreachable**.
- **Marketing nav silently disappears.** `src/features/landing/components/MarketingTopbar.tsx`
  nav links are `hidden md:flex` with **no hamburger** — below 768px "How it works / Marketplace /
  For Orgs" just vanish.
- **Almost no responsive code.** ~71 breakpoint utilities in the whole app. Zero in: `my-twyns`,
  `talk` (studio), `notifications`, `top-up`. Shell content padding is a flat `px-7`.
- **Dialogs are fixed-width desktop modals** (420–680px). The equip drawer
  (`src/features/edit-twyn/components/BrowseDrawer.tsx`) is a `96vw × 90vh` **two-pane** layout —
  none reflow to a phone.
- **Shell:** `SupplyShell.tsx` = `SupplySidebar` + reserved 64px + `Topbar` + scroll area (`px-7`).

Because there's so little responsive code, we set rules first and apply cleanly (no hacks to unwind).

---

## 2. Mobile Rules (→ becomes `MOBILE.md` once decisions are locked)

**1. Strategy & breakpoints** — mobile-first, Tailwind defaults.
- Base styles = mobile; layer up with `sm:`(640) `md:`(768) `lg:`(1024).
- **`lg` (1024) = desktop line** — sidebar + multi-pane layouts appear here. Below `lg` = touch
  treatment (tablets in portrait share the broken hover-sidebar, so they get mobile nav too).
- **`md` (768) = grid-density line** (1-col → 2-col).
- Test matrix: **360 / 390 / 414** (phones), **768** (tablet).

**2. Layout & safe areas**
- Page padding `px-4` mobile → `px-7 lg:`. Respect notches with `env(safe-area-inset-*)` on fixed bars.
- One content column on mobile; centered `max-w` containers go full-width with side padding.

**3. Grid** — `src/lib/grid.ts` `CARD_GRID` already collapses via `auto-fill minmax()`. Lower the min
(256 → ~160–170px) so phones get 1–2 up, tablets 2–3, desktop 4. Keep one shared constant.

**4. Type scale** — cap big headings with `clamp()` (already in Hero/demo). Body min **15–16px**
(never < 14 for content). Convert large fixed sizes (`text-[32px]`, `text-[44px]`) to clamp so they
don't blow out 360px.

**5. Spacing** — stay on the 4px scale. Tighter section rhythm on mobile (`py-12` → `py-[100px] lg:`),
smaller card padding on mobile.

**6. Touch targets** — min **44×44px** hit area for every tap target (icons, chips, close buttons).

**7. Navigation**
- **App (signed-in): bottom tab bar** below `lg` — 4–5 thumb-reachable destinations
  (My Twyns · Workshop · Marketplace · Account). Slim top bar keeps search/notifications.
  Sidebar returns at `lg+`.
- **Marketing: hamburger → slide-down sheet** with nav links + Sign in / Join Waitlist.

**8. Popups → bottom sheets** — below `md`, `Dialog`s render as **full-width bottom sheets** (slide
up, rounded top, drag handle). The two-pane equip drawer → **full-screen with the loadout collapsed
behind a toggle**.

**9. Wide content → stacked** — side-by-side label/value or tables collapse to stacked rows (pattern
already used in the Workshop asset detail modal `MetaField`).

---

## 3. Execution plan (phased)

- **Phase 0 — Foundations:** write `MOBILE.md`; add primitives — responsive `Sheet` wrapper
  (dialog → bottom-sheet `< md`), `BottomNav` component, mobile top bar, viewport/safe-area setup,
  container padding rule. Scaffolding only; nothing ships broken.
- **Phase 1 — Navigation:** app bottom-nav + slim mobile topbar; marketing hamburger sheet.
  *(Highest impact — makes the app usable on a phone.)*
- **Phase 2 — Popups:** route all `Dialog`s through the responsive Sheet; rework equip drawer +
  purchase/share/detail modals.
- **Phase 3 — Pages (easy → hard):** simple first (my-twyns, workshop, marketplace catalogs,
  notifications, account, top-up, demo, login, landing), then the hard ones (studio `/talk` —
  video+chat+equip → tabbed/stacked; onboarding split-panel).
- **Phase 4 — QA sweep** at 360/390/414/768; fix overflow + tap-target issues.

---

## 4. Open decisions (settle before building)

1. **App mobile nav pattern** — *Recommended: bottom tab bar* (modern app standard, thumb-reachable,
   always visible) over a hamburger drawer (hides everything behind one tap).
2. **Scope/order** — *Recommended: core funnel first* (landing → demo → onboarding → login →
   my-twyns → studio), secondary pages after — so the most-seen screens are solid first. Alternative:
   end-to-end on everything.

---

## 5. Route inventory (what needs doing)

Marketing chrome: `/` (landing), `/demo`, `/login`, `/marketplace?public`
App shell (`SupplyShell`): `/my-twyns`, `/my-twyns/[id]` (edit/equip drawer), `/assets` (Workshop),
`/marketplace`, `/marketplace/[category]`, `/account`, `/top-up`, `/notifications`, `/talk/[id]` (studio)
Flow: `/onboarding`

**Hardest:** `/talk/[id]` studio (video + chat + equip panel) and the equip `BrowseDrawer` (two-pane).

---

## Pick up here
Start with **Phase 0 + `MOBILE.md`**, then Phase 1 (nav). Confirm the two decisions in §4 first.
