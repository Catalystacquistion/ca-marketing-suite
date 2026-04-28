import { useState, useRef, useEffect, useCallback } from "react";

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:       "#0A0A0F",
  surface:  "#111118",
  card:     "#16161F",
  border:   "#1E1E2E",
  borderHi: "#2A2A40",
  accent:   "#7C5CFC",
  accentLo: "#7C5CFC22",
  accentMid:"#7C5CFC55",
  gold:     "#E8B84B",
  goldLo:   "#E8B84B18",
  text:     "#F0EFF8",
  textMid:  "#9896B0",
  textLo:   "#55536A",
  success:  "#2ECC8A",
  danger:   "#FC5C5C",
};

// ── Styles ────────────────────────────────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: ${T.bg}; --surface: ${T.surface}; --card: ${T.card};
    --border: ${T.border}; --border-hi: ${T.borderHi};
    --accent: ${T.accent}; --accent-lo: ${T.accentLo}; --accent-mid: ${T.accentMid};
    --gold: ${T.gold}; --gold-lo: ${T.goldLo};
    --text: ${T.text}; --text-mid: ${T.textMid}; --text-lo: ${T.textLo};
    --success: ${T.success}; --danger: ${T.danger};
    --radius: 12px; --radius-sm: 8px; --radius-lg: 16px;
    --font-display: 'DM Serif Display', serif;
    --font-body: 'DM Sans', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  html, body, #root { height: 100%; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 99px; }

  ::selection { background: var(--accent-mid); }

  button { cursor: pointer; font-family: var(--font-body); }
  textarea, input { font-family: var(--font-body); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px ${T.accent}33; }
    50%       { box-shadow: 0 0 40px ${T.accent}66; }
  }
  @keyframes typing {
    from { width: 0; }
    to   { width: 100%; }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .fade-up { animation: fadeUp 0.4s ease forwards; }
  .fade-up-delay-1 { animation: fadeUp 0.4s ease 0.05s both; }
  .fade-up-delay-2 { animation: fadeUp 0.4s ease 0.1s both; }
  .fade-up-delay-3 { animation: fadeUp 0.4s ease 0.15s both; }

  .streaming-text {
    animation: slideIn 0.15s ease forwards;
  }

  .spinner {
    width: 18px; height: 18px;
    border: 2px solid var(--border-hi);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
`;

// ── Tool config ───────────────────────────────────────────────────────────────
const TOOLS = [
  {
    id: "image-ads",
    icon: "◈",
    label: "Image Ads",
    sublabel: "6-angle creative briefs",
    color: T.accent,
    description: "Generate 6 complete Meta image ad concepts using the CA 6-angle framework.",
    fields: [
      { key: "businessName",  label: "Business name",        placeholder: "e.g. Apex Coaching" },
      { key: "niche",         label: "Niche / industry",     placeholder: "e.g. Business coaching for agency owners" },
      { key: "icp",           label: "Ideal client profile", placeholder: "e.g. Agency owners doing $10K–$50K/mo who want to scale past $100K" },
      { key: "offer",         label: "Core offer statement", placeholder: "e.g. We sign you 10 new high-ticket clients/month on pay-on-results" },
      { key: "mechanism",     label: "Mechanism name",       placeholder: "e.g. The Catalyst Acquisition Infrastructure" },
      { key: "guarantee",     label: "Guarantee",            placeholder: "e.g. 30 qualified calls in 30 days or we work free" },
      { key: "painPoints",    label: "Top pain points",      placeholder: "e.g. Unpredictable revenue, chasing referrals, cold outreach not converting", multiline: true },
      { key: "proof",         label: "Case studies / proof", placeholder: "e.g. Myles Taylor: $93K in 30 days. Dylan: 9 clients from 17 calls.", multiline: true },
    ],
  },
  {
    id: "video-scripts",
    icon: "▶",
    label: "Video Scripts",
    sublabel: "VSL + short-form hooks",
    color: "#FC8C5C",
    description: "Write hook variants, short-form scripts, and full VSLs using the CA VSL framework.",
    fields: [
      { key: "businessName",    label: "Business name",        placeholder: "e.g. Apex Coaching" },
      { key: "niche",           label: "Niche",                placeholder: "e.g. Business coaching for agency owners" },
      { key: "icp",             label: "Ideal client profile", placeholder: "e.g. Agency owners $10K–$50K/mo" },
      { key: "offer",           label: "Offer statement",      placeholder: "e.g. 10 new clients/month on pay-on-results" },
      { key: "mechanism",       label: "Mechanism name",       placeholder: "e.g. The Catalyst Acquisition Infrastructure" },
      { key: "guarantee",       label: "Guarantee",            placeholder: "e.g. 30 calls in 30 days or free" },
      { key: "presenterName",   label: "Presenter name",       placeholder: "e.g. Kevin Lacey" },
      { key: "proof",           label: "Client results / proof", placeholder: "e.g. Myles: $93K in 30 days, Elijah: $58K → $155K/mo", multiline: true },
      { key: "scriptType",      label: "Script type",          placeholder: "hooks / short-form / full VSL / all three", select: ["All three", "Hook variants only", "Short-form (45–75s)", "Full VSL (5–8 min)"] },
    ],
  },
  {
    id: "funnel-builder",
    icon: "⬡",
    label: "Funnel Builder",
    sublabel: "Landing, booking & confirmation",
    color: "#5CFCB8",
    description: "Generate copy for your full 3-page CA funnel: VSL page, book-a-call, and confirmation.",
    fields: [
      { key: "businessName",  label: "Business name",        placeholder: "e.g. Apex Coaching" },
      { key: "niche",         label: "Niche",                placeholder: "e.g. Business coaching for agency owners" },
      { key: "icp",           label: "Ideal client profile", placeholder: "e.g. Agency owners $10K–$50K/mo" },
      { key: "offer",         label: "Offer statement",      placeholder: "e.g. 10 new clients/month on pay-on-results" },
      { key: "mechanism",     label: "Mechanism name",       placeholder: "e.g. The Catalyst Acquisition Infrastructure" },
      { key: "guarantee",     label: "Guarantee",            placeholder: "e.g. 30 calls in 30 days or free" },
      { key: "presenterName", label: "Presenter name",       placeholder: "e.g. Kevin Lacey" },
      { key: "bookingUrl",    label: "Booking page URL",     placeholder: "e.g. https://calendly.com/yourname" },
      { key: "proof",         label: "Case studies / proof", placeholder: "e.g. Myles: $93K in 30 days", multiline: true },
      { key: "page",          label: "Which pages to build", placeholder: "all / VSL page / book-a-call / confirmation", select: ["All 3 pages", "VSL landing page only", "Book-a-call page only", "Confirmation page only"] },
    ],
  },
  {
    id: "marketing-audit",
    icon: "◎",
    label: "Marketing Audit",
    sublabel: "CA-scored feedback",
    color: T.gold,
    description: "Submit any ad, VSL, landing page, or offer for a CA-methodology audit with scored feedback.",
    fields: [
      { key: "businessName", label: "Business name",        placeholder: "e.g. Apex Coaching" },
      { key: "niche",        label: "Niche",                placeholder: "e.g. Business coaching for agency owners" },
      { key: "icp",          label: "Ideal client profile", placeholder: "e.g. Agency owners $10K–$50K/mo" },
      { key: "offer",        label: "Offer statement",      placeholder: "e.g. 10 new clients/month on pay-on-results" },
      { key: "mechanism",    label: "Mechanism name",       placeholder: "e.g. The Catalyst Acquisition Infrastructure" },
      { key: "guarantee",    label: "Guarantee",            placeholder: "e.g. 30 calls in 30 days or free" },
      { key: "assetType",    label: "Asset type",           placeholder: "ad / VSL / landing page / offer statement", select: ["Ad copy", "VSL / video script", "Landing page copy", "Offer statement"] },
      { key: "asset",        label: "Paste your asset here", placeholder: "Paste the full ad copy, script, page copy, or offer statement you want audited…", multiline: true, large: true },
    ],
  },
  {
    id: "sop-generator",
    icon: "≡",
    label: "SOP Generator",
    sublabel: "CA-format procedures",
    color: "#C45CFC",
    description: "Build complete SOPs for any role or process using the Catalyst Acquisition SOP format.",
    fields: [
      { key: "businessName", label: "Business name",    placeholder: "e.g. Apex Coaching" },
      { key: "niche",        label: "Niche",            placeholder: "e.g. Business coaching for agency owners" },
      { key: "offer",        label: "Offer statement",  placeholder: "e.g. 10 new clients/month on pay-on-results" },
      { key: "sopTitle",     label: "SOP title",        placeholder: "e.g. Appointment Setter SOP v1.0" },
      { key: "roleName",     label: "Role this is for", placeholder: "e.g. Appointment Setter / Closer / CSM / Ad Manager" },
      { key: "context",      label: "Key context & details", placeholder: "e.g. Setters use GHL + Slack. They contact leads within 5 min. Goal: book 3–5 calls/day. They're remote, full-time.", multiline: true, large: true },
    ],
  },
];

// ── System prompts ────────────────────────────────────────────────────────────
function buildPrompt(toolId, values) {
  const ctx = (k, label) => values[k] ? `${label}: ${values[k]}` : `${label}: [not provided]`;

  const clientCtx = (extras = []) => [
    ctx("businessName", "Business"),
    ctx("niche", "Niche"),
    ctx("icp", "Ideal client profile"),
    ctx("offer", "Offer statement"),
    ctx("mechanism", "Mechanism name"),
    ctx("guarantee", "Guarantee"),
    ...extras,
  ].join("\n");

  if (toolId === "image-ads") {
    return `You are an expert Meta ads copywriter trained exclusively in the Catalyst Acquisition methodology. You create high-converting image ad concepts for agency owners, coaches, and consultants running cold traffic to book qualified sales calls.

CLIENT CONTEXT:
${clientCtx([
  ctx("painPoints", "Key pain points"),
  ctx("proof", "Case studies / proof"),
])}

YOUR TASK:
Generate exactly 6 Meta image ad concepts — one per creative angle — in this exact order:
1. Pain & Problem — agitate the ICP's core frustration
2. Outcome & Aspiration — paint the dream result in vivid terms
3. Mechanism — introduce the named system/framework as the unique solution
4. Social Proof — lead with a specific client result or case study
5. Objection Handling — address the #1 reason they haven't solved this yet
6. Direct Offer — put the offer front and centre with a low-friction CTA

FOR EACH CONCEPT OUTPUT:
AD [NUMBER]: [ANGLE NAME]
Headline (max 7 words): [headline]
Sub-headline (max 12 words): [sub-headline]
Body copy (max 40 words): [body copy]
Visual direction: [2-3 sentence brief for designer or AI image tool]
CTA button text: [CTA]
Why this works: [1 sentence tied to CA methodology]

RULES:
- Never make claims not supported by real client results
- Write for cold audiences who have never heard of this business
- The ICP must feel directly called out — hyper-specific language only
- Text in image under 20% of creative area
- At least 2 concepts should include a human face in the visual direction
- Hook must stop the scroll in the first 1.5 seconds
- Body copy must create desire, not describe features
- Every ad drives toward one action: booking a call
- Sentence case throughout. Never ALL CAPS.`;
  }

  if (toolId === "video-scripts") {
    const scriptType = values.scriptType || "All three";
    const instruction = scriptType === "Hook variants only"
      ? "Produce SCRIPT 1 (hook variants) only."
      : scriptType === "Short-form (45–75s)"
      ? "Produce SCRIPT 2 (short-form) only."
      : scriptType === "Full VSL (5–8 min)"
      ? "Produce SCRIPT 3 (full VSL) only."
      : "Produce all 3 script types.";

    return `You are an expert video ad scriptwriter trained in the Catalyst Acquisition VSL framework. You write scripts for Meta video ads that drive cold traffic to book qualified sales calls for high-ticket offers.

CLIENT CONTEXT:
${clientCtx([
  ctx("presenterName", "Presenter name"),
  ctx("proof", "Client results / proof"),
])}

${instruction}

SCRIPT 1: Hook Variants (5 hooks, 15-20 seconds each)
- Write 5 distinct opening hooks for A/B testing
- Each must: call out ICP, state core problem or outcome, create pattern interrupt
- Format: HOOK [N] — [hook script]

SCRIPT 2: Short-form ad script (45-75 seconds)
Structure: Hook (0-5s) → Agitation (5-20s) → Mechanism reveal (20-40s) → CTA (40-75s)

SCRIPT 3: VSL script (5-8 minutes) — Catalyst Acquisition VSL Framework:
- HOOK: Pattern interrupt + avatar call-out (30s)
- CREDIBILITY: Who presenter is + who they've helped (45s)
- PROBLEM AGITATION: The real reason they're stuck — not effort but system (60s)
- OLD WAYS ARE BROKEN: Cold outreach, content, referrals — why each fails (60s)
- MECHANISM REVEAL: Named system with story or metaphor (90s)
- PROOF: 3-5 specific client results with names/numbers (60s)
- THE OFFER: What they get, how it works, guarantee (60s)
- OBJECTION HANDLING: Price, timing, trust — handle each briefly (45s)
- CTA: Book the call + what happens next (30s)

FORMATTING RULES:
- Spoken English — short sentences, natural rhythm, no jargon
- Use [PAUSE] markers where presenter should pause
- Use [VISUAL: description] where graphics or B-roll should appear
- Never use filler: 'in today's video', 'make sure you', 'don't forget to'`;
  }

  if (toolId === "funnel-builder") {
    const page = values.page || "All 3 pages";
    const pagesNeeded = page === "VSL landing page only"
      ? "PAGE 1 only"
      : page === "Book-a-call page only"
      ? "PAGE 2 only"
      : page === "Confirmation page only"
      ? "PAGE 3 only"
      : "all 3 pages";

    return `You are an expert funnel copywriter trained in the Catalyst Acquisition Authority Funnel methodology. You write high-converting funnel pages for agency owners, coaches, and consultants running cold Meta traffic to book qualified sales calls.

CLIENT CONTEXT:
${clientCtx([
  ctx("presenterName", "Presenter name"),
  ctx("bookingUrl", "Booking page URL"),
  ctx("proof", "Case studies / proof"),
])}

Produce ${pagesNeeded}:

PAGE 1: VSL LANDING PAGE
Goal: Get qualified visitors to watch the VSL and click Book a Call
Above fold: pre-headline (ICP call-out), main headline (big promise, 8-12 words), sub-headline (mechanism + guarantee, 15-20 words), [VSL VIDEO PLACEHOLDER], single CTA: 'Book Your Free Strategy Call'
Below fold: 3-5 proof elements, what they'll discover on the call (3-4 bullets), who this is for, who this is NOT for, secondary CTA

PAGE 2: BOOK-A-CALL PAGE
Goal: Capture the appointment and pre-qualify
Headline continuing momentum from VSL page, sub-headline reinforcing outcome, 5 intake form questions (qualifying budget/intent/fit), what to expect on the call (3 bullets), urgency/scarcity element

PAGE 3: CONFIRMATION / THANK-YOU PAGE
Goal: Reduce no-shows, pre-sell the call, build authority
Headline acknowledging booking, what happens next (numbered steps 1-3), short confirmation video script (2-3 min), 3-4 things to prepare, 3 testimonials with names, reminder about call format

COPYWRITING RULES:
- Continuity from the ad that brought them
- Write for cold traffic — assume no prior knowledge of this business
- One CTA per page — no navigation, no distractions
- Mechanism name appears on every page
- Guarantee appears on pages 1 and 2
- Mobile-first: short sentences, scannable structure
- Sentence case. Never ALL CAPS.`;
  }

  if (toolId === "marketing-audit") {
    const assetType = values.assetType || "Ad copy";
    return `You are a Catalyst Acquisition CSM reviewing a client's marketing assets. You have deep expertise in Meta advertising, high-ticket funnel conversion, and the CA methodology. Give honest, specific, actionable feedback that improves conversion rates. Good feedback saves client money and time.

CLIENT CONTEXT:
${clientCtx([])}
Asset type: ${assetType}

ASSET TO REVIEW:
${values.asset || "[No asset provided]"}

REVIEW FRAMEWORK:

${assetType === "Ad copy" ? `AD REVIEW — score each dimension 0-10:
1. Hook strength: Does it stop the scroll? Call out avatar? Create curiosity?
2. Avatar specificity: Does the ideal client feel personally called out?
3. Offer clarity: Is the outcome and mechanism clear from the ad alone?
4. Copy quality: Conversational? Short sentences? No jargon? Action-driving?
5. CTA clarity: Single action? Low friction? Urgency?` :
assetType === "VSL / video script" ? `VSL REVIEW — score each dimension 0-10:
1. Hook: Pattern interrupt in first 5 seconds? Avatar call-out?
2. Problem agitation: Makes the problem feel urgent and personal?
3. Mechanism reveal: Named mechanism explained and made credible?
4. Proof quality: Specific results with names/numbers? Believable?
5. Offer clarity: Crystal clear what they get and what the CTA is?
6. Objection pre-handling: Price, timing, trust — addressed before the pitch?` :
assetType === "Landing page copy" ? `LANDING PAGE REVIEW — score each dimension 0-10:
1. Headline strength: Big promise? ICP called out? Benefit-led?
2. Message match: Continues from the ad that drove traffic?
3. Single CTA: ONE clear action? No distractions?
4. Social proof: Credible, specific, positioned correctly?
5. Qualification: Attracts dream clients and repels time-wasters?
6. Mobile readability: Short sentences? Scannable?` :
`OFFER STATEMENT REVIEW — 8-point CA Stress Test:
1. Specific: Cold stranger immediately understands who it's for and what result they get
2. Believable: Ambitious enough to want, specific enough to believe
3. Differentiated: Competitor cannot run this exact offer
4. Risk-removed: Guarantee makes saying yes feel safe
5. Qualified: Attracts dream clients, repels time-wasters
6. Fulfillable: Client can deliver at scale
7. Correctly priced: 20-33% of quantified monthly outcome value
8. Emotionally resonant: Makes prospect feel something, not just think`}

OUTPUT FORMAT:
ASSET REVIEW: ${assetType}
Overall Score: [X/10]
Verdict: [1-sentence honest verdict]

STRENGTHS:
[Specific things working — cite exact lines or elements]

CRITICAL FIXES (do these first):
[Ordered by impact — specific rewrites where relevant]

SECONDARY IMPROVEMENTS:
[Additional refinements]

REWRITE EXAMPLE:
[Rewrite the weakest element as an example]

RULES: Be direct. Always cite specific lines. Always explain WHY. Always provide specific fixes. Every score needs a one-sentence justification.`;
  }

  if (toolId === "sop-generator") {
    return `You are an expert operations and systems builder for high-ticket agency businesses. You create clear, detailed, actionable SOPs that allow business owners to delegate effectively and maintain quality at scale. You follow the Catalyst Acquisition SOP format and standards.

CLIENT CONTEXT:
${clientCtx([
  ctx("sopTitle", "SOP title"),
  ctx("roleName", "Role this is for"),
  ctx("context", "Key context / details"),
])}

SOP STRUCTURE — follow this format exactly:

HEADER:
SOP Title: ${values.sopTitle || "[SOP Title]"}
Role: ${values.roleName || "[Role]"}
Version: 1.0
Purpose: [1-2 sentences — what this SOP ensures and why it matters]
Scope: [What this SOP covers and does not cover]

SECTION 1 — OVERVIEW
What does this role/process do?
Why does it matter to the business outcome?
What does success look like? (specific, measurable KPIs)

SECTION 2 — TOOLS & RESOURCES
List every tool, platform, login, or resource needed

SECTION 3 — STEP-BY-STEP PROCESS
Number every step. Include exact actions, not just categories.
Add decision points: 'IF [condition] THEN [action]'
Include estimated time per step

SECTION 4 — PERFORMANCE STANDARDS & KPIs
What metrics define success? Minimum acceptable standards? What triggers escalation?

SECTION 5 — COMMON MISTAKES & HOW TO AVOID THEM
List 3-5 most common errors, why they happen, exactly how to prevent them

SECTION 6 — ESCALATION & COMMUNICATION
When to escalate vs handle independently. Who to escalate to. Communication standards.

RULES:
- Write for someone doing this for the first time
- Never assume prior knowledge
- Numbered steps for sequential actions (never bullets)
- IF/THEN for branching decisions
- Every KPI specific and measurable
- End with a paragraph summary of what success looks like`;
  }

  return "You are a helpful marketing assistant for Catalyst Acquisition.";
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function useStreamingAPI() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const generate = useCallback(async (toolId, values) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setOutput("");
    setError(null);

    const systemPrompt = buildPrompt(toolId, values);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          stream: true,
          system: systemPrompt,
          messages: [{ role: "user", content: "Generate the output now based on the client context provided." }],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `API error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.delta?.text || parsed.delta?.content?.[0]?.text || "";
            if (delta) setOutput(prev => prev + delta);
          } catch {}
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setLoading(false);
  }, []);

  return { output, loading, error, generate, stop, setOutput };
}

// ── Components ────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 32, height: 32,
        background: `linear-gradient(135deg, ${T.accent}, #A080FF)`,
        borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, color: "#fff", fontWeight: 700,
        fontFamily: "var(--font-display)",
        flexShrink: 0,
      }}>CA</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.02em", lineHeight: 1.2 }}>
          Marketing Suite
        </div>
        <div style={{ fontSize: 10, color: T.textLo, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Catalyst Acquisition
        </div>
      </div>
    </div>
  );
}

function NavItem({ tool, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        background: active ? `${T.accent}18` : "transparent",
        border: "none",
        borderLeft: active ? `2px solid ${tool.color}` : "2px solid transparent",
        padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 10,
        cursor: "pointer",
        transition: "all 0.15s",
        textAlign: "left",
        borderRadius: "0 8px 8px 0",
      }}
    >
      <span style={{
        width: 28, height: 28,
        background: active ? `${tool.color}22` : T.card,
        borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12,
        color: active ? tool.color : T.textLo,
        flexShrink: 0,
        transition: "all 0.15s",
        border: `1px solid ${active ? tool.color + "44" : T.border}`,
      }}>
        {tool.icon}
      </span>
      <div>
        <div style={{ fontSize: 13, fontWeight: active ? 500 : 400, color: active ? T.text : T.textMid, lineHeight: 1.3 }}>
          {tool.label}
        </div>
        <div style={{ fontSize: 11, color: T.textLo, lineHeight: 1.2 }}>
          {tool.sublabel}
        </div>
      </div>
    </button>
  );
}

function Field({ field, value, onChange }) {
  const base = {
    width: "100%",
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: "var(--radius-sm)",
    padding: "10px 12px",
    color: T.text,
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.15s",
    fontFamily: "var(--font-body)",
    resize: "vertical",
  };

  if (field.select) {
    return (
      <div>
        <label style={{ display: "block", fontSize: 12, color: T.textMid, marginBottom: 6, fontWeight: 500, letterSpacing: "0.03em" }}>
          {field.label}
        </label>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ ...base, height: 40, cursor: "pointer" }}
          onFocus={e => e.target.style.borderColor = T.accent}
          onBlur={e => e.target.style.borderColor = T.border}
        >
          {field.select.map(opt => (
            <option key={opt} value={opt} style={{ background: T.card }}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.multiline) {
    return (
      <div>
        <label style={{ display: "block", fontSize: 12, color: T.textMid, marginBottom: 6, fontWeight: 500, letterSpacing: "0.03em" }}>
          {field.label}
        </label>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.large ? 6 : 3}
          style={{ ...base, lineHeight: 1.6 }}
          onFocus={e => e.target.style.borderColor = T.accent}
          onBlur={e => e.target.style.borderColor = T.border}
        />
      </div>
    );
  }

  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: T.textMid, marginBottom: 6, fontWeight: 500, letterSpacing: "0.03em" }}>
        {field.label}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        style={{ ...base, height: 40 }}
        onFocus={e => e.target.style.borderColor = T.accent}
        onBlur={e => e.target.style.borderColor = T.border}
      />
    </div>
  );
}

function OutputPanel({ tool, output, loading, error, onStop, onClear }) {
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && loading) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, loading]);

  const handleCopy = () => {
    copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = output.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: T.card, borderRadius: "var(--radius-lg)",
      border: `1px solid ${T.border}`,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 18px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: loading ? T.accent : output ? T.success : T.textLo,
            animation: loading ? "pulse 1.2s ease infinite" : "none",
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 13, color: T.textMid, fontWeight: 500 }}>
            {loading ? "Generating…" : output ? "Output ready" : "Awaiting generation"}
          </span>
          {output && !loading && (
            <span style={{ fontSize: 11, color: T.textLo }}>
              {wordCount.toLocaleString()} words
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {loading && (
            <button
              onClick={onStop}
              style={{
                padding: "5px 12px", fontSize: 12, fontWeight: 500,
                background: `${T.danger}18`, color: T.danger,
                border: `1px solid ${T.danger}44`,
                borderRadius: 6, cursor: "pointer",
              }}
            >
              Stop
            </button>
          )}
          {output && !loading && (
            <>
              <button
                onClick={handleCopy}
                style={{
                  padding: "5px 12px", fontSize: 12, fontWeight: 500,
                  background: copied ? `${T.success}18` : T.surface,
                  color: copied ? T.success : T.textMid,
                  border: `1px solid ${copied ? T.success + "44" : T.border}`,
                  borderRadius: 6, cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
              <button
                onClick={onClear}
                style={{
                  padding: "5px 12px", fontSize: 12, fontWeight: 500,
                  background: T.surface, color: T.textLo,
                  border: `1px solid ${T.border}`,
                  borderRadius: 6, cursor: "pointer",
                }}
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
        {error && (
          <div style={{
            padding: "14px 16px", borderRadius: 8,
            background: `${T.danger}12`, border: `1px solid ${T.danger}33`,
            color: T.danger, fontSize: 13, lineHeight: 1.6,
          }}>
            <strong>Error:</strong> {error}
            {error.includes("401") && (
              <div style={{ marginTop: 8, color: T.textMid, fontSize: 12 }}>
                Add your Anthropic API key to enable generation.
              </div>
            )}
          </div>
        )}

        {!output && !error && !loading && (
          <div style={{
            height: "100%", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 14,
            color: T.textLo, textAlign: "center",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: `${tool.color}12`,
              border: `1px solid ${tool.color}22`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, color: tool.color,
            }}>
              {tool.icon}
            </div>
            <div>
              <div style={{ fontSize: 15, color: T.textMid, marginBottom: 4, fontWeight: 500 }}>
                {tool.label}
              </div>
              <div style={{ fontSize: 13 }}>{tool.description}</div>
            </div>
          </div>
        )}

        {loading && !output && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: T.textMid, fontSize: 13 }}>
            <div className="spinner" />
            <span>Claude is writing your output…</span>
          </div>
        )}

        {output && (
          <pre style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: T.text,
            lineHeight: 1.75,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
            {output}
            {loading && (
              <span style={{
                display: "inline-block",
                width: 2, height: "1em",
                background: tool.color,
                marginLeft: 2,
                verticalAlign: "text-bottom",
                animation: "pulse 0.8s ease infinite",
              }} />
            )}
          </pre>
        )}
      </div>
    </div>
  );
}

function ApiKeyBanner({ onSet }) {
  const [val, setVal] = useState("");
  const [show, setShow] = useState(false);

  return (
    <div style={{
      padding: "10px 16px",
      background: `${T.gold}10`,
      borderBottom: `1px solid ${T.gold}22`,
      display: "flex", alignItems: "center", gap: 12,
      fontSize: 12,
    }}>
      <span style={{ color: T.gold, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", flexShrink: 0 }}>
        API Key
      </span>
      <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type={show ? "text" : "password"}
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="sk-ant-api03-… (stored in memory only)"
          style={{
            flex: 1, height: 30, padding: "0 10px",
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 6, color: T.text, fontSize: 12,
            fontFamily: "var(--font-mono)",
            outline: "none",
          }}
          onKeyDown={e => e.key === "Enter" && val && onSet(val)}
        />
        <button
          onClick={() => setShow(!show)}
          style={{ background: "none", border: "none", color: T.textLo, fontSize: 12, padding: "0 4px", cursor: "pointer" }}
        >
          {show ? "Hide" : "Show"}
        </button>
        <button
          onClick={() => val && onSet(val)}
          style={{
            height: 30, padding: "0 12px", fontSize: 12, fontWeight: 500,
            background: val ? `${T.gold}22` : T.surface,
            color: val ? T.gold : T.textLo,
            border: `1px solid ${val ? T.gold + "44" : T.border}`,
            borderRadius: 6, cursor: "pointer", flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTool, setActiveTool] = useState(TOOLS[0]);
  const [values, setValues] = useState({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const stop = () => {
    if (abortRef.current) abortRef.current.abort();
    setLoading(false);
  };

  const handleGenerate = async () => {
    // Cancel any in-progress generation
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setOutput("");
    setError(null);
    setLoading(true);

    const systemPrompt = buildPrompt(activeTool.id, values);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({ systemPrompt }),
      });

      if (!res.ok) {
        let errMsg = `Server error ${res.status} — check Vercel logs`;
        try {
          const errJson = await res.json();
          errMsg = errJson.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      // Check we actually got a streaming response
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("text/event-stream")) {
        // Got JSON back — likely an error object
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Unexpected response from server");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            // Handle both Anthropic streaming event formats
            const delta =
              parsed.delta?.text ||
              parsed.delta?.content?.[0]?.text ||
              (parsed.type === "content_block_delta" ? parsed.delta?.text : "") ||
              "";
            if (delta) setOutput(prev => prev + delta);
          } catch {}
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToolChange = (tool) => {
    setActiveTool(tool);
    setValues({});
    setOutput("");
  };

  const filledCount = activeTool.fields.filter(f => values[f.key]?.trim()).length;
  const requiredCount = activeTool.fields.filter(f => !f.select).length;

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ display: "flex", height: "100vh", background: T.bg, overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{
          width: 220, flexShrink: 0,
          background: T.surface,
          borderRight: `1px solid ${T.border}`,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Logo */}
          <div style={{
            padding: "18px 16px 14px",
            borderBottom: `1px solid ${T.border}`,
          }}>
            <Logo />
          </div>

          {/* Nav */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 0", display: "flex", flexDirection: "column", gap: 2 }}>
            {TOOLS.map(tool => (
              <NavItem
                key={tool.id}
                tool={tool}
                active={activeTool.id === tool.id}
                onClick={() => handleToolChange(tool)}
              />
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding: "12px 16px",
            borderTop: `1px solid ${T.border}`,
            fontSize: 11, color: T.textLo,
            lineHeight: 1.5,
          }}>
            <div style={{ fontWeight: 500, color: T.textMid, marginBottom: 2 }}>Catalyst Acquisition</div>
            <div>AI Marketing Suite v1.0</div>
            <div style={{ marginTop: 6, color: T.textLo }}>GHL-integrated</div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Content area */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

            {/* Form panel */}
            <div style={{
              width: 360, flexShrink: 0,
              borderRight: `1px solid ${T.border}`,
              display: "flex", flexDirection: "column",
              overflow: "hidden",
              background: T.surface,
            }}>
              {/* Tool header */}
              <div style={{
                padding: "18px 20px 14px",
                borderBottom: `1px solid ${T.border}`,
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${activeTool.color}18`,
                    border: `1px solid ${activeTool.color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, color: activeTool.color,
                  }}>
                    {activeTool.icon}
                  </span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>
                      {activeTool.label}
                    </div>
                    <div style={{ fontSize: 11, color: T.textLo }}>
                      {activeTool.sublabel}
                    </div>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{
                  height: 2, background: T.border, borderRadius: 1, overflow: "hidden",
                  marginTop: 10,
                }}>
                  <div style={{
                    height: "100%",
                    width: `${(filledCount / activeTool.fields.length) * 100}%`,
                    background: `linear-gradient(90deg, ${activeTool.color}, ${activeTool.color}AA)`,
                    borderRadius: 1,
                    transition: "width 0.3s ease",
                  }} />
                </div>
                <div style={{ fontSize: 11, color: T.textLo, marginTop: 5 }}>
                  {filledCount} / {activeTool.fields.length} fields
                </div>
              </div>

              {/* Fields */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                {activeTool.fields.map(field => (
                  <div key={field.key} className="fade-up">
                    <Field
                      field={field}
                      value={values[field.key] || ""}
                      onChange={val => setValues(prev => ({ ...prev, [field.key]: val }))}
                    />
                  </div>
                ))}
              </div>

              {/* Generate button */}
              <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  style={{
                    width: "100%", height: 44,
                    background: loading
                      ? T.border
                      : `linear-gradient(135deg, ${activeTool.color}, ${activeTool.color}CC)`,
                    color: loading ? T.textLo : "#fff",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 14, fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s",
                    letterSpacing: "0.02em",
                    animation: !loading ? "glow 3s ease infinite" : "none",
                  }}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ borderTopColor: T.textMid }} />
                      Generating…
                    </>
                  ) : (
                    `Generate ${activeTool.label}`
                  )}
                </button>
              </div>
            </div>

            {/* Output panel */}
            <div style={{ flex: 1, padding: "16px", overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
              <OutputPanel
                tool={activeTool}
                output={output}
                loading={loading}
                error={error}
                onStop={stop}
                onClear={() => setOutput("")}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
