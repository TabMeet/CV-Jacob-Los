import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// API key stays server-side only — never sent to the browser.
const client = new Anthropic();

const MAX_HISTORY = 30;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_NAME_LENGTH = 60;
const MAX_PERSONALITY_LENGTH = 1000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
  try {
    const { companion, messages } = req.body ?? {};

    if (!companion || typeof companion.name !== 'string' || !companion.name.trim()) {
      return res.status(400).json({ error: 'A companion name is required.' });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'At least one message is required.' });
    }

    const trimmedMessages = messages.slice(-MAX_HISTORY).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content ?? '').slice(0, MAX_MESSAGE_LENGTH),
    }));
    if (trimmedMessages[0].role !== 'user') {
      trimmedMessages.shift();
    }
    if (trimmedMessages.length === 0) {
      return res.status(400).json({ error: 'Conversation must contain a user message.' });
    }

    const name = companion.name.trim().slice(0, MAX_NAME_LENGTH);
    const personality = (companion.personality || 'warm, curious, and easygoing')
      .toString()
      .trim()
      .slice(0, MAX_PERSONALITY_LENGTH);

    const systemPrompt = [
      `You are ${name}, a personal AI companion having a private one-on-one chat with your user.`,
      `Personality and style: ${personality}`,
      `Speak in first person as ${name}, stay in character, and keep replies conversational rather than formal.`,
      `Do not include internal or system XML tags in your response.`,
    ].join('\n');

    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 1024,
      thinking: { type: 'disabled' },
      system: systemPrompt,
      messages: trimmedMessages,
    });

    if (response.stop_reason === 'refusal') {
      return res.json({
        reply: "I'd rather not respond to that one.",
        refusal: true,
      });
    }

    const textBlock = response.content.find((b) => b.type === 'text');
    res.json({ reply: textBlock ? textBlock.text : '' });
  } catch (err) {
    console.error('chat error:', err);
    res.status(500).json({ error: 'Something went wrong talking to your companion.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`AI companion server running at http://localhost:${port}`);
});
