# MCP App Component Kit

The building blocks every MCP app renders into inside Twynity Studio. All
components are themed with the Studio design tokens (`src/app/globals.css`), so
an app composed from the kit automatically matches Studio across the **inline
card** (in the chat thread) and the **Canvas** (expanded workspace view).

This is the coded counterpart to the **MCP App Design Guide**
(`Twynity_Studio_MCP_App_Design_Guide.pdf`). The living reference that exercises
every component is the **`/mcp-guide`** route (`src/app/mcp-guide/page.tsx`).

## Install / import

```tsx
import {
  AppCard, AppHeader, AppHeaderAction, AppBody, AppFooter,
  Action, SectionLabel, Chip,
  DataTable, BarChart, List, KeyValue, FileList, Media, MapBlock,
  Form, Field, Input, Select,
  StateRunning, StateLoading, StateEmpty, StateError, StatePermission,
} from "@/components/mcp-kit";
```

## The frame

`AppCard` is the one component, two layouts:

```tsx
<AppCard mode="inline">          {/* compact, in-thread */}
  <AppHeader icon={<BarChart3 size={15} />} title="Market Pulse" />
  <AppBody>…</AppBody>
  <AppFooter>
    <Action>Export</Action>
    <Action variant="primary">Open in Canvas</Action>   {/* ≤ 2 primary actions */}
  </AppFooter>
</AppCard>

<AppCard mode="canvas">          {/* roomy, beside chat */}
  <AppHeader
    title="Market Pulse"
    actions={<><AppHeaderAction>…</AppHeaderAction></>}
  />
  <AppBody>…</AppBody>
</AppCard>
```

## Component kit

| Component   | Use for                                            |
| ----------- | -------------------------------------------------- |
| `DataTable` | tabular data (first column = row label, numeric cols use tabular-nums) |
| `BarChart`  | compare a few values; set `highlight` on the focus bar |
| `List`      | a few results — icon + title/meta + trailing slot  |
| `KeyValue`  | a summary of labelled facts                        |
| `FileList`  | files / attachments                                |
| `Media`     | image or video block (always pass `alt`)           |
| `MapBlock`  | location results (percent-based pins)              |
| `Form` + `Field`/`Input`/`Select` | the "needs input" path     |

## Required states

Every app should define all five. Action-bearing states take an `action` slot
(an `<Action/>` or link) rather than a callback, so they stay server-renderable:

```tsx
<StateRunning label="Querying sources…" log={[
  { text: "fetched 3 sources", done: true },
  { text: "ranking…" },
]} />
<StateLoading lines={4} />
<StateEmpty title="No competitors yet" action={<Action size="sm" variant="primary">Add one</Action>} />
<StateError title="Couldn't reach a source" action={<Action size="sm">Retry</Action>} />
<StatePermission title="Connect your CRM" description="Read-only access to contacts." action={<Action variant="primary" size="sm">Allow</Action>} />
```

## Rules (from the guide)

- **Inherit, don't reskin** — take Studio's tokens; don't redefine colors/fonts.
- **One brand accent** — `variant="primary"` (filled violet) on a single primary
  action; at most two primary actions per card.
- **Inline stays glanceable** — no internal scroll, no nested tabs/drill-ins;
  expand into the Canvas for depth.
- **Numbers use `font-sans` (DM Sans) + tabular-nums**, never the heading font.
- **Accessible** — AA contrast, keyboard reachable, `alt` text on media.
