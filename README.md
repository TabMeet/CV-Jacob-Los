# AI Chat Companion

A web-based, customizable AI chat companion. Give it a name, a personality, and a look, then chat with it.

## Setup

```bash
npm install
cp .env.example .env   # then add your ANTHROPIC_API_KEY
npm start
```

Open http://localhost:3000.

## How it works

- `server.js` is a small Express server. It holds the Anthropic API key and is the only thing that talks to the Claude API — the browser never sees the key.
- `public/` is the front end: a setup screen for customizing your companion (name, personality, avatar, accent color) and a chat screen.
- Companion settings and chat history are stored in the browser's `localStorage`, so they persist across reloads on the same device/browser.

## Notes

- The companion's personality is used to shape its voice and tone (a system prompt). The underlying model's normal safety behavior is unaffected by this — customization changes character, not content moderation.
- Model used: `claude-opus-5`. Swap the `model` value in `server.js` if you'd like to use a different one.
