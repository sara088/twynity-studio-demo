import Link from "next/link";
import { ArrowLeft, Plug, KeyRound, ShieldCheck, FolderCog, Ban, Braces, TriangleAlert } from "lucide-react";
import { Logo } from "@/features/shared/components/Logo";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Creating interconnectors · Twynity docs",
};

// Technical documentation for building a custom interconnector. Linked from the
// "Add interconnector" form in the workshop. Static prose — no app chrome.
export default function InterconnectorDocsPage() {
  return (
    <div className="min-h-screen bg-bg-page">
      <header className="flex h-[60px] items-center justify-between border-b border-border bg-white px-6">
        <Logo height={26} />
        <Link
          href="/assets"
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-1.5 text-[12.5px] font-semibold text-gray-2 hover:border-violet hover:text-violet"
        >
          <ArrowLeft size={13} /> Back to workshop
        </Link>
      </header>

      <main className="mx-auto max-w-[760px] px-6 py-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-light px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-violet">
          <Plug size={13} /> Interconnectors
        </span>
        <h1 className="mt-4 font-heading text-[34px] font-bold leading-[1.1] tracking-[-0.8px] text-dark">
          Creating a custom interconnector
        </h1>
        <p className="mt-3 text-[15px] leading-[1.65] text-gray-3">
          An interconnector lets a twyn call an external API or MCP server — to read
          data, take actions, and sync state on your behalf. This guide walks through
          every field in the <span className="font-semibold text-dark">Add interconnector</span> form,
          then — if you&apos;re building the MCP server it points to — the{" "}
          <a href="#spec" className="font-semibold text-violet hover:underline">integration spec</a> it
          must satisfy.
        </p>

        <Section title="Before you start">
          <ul className="space-y-2">
            <Bullet>A reachable HTTPS endpoint (your API or MCP server base URL).</Bullet>
            <Bullet>Whichever credentials its auth mode needs — an API key, OAuth client, or nothing for open endpoints.</Bullet>
            <Bullet>To connect a hosted tool like Slack or Notion instead, use the marketplace — no setup required.</Bullet>
          </ul>
        </Section>

        <Section title="1 · Name & endpoint">
          <p className={P}>
            <strong className="text-dark">Name</strong> is how the interconnector appears
            in the workshop and in each twyn&apos;s loadout — keep it human (e.g. &ldquo;Internal Wiki&rdquo;).
          </p>
          <p className={P}>
            <strong className="text-dark">Endpoint base URL</strong> is the root every
            request is made against, e.g. <Code>https://api.yourservice.com</Code>. Paths
            are appended per call; don&apos;t include a trailing slash.
          </p>
        </Section>

        <Section title="2 · HTTP methods">
          <p className={P}>
            Select the verbs your twyn is allowed to use — <Code>GET</Code>, <Code>POST</Code>,
            <Code>PUT</Code>, <Code>PATCH</Code>, <Code>DELETE</Code>. Grant the minimum it
            needs; read-only integrations should expose only <Code>GET</Code>.
          </p>
        </Section>

        <Section title="3 · Connection mode">
          <p className={P}>How Twynity authenticates to your endpoint.</p>
          <div className="mt-3 space-y-3">
            <Mode icon={Ban} name="None">
              No authentication — the endpoint is open, or gated at the network level
              (IP allowlist, VPN). Nothing to store.
            </Mode>
            <Mode icon={KeyRound} name="API key">
              A single secret sent with every request. Paste the key; it&apos;s stored
              encrypted and never shown again. Best for service-to-service APIs.
            </Mode>
            <Mode icon={ShieldCheck} name="OAuth">
              Sign in on the provider and grant access — no keys to manage. Use this when
              the endpoint acts for a specific user account and supports OAuth 2.0.
            </Mode>
            <Mode icon={FolderCog} name="Projects">
              Define one or more named projects, each with custom fields (Text, Number,
              Date, Boolean, URL) your twyn populates per call. Use this when the same
              endpoint is scoped by project or workspace.
            </Mode>
          </div>
        </Section>

        <Section title="4 · Test the connection">
          <p className={P}>
            Hit <strong className="text-dark">Test connection</strong> before saving. It
            sends a lightweight request to your base URL with the selected mode and shows
            the response status — a quick way to catch a wrong URL, blocked network, or
            bad credential.
          </p>
        </Section>

        <Section title="5 · Connect it to a twyn">
          <p className={P}>
            Saving adds the interconnector to your <strong className="text-dark">workshop</strong> —
            a shared library. It isn&apos;t live yet. To use it, open a twyn&apos;s{" "}
            <strong className="text-dark">edit page</strong>, add the interconnector to that
            twyn, and authorize the account there. Each twyn connects independently, so the
            same interconnector can be bound to different accounts per twyn.
          </p>
        </Section>

        {/* ── Part 2 · Technical spec (for whoever builds the MCP server) ── */}
        <section id="spec" className="mt-16 scroll-mt-6 border-t-2 border-border pt-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-light px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-violet">
            <Braces size={13} /> Integration spec
          </span>
          <h2 className="mt-4 font-heading text-[26px] font-bold leading-[1.15] tracking-[-0.6px] text-dark">
            Building the MCP server
          </h2>
          <p className="mt-3 text-[14.5px] leading-[1.65] text-gray-3">
            If the interconnector points to an MCP server you build, it must satisfy the
            contract below. Twynity reads which connections it needs from your{" "}
            <strong className="text-dark">manifest</strong>, then drives the matching flow.
          </p>
        </section>

        <Section title="Connection types">
          <p className={P}>
            An MCP falls into one or more categories — implement each that applies (they
            map to the connection modes above). An MCP may need several at once (e.g.
            OAuth <em>and</em> a project); implement every applicable one.
          </p>

          <SpecCard title="No connection">
            <p className={P}>
              Runs without any external service — only the server URL is needed. The
              endpoint must follow the convention:
            </p>
            <Endpoint method="GET" path="{base_url}/mcp" />
          </SpecCard>

          <SpecCard title="API key">
            <p className={P}>
              Requires a secret credential. Expose an endpoint that stores it:
            </p>
            <Endpoint method="POST" path="/api/v1/keys" />
            <CodeBlock>{`{
  "name": "Github PAT",
  "key": "ghp..."
}`}</CodeBlock>
          </SpecCard>

          <SpecCard title="OAuth 2.0">
            <p className={P}>Authenticate users via OAuth — expose login, callback, and logout:</p>
            <Endpoint method="GET" path="/api/v1/auth/{provider}/login?redirect_uri={uri}" />
            <Endpoint method="POST" path="/api/v1/auth/{provider}/token-callback?redirect_uri={uri}&code={code}" />
            <Endpoint method="POST" path="/api/v1/auth/{provider}/logout" />
            <p className={P}>
              <Code>provider</Code> may be <Code>microsoft</Code>, <Code>google</Code>, or any
              supported provider.
            </p>
            <Note>
              The OAuth app must be registered with the <strong>exact</strong> redirect URI Twynity
              provides — any mismatch fails the flow. Note that Twynity&apos;s <Code>redirect_uri</Code> is
              <em> not</em> your callback endpoint: it&apos;s where the provider redirects, after which
              Twynity calls your <Code>token-callback</Code> to exchange the code.
            </Note>
          </SpecCard>

          <SpecCard title="Project / schema-based">
            <p className={P}>
              Needs structured config (a project, connection, or instance). Return the schema
              Twynity should collect:
            </p>
            <Endpoint method="GET" path="/api/v1/schema" />
            <p className={P}>Example — a MongoDB MCP responds:</p>
            <CodeBlock>{`{
  "name": "mongodb_connections",
  "endpoint": "/api/v1/mongodb_connections",
  "method": "POST",
  "schema": {
    "name": "string",
    "connection_string": "string"
  }
}`}</CodeBlock>
            <p className={P}>
              Twynity renders <Code>schema</Code> as a form, then sends the values to{" "}
              <Code>endpoint</Code> to create the resource.
            </p>
          </SpecCard>
        </Section>

        <Section title="MCP manifest">
          <p className={P}>
            Every MCP exposes a manifest so Twynity knows which connection flows to run:
          </p>
          <Endpoint method="GET" path="/api/v1/.well-known/mcp.json" />
          <CodeBlock>{`{
  "name": "Example MCP",
  "base_url": "https://example.com/mcp",
  "version": "1.0.0",
  "external_connections": {
    "oauth": { "provider": "google" },
    "api_key": null,
    "project": null
  }
}`}</CodeBlock>
          <p className={P}>
            <Code>external_connections</Code> tells Twynity what to ask for during integration.
          </p>
        </Section>

        <Section title="User connection status">
          <p className={P}>
            Expose an endpoint Twynity can call to check whether the current user is connected:
          </p>
          <Endpoint method="GET" path="/api/v1/external-connection/me" />
        </Section>

        <Section title="Authentication">
          <p className={P}>
            Every authenticated request from Twynity carries a Twynity-issued{" "}
            <strong className="text-dark">JWT bearer token</strong> in the <Code>Authorization</Code>{" "}
            header. Validate it before processing — fetch Twynity&apos;s published public key to verify
            the signature.
          </p>
        </Section>

        <div className="mt-12 rounded-[14px] border border-border bg-white px-5 py-4 text-[13.5px] text-gray-3">
          Ready to build one?{" "}
          <Link href="/assets" className="font-semibold text-violet hover:underline">
            Open the workshop
          </Link>{" "}
          and choose <span className="font-semibold text-dark">Add interconnector</span>.
        </div>
      </main>
    </div>
  );
}

const P = "mt-2 text-[14px] leading-[1.65] text-gray-3";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-9 border-t border-border pt-7">
      <h2 className="font-heading text-[18px] font-bold tracking-[-0.3px] text-dark">{title}</h2>
      <div className="mt-1">{children}</div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-gray-3">
      <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
      <span>{children}</span>
    </li>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-[6px] border border-border bg-input-bg px-1.5 py-0.5 font-mono text-[12.5px] text-dark">
      {children}
    </code>
  );
}

function Mode({
  icon: Icon,
  name,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[12px] border border-border bg-white px-4 py-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-violet-light text-violet">
        <Icon size={17} />
      </span>
      <div className="min-w-0">
        <div className="text-[14px] font-bold text-dark">{name}</div>
        <p className="mt-0.5 text-[13px] leading-[1.55] text-gray-3">{children}</p>
      </div>
    </div>
  );
}

function SpecCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-[14px] border border-border bg-white p-5">
      <div className="text-[14.5px] font-bold text-dark">{title}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const METHOD_TONE: Record<string, string> = {
  GET: "bg-mint text-mint-text",
  POST: "bg-violet-light text-violet",
  PUT: "bg-amber text-amber-text",
  PATCH: "bg-amber text-amber-text",
  DELETE: "bg-error/10 text-error",
};

function Endpoint({ method, path }: { method: string; path: string }) {
  return (
    <div className="mt-2.5 flex items-center gap-2.5 overflow-x-auto rounded-[10px] border border-border bg-input-bg px-3 py-2.5">
      <span
        className={cn(
          "shrink-0 rounded-[6px] px-2 py-0.5 font-mono text-[11px] font-bold",
          METHOD_TONE[method] ?? "bg-bg-input text-gray-3",
        )}
      >
        {method}
      </span>
      <code className="whitespace-nowrap font-mono text-[12.5px] text-dark">{path}</code>
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-2.5 overflow-x-auto rounded-[10px] border border-border bg-dark px-4 py-3.5 font-mono text-[12.5px] leading-[1.6] text-white/90">
      {children}
    </pre>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex items-start gap-2.5 rounded-[10px] border border-amber-text/20 bg-amber/50 px-3.5 py-3 text-[12.5px] leading-[1.55] text-amber-text">
      <TriangleAlert size={15} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
