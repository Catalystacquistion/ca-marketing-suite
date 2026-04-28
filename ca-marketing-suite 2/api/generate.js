// api/generate.js
// Vercel serverless function — proxies Claude API calls server-side

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Safely extract systemPrompt whether body is string or object
  let systemPrompt;
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    systemPrompt = body?.systemPrompt;
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  if (!systemPrompt) {
    return res.status(400).json({ error: "systemPrompt is required" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY is not configured in Vercel environment variables.",
    });
  }

  // Streaming headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        stream: true,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: "Generate the output now based on the client context provided in the system prompt.",
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.json().catch(() => ({}));
      const msg = errBody?.error?.message || `Anthropic API error ${anthropicRes.status}`;
      res.setHeader("Content-Type", "application/json");
      return res.status(502).json({ error: msg });
    }

    const reader = anthropicRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }

    res.end();
  } catch (err) {
    console.error("Generate handler error:", err.message);
    try {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    } catch {}
  }
}
