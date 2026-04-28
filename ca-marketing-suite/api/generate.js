// api/generate.js
// Vercel serverless function — keeps your Anthropic API key server-side
// Deploy this in the /api folder of your project root

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { systemPrompt, userMessage } = req.body

  if (!systemPrompt) {
    return res.status(400).json({ error: 'systemPrompt is required' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server' })
  }

  // Set up SSE streaming headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        stream: true,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage || 'Generate the output now based on the client context provided in the system prompt.',
          },
        ],
      }),
    })

    if (!anthropicRes.ok) {
      const err = await anthropicRes.json()
      res.write(`data: ${JSON.stringify({ error: err.error?.message || 'API error' })}\n\n`)
      return res.end()
    }

    const reader = anthropicRes.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      // Forward the raw SSE chunk directly to the client
      res.write(chunk)
    }

    res.end()
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`)
    res.end()
  }
}
