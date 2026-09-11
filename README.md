# Twynity — demo build

**The whole app, not a rebuild.** This is the product from `demo/canvas-apps`,
duplicated with every route intact — the studio, my-twyns, teams, workflows,
workshop, marketplace, plans, the lot. Nothing was reproduced by hand.

Two things differ from the product:

1. **The sidebar is inert.** Every rail item, the logo and the usage card's
   top-up link render as plain elements instead of links, so a client
   walkthrough can't wander out of the studio into a half-finished page. The
   pages still exist and are still reachable by typing a URL.
2. **It builds as a static export** — no server, no API routes.

## Start here

```
/talk/sara/?start=chat
```

## Run it

```bash
npm install
npm run dev
```

## The Canvas apps

| Say / do | What happens |
| --- | --- |
| `show me the pipeline` | The board — Called → Meeting → Demo → Contract → Closed won → Onboarded |
| *drag a card* | Moves the deal, logs it, resets the quiet clock, the twyn says so |
| *click a card* | That deal's record — the account and everything that's happened |
| `log a call` | Captures a lead from the conversation onto the board |
| `show me the jobs` | **The same board block**, pointed at this week's work |
| ↺ in the Canvas header | Resets, so the script survives being run twice |

Bob's Plumbing opens flagged at nine days quiet. Move it and "Chase Bob's"
removes itself, because that action is conditional on something being stale.

The jobs board is the same `board` block as the pipeline with three values
changed — no new component, which is the point:

```ts
{ type: "board",
  data:    "$.jobs",        // was "$.deals"
  groupBy: "state",         // was "stage"
  rankBy:  { field: "value" } }
```

## What static export required

All mechanical, none of it touching how anything looks or behaves:

- `generateStaticParams()` on the six dynamic routes
- `?start=` and `?public=` move from the server to the client, since a static
  build has no request to read them from
- the changelog RSS route pinned to `force-static`
- the OAuth page split into a server wrapper and its client screen

## Deploying

```bash
sh scripts/deploy.sh
```
