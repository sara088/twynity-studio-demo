# Twynity — Workflows & Teams
### Deep research + product brainstorm · v1 · July 2026

> **The bet, in one line:** the founder is right — the future isn't a folder of markdown "skills" (a prompt the LLM re-improvises every run). It's **deterministic, orchestrated workflows** where the *control flow is fixed and inspectable* and the LLM's judgment is quarantined to individual steps. LangGraph is the closest reference. This doc turns that thesis into a concrete Twynity plan for **Workflows (one twyn, intra-flows)** and **Teams (many twyns, inter-flows)**, built on primitives we already have.

---

## 0. Where Twynity already is (so we build, not restart)

The codebase is further along than it looks:

| Primitive we have | File | How Workflows/Teams reuse it |
|---|---|---|
| **Grayed "Workflows" card** ("Multi-step automations your twyn can run end-to-end · Coming soon") | `edit-twyn/components/EditTwynView.tsx:270` | This is the entry point — make it real. |
| **Tier entitlements** `workflows`, `teamSeats` (only `teams` tier = 3/3) | `shared/lib/tier.ts:20` | Gating + pricing already modeled. |
| **Workshop "equip" drawer** (drag free/built/purchased assets onto a twyn) | `talk/components/WorkshopPanel.tsx`, `talk/data/workshop.ts` | Proven composition UX → reuse for assembling workflow steps. |
| **Interconnectors** (Slack/Gmail/Figma/… via OAuth) | `marketplace/data/mock-data.ts:197`, `talk/data/connect.ts` | **The execution layer** — workflow steps call these. |
| **Marketplace w/ builder attribution + pricePerYear + verified** | `marketplace/types/index.ts`, `data/mock-data.ts` | Sell workflow templates the same way. |
| **Knowledge packs** (shared, versioned, indexed context) | `edit-twyn/data/loadout.ts:56` | Shared team memory. |
| **Community twyns w/ `worksWith` + `pairings`** ("Recommended team pairings") | `marketplace/components/TwynDetailModal.tsx` | Latent Teams concept — formalize it. |
| **Tool-execution log + artifacts + MCP-kit** (inline↔canvas) | `talk/types`, `components/mcp-kit/` | Render workflow runs and states natively. |

**Implication:** Workflows/Teams are mostly *new UI + an orchestration runtime over existing assets*, not a green field.

---

# PART A — WORKFLOWS (intra-twyn)

## A1. The core architecture: deterministic graph, LLM on a leash

A markdown skill = the LLM decides the sequence every run → unreproducible, untestable, unversionable. A **state-machine graph** flips it: *we* fix the topology; the LLM is demoted from orchestrator to **one node that makes a bounded decision**.

Borrow LangGraph's model as the **hidden runtime** (users never see "TypedDict"):
- **Nodes** = steps (a tool call, an LLM step, code, a human-approval).
- **Typed shared state** = the workflow's "memory" every step reads/writes.
- **Explicit edges** = fixed routing; **conditional edges** = a *finite* branch table (the LLM may supply the value the branch keys on — e.g. `sentiment=negative` — but never owns the flow).
- **Bounded loops** ("retry ≤ N", "for each item") — cycles are allowed but capped.
- **Sub-workflows** = a whole workflow callable as one step (the reuse unit → also the marketplace unit).

**Where the LLM still lives (the sweet spot):** inside a node (extract / classify / draft), as the value a branch routes on, or as a bounded tool-selector. *Never* as the owner of control flow — that's the "skill" anti-pattern we're rejecting.

Add two reliability ideas from **Temporal**:
- **Durable execution** — every completed step is checkpointed, so a workflow can pause for *days* (waiting on a human, a schedule, an external event) and resume **exactly-once without re-doing side effects**. Personal workflows *will* be long-running and interrupt-heavy — this is non-negotiable.
- **Step = orchestration; side effects live in "activities" with retries** — so a flaky Gmail call auto-retries without corrupting the run.

## A2. What a Twynity Workflow *is* (data model)

Extends our existing marketplace/provenance shape so it slots into Workshop + Marketplace for free:

```ts
interface Workflow {
  id: string;
  name: string;
  description: string;
  builder: string;                 // "@saragordic" — same attribution as skills
  provenance: "free" | "built" | "purchased";
  pricing?: WorkflowPricing;       // if listed (see Part B)
  trigger: WorkflowTrigger;        // manual (/), scheduled, or event
  inputs: InputSlot[];             // typed params → the template "signature"
  graph: { nodes: Node[]; edges: Edge[] };  // hidden runtime; users edit via the card UI
  verified: boolean;
  ownerTwynId?: string;            // which twyn runs it
}
interface InputSlot { key: string; label: string; type: "text"|"date"|"file"|"contact"|"connector"|"knowledge"; example?: string; }
type Node = ToolNode | TwynNode | BranchNode | LoopNode | ApprovalNode;
```

Steps reference **equipped interconnectors** (execution) and can invoke **the twyn itself** (`TwynNode` = an LLM step using the twyn's persona/knowledge). A `TwynNode` that hands to *another* twyn is the bridge to **Teams** (Part C).

## A3. How you **create** a workflow — 3 modes, capture-first

The mainstream unlock is **not** a blank node canvas. Rank the authoring modes:

1. **⭐ Capture — "show me once, save it as a workflow."** This is the differentiator, and it's exactly the **Codex Record & Replay** pattern (this is the real "Baby Cursor"). After a twyn completes a multi-tool flow in the Studio, offer one button: **"Save this as a workflow."** The twyn drafts: *name · when-to-use · inferred inputs · steps · success check*, then asks you to confirm/correct.
   - Because twyns act across **connected tools** (not files), capture **semantic intent per step** ("email the latest invoice to my accountant"), not literal payloads — so replay survives when an app's data/UI changes.
   - **Hardest problem = variable detection** (which literals are parameters vs constants). Don't guess silently — show a lightweight review: *"recipient = Sara → make this a fill-in?"*
   - Self-healing: if a deterministic step breaks on replay, fall back to a twyn (LLM) step for that node (browser-use `workflow-use` pattern).

2. **Conversational draft → visual refine.** Describe it in chat ("every Monday, pull last week's Stripe revenue, draft the board update, wait for my OK, then post to Slack") → twyn generates an **editable** workflow → you tweak. Mirror n8n's AI builder + Zapier Copilot (2025's winning move). Voice-dictation viable.

3. **From scratch / fork a template.** For power users and for remixing marketplace templates (Part B).

## A4. How you **initiate** a workflow

Use gestures users already know (zero teaching cost):
- **`/` in any twyn chat** → autocomplete menu of workflows (doubles as discovery). Arguments as typed slots (Raycast/Claude `argument-hint` style).
- **Natural language / implicit** — the twyn matches your request to a workflow's "when to use" description and runs it (with a confirm on side-effecting actions).
- **`@twyn`** — summon a specific twyn to run its workflow (sets up Teams).
- **Triggers & schedules** (distinct surface) — "every morning," "when a new email from X arrives." This is where a workflow graduates from a shortcut into an **automation** — and where cross-tool twyns are uniquely valuable.

## A5. The builder surface — structured card, not markdown, not spaghetti

Store the deterministic **spec** underneath; render a **structured card** over it (mainstream-legible, still inspectable/versioned):

```
┌ Weekly Board Update ───────────────────────────────┐
│ WHEN   Every Mon 8:00  ·  or  /board-update         │
│ INPUTS  ▸ week (date)   ▸ channel (connector: Slack) │
│ STEPS                                                │
│  1 ▸ Pull revenue        Stripe        [tool]        │
│  2 ▸ Draft the update    Virtual Sara  [twyn]        │
│  3 ▸ Wait for my OK      approval       [human] ⏸    │
│  4 ▸ Post to #board      Slack         [tool]        │
│  ↳ if rejected → back to step 2 (max 3×)             │
│ SUCCESS  message posted & reaction added             │
└─────────────────────────────────────────────────────┘
```

- Fields map 1:1 to Codex's four SKILL sections (usage / inputs / steps / verification) and to our runtime.
- Prefer a **mostly-linear list with visible branch/loop affordances** (Zapier legibility) over a full 2D graph — reveal graph complexity only when needed. A bare node canvas as the *only* entry point becomes spaghetti at scale (the universal complaint).
- **Progressive disclosure:** plain-English summary → "view steps" → raw spec for power users.
- Reuse the **mcp-kit** (`AppCard`, states, `DataTable`) to render runs; reuse Workshop chips for step assets.

## A6. States, guardrails, durability (reuse what exists)

- **Run states** already in the kit: `StateRunning` (live execution log — never a blank spinner), `StateLoading`, `StateEmpty`, `StateError`, `StatePermission`. A workflow run is a first-class artifact in the thread.
- **Human-in-the-loop** = durable interrupt: checkpoint → pause → notify the owner → resume on approval. Put side effects *after* the pause (or make idempotent) — LangGraph's re-run-from-node gotcha.
- **Guardrails:** bound every loop/fan-out; per-run cost/credit cap with auto-suspend (we already meter `creditsUsed`); confirm on high-stakes actions (send email / payment); show a **success check** and **lineage** ("this output came from these steps/inputs") so "why did my twyn do that?" is answerable — the thing a prompt-only skill can never provide.

## A7. Where it lives
The grayed **Workflows** card in `EditTwynView` becomes the manager (list/create/edit). Runs happen in the **Studio/Talk** thread. Invocation via `/` in chat. Scheduling via a new "Automations" sub-surface.

---

# PART B — SELLING WORKFLOWS (the marketplace)

## B1. Pricing menu (bias to usage + subscription)
Support four, reuse `builder`/`verified`/pricing fields we already have:
- **Free** — the funnel (see B2). Fully forkable.
- **One-time unlock** — simple outcome templates.
- **Subscription** (`pricePerYear`, our current model) — ongoing automations.
- **⭐ Per-run / usage-based** — the **ElevenLabs/Poe** pattern that scales best for consumers and aligns creator pay with *delivered outcomes* (the "outcome-based template" the founder wants).

## B2. The copy-protection answer (resolve the founder's tension correctly)
The founder's instinct — "free = visible & editable; paid = restrict editability" — needs one correction: **"paid = locked-but-editable code" is theater and *will* leak** (anything the buyer's runtime can read, the buyer can extract; n8n's downloadable JSON proves zero protection). The viable split is:

> **Free workflows = full source, forkable, remixable** (community, learning, acquisition). **Paid workflows = run-only, executed on Twynity's hosted runtime, source never rendered** — the buyer configures typed parameters but never sees the graph.

This is exactly how ElevenLabs (voice weights never leave the server), Poe (bot runs hosted), and the GPT Store protect assets. **Sell paid *capability*, not paid *code*.** The real moat is the **hosted runtime + payment rail + audience**, not secrecy.

## B3. Fork / remix (free tier = viral)
One-click **"clone into my Workshop"**, personal data/credentials stripped, **parameters surfaced as config fields** (which twyn, tone, connectors, knowledge pack). Table stakes across n8n/Make/HF; drives virality.

## B4. Creator payouts (don't repeat GPT Store)
- **Stripe Connect, paid in dollars, weekly, ~$10 threshold** (ElevenLabs mechanics). We already show `earningsMtd`.
- **Fully transparent formula** — GPT Store died on opaque, engagement-gated payouts. Show creators exactly what each run/subscription earns.
- **Creator-friendly take (~15–20%, not 30%)** — a generous split is a weapon against off-platform bypass.
- **Subscription bounty (Poe pattern):** reward a creator when their workflow converts a free user to paid → incentivizes *valuable*, not just high-volume, templates.

## B5. Discovery & trust
- **Quality gate before publish** (Zapier-style rejection for narrow/broken/duplicate) — avoid the GPT-Store spam flood. Economics are power-law, so **featuring + search + categories** matter more than catalog size.
- **Verified Creator** badge (we have `verified`), ratings, run-counts.
- **Ownership verification + moderation** at publish (ElevenLabs voice-captcha analog for twyns' faces/voices; one-click takedown) — protects identity, limits liability, guards the payout rail (heed Civitai's payment-processor risk).

---

# PART C — TEAMS (inter-twyn)

## C1. Two team modes (both are real product surfaces)
1. **Collaborative teams** — *my* twyn + *my colleague's* twyn co-working **across accounts**. Cross-owner, cross-boundary → needs **consent + an A2A-style protocol** because the twyns belong to different principals.
2. **Assembled teams** — a solo user **hires specialist twyns from the marketplace** (we already have community twyns with `worksWith`/`pairings`/`pricePerHour`). This is the **discovery/marketplace** topology — each twyn advertises a **capability card**.

## C2. Topologies to ship (3, not 5)
| Topology | Use for | Default? |
|---|---|---|
| **Sequential pipeline** | known processes ("research → draft → edit") | |
| **Supervisor → workers** (hierarchical) | dynamic inter-workflows | ⭐ default |
| **Peer group-chat** | brainstorm / debate | |

Keep **marketplace/bidding** as the *discovery* layer and **blackboard** as the hidden shared-state substrate — don't expose them as user modes.

**Whose twyn is the boss?** For cross-owner teams, prefer a **neutral orchestrator agent** (plans, delegates, validates — Magentic/Anthropic style) over "my twyn bosses your twyn." It's less political and gives one clean place to enforce budgets, consent, and termination.

## C3. Team data model (extends tier `teamSeats`)
```ts
interface Team {
  id: string; name: string; owner: string;   // userId
  members: TeamMember[];                       // real twyns (may be cross-owner)
  process: "pipeline" | "supervised" | "groupchat";
  lead: "owner-twyn" | "neutral-orchestrator" | { twynId: string };
  sharedKnowledge: string[];                   // knowledge-pack ids (team memory)
  goal: string;
}
interface TeamMember {
  twynId: string; ownerId: string;             // ownerId ≠ team.owner ⇒ cross-account
  role: string;                                // "Researcher" — persona already = role/goal/backstory
  permissions: { canSee: "outputs" | "shared" | "all"; consentedByOwner: boolean };
  earningsShare?: number;
}
```

## C4. How twyns delegate / hand off
- **Delegation = self-contained task briefs, not transcript dumps** (Anthropic's core fix): each twyn gets an *objective, output format, tool/knowledge scope, boundaries*. This also prevents one person's private knowledge leaking into another's context.
- **Handoffs carry provenance + consent** (LangGraph `Command`-style typed transfer): *who* produced the work and *what* the receiving twyn may see. Each twyn keeps its **owner's voice + attribution** through the chain.
- **Isolated context per twyn; share summaries, not raw knowledge** — each twyn works in its own window (privacy + cost) and returns compressed outputs to a shared blackboard the team reads.

## C5. The moat: teams of **specific people**
Everyone will have "agents that collaborate." Twynity's unique value is that members are **faithful, attributable, permissioned representations of named people**:
- **Consented cross-account collaboration** — my twyn works with my colleague's twyn *without either of us present*, within permissions our owners set.
- **Provenance & voice** — "this section was produced by Alex's twyn," in Alex's voice.
- **Owner-escalation as native HITL** — high-stakes/irreversible actions escalate to *the relevant person*, not a generic approval.
- **Reputation economy** — hired twyns carry ratings/specialties/price/availability (we have these on community twyns).

Lean into **consent, attribution, voice-preservation, owner-escalation**. The orchestration mechanics themselves are commoditizing; the *identity layer* is the differentiator.

## C6. Team guardrails (cost is the real risk)
Multi-agent runs cost **~15× a single chat**, and ~80% of quality tracks token spend — so:
- **Per-team & per-twyn credit budgets with auto-suspend** (extend `creditsUsed`).
- **Loop/turn caps, spawn limits**, a **separate verification pass** on high-stakes outputs.
- **Model routing** — cheap models for workers, the expensive one for the lead.
- Real-time cost visibility (we already surface earnings/credits).

---

# PART D — How it connects + phasing

## D1. Intra → inter is one continuum
A `TwynNode` in a workflow can hand to **another twyn** → a workflow *becomes* a team flow. So **build Workflows first; Teams is "a workflow step whose worker is someone else's twyn."** This matches the founder's framing: *twyns have intra-workflows; teams have inter-workflows.*

## D2. Open decisions for the PO
1. **Primary authoring mode for v1** — I recommend **capture-first** (Codex-style "save what I just did"); is that the bet, or lead with conversational?
2. **Paid-workflow protection** — confirm the **"free=open / paid=run-only-hosted"** model (vs. the leak-prone "locked editable").
3. **Pricing default** — per-run usage vs subscription as the headline model.
4. **Team lead** — default to a **neutral orchestrator** for cross-owner teams?
5. **Consent model** — how does an owner authorize their twyn to join someone else's team (per-team grant? scopes? revocation)?
6. **Take rate** — 15–20%? And do we add the Poe-style subscription bounty?

## D3. Suggested phasing (crawl / walk / run)
- **Crawl — Workflows v1 (single twyn):** activate the grayed card; **capture-from-session** + structured-card editor; `/`-invocation; manual + scheduled triggers; run states via mcp-kit; durable pause/approve. *No marketplace yet.*
- **Walk — Workflow Marketplace:** list/fork free templates; hosted run-only paid templates; Stripe Connect payouts + transparent formula; quality gate + Verified Creator.
- **Run — Teams:** `TwynNode`→teammate handoff; supervised + pipeline topologies; neutral orchestrator; consent/permissions; capability-card discovery for **assembled** teams; budgets + owner-escalation.

---

### Appendix — research sources (condensed)
- **Orchestration/determinism:** LangGraph (StateGraph, conditional edges, `interrupt`, subgraphs, `Send`), Temporal (durable execution, workflow/activity split, event-sourced replay), n8n/Make/Gumloop (visual primitives, sub-workflows), Airflow/Prefect/Dagster (DAG, lineage). browser-use `workflow-use` (record→generalize→replay, self-healing).
- **Authoring/invocation:** Claude Agent Skills & `/` + `argument-hint`, **OpenAI Codex Record & Replay** (the real "Baby Cursor"), Cursor skills/background agents (no verified screen-capture feature), Raycast typed args, Zapier Copilot (NL + voice), n8n AI builder. Emerging cross-tool `SKILL.md` standard (Anthropic→OpenAI).
- **Marketplace/monetization:** ElevenLabs (usage rev-share, hosted-only protection, $22M paid to 10k+ creators, Stripe Connect), Poe (per-message + subscription bounty), GPT Store (opaque-payout cautionary tale), n8n/Make/Gumloop (free-template funnel, affiliate-only), Salesforce AgentExchange (~15% take), Civitai (pool payouts, payment-rail risk).
- **Teams:** CrewAI (role/goal/backstory, sequential/hierarchical), AutoGen (GroupChat + manager → Microsoft Agent Framework), LangGraph (supervisor, `Command` handoffs, shared vs isolated state), OpenAI Agents SDK (lightweight handoffs, agents-as-tools, guardrails), Magentic-One (orchestrator + task/progress ledgers), MetaGPT (SOP roles, pub/sub message pool), Google **A2A** (Agent Cards, cross-vendor delegation) + MCP (tools), Anthropic multi-agent research (orchestrator-worker, isolate+summarize, 15× cost).

*Full per-thread source lists with URLs are available in the research run if you want them appended.*
