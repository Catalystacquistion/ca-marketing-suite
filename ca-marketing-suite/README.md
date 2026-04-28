# CA Marketing Suite

AI-powered marketing tools for Catalyst Acquisition clients.
Built with React + Vite. Deploys to Vercel in one click.

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → import your repo
3. Vercel auto-detects Vite — no settings to change
4. Add environment variable:
   - Name:  ANTHROPIC_API_KEY
   - Value: sk-ant-api03-...your key...
5. Click Deploy

## GHL Integration

Once deployed, go to GHL → Settings → Custom Menus → Add new menu item.
Set type to iFrame and paste your Vercel URL.

## Local development

```bash
npm install
npm run dev
```

Add a `.env.local` file with:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```
