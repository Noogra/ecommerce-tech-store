import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { requireAdmin } from '../middleware/auth.js';
import { buildStoreContext } from '../lib/contextBuilder.js';
import { buildSystemPrompt } from '../lib/systemPrompt.js';
import db from '../db.js';

const router = Router();

const DAILY_SUMMARY_PROMPT = `Give me a comprehensive daily store summary including:
1. **Overall Sales Performance** — total revenue, order count, average order value
2. **Order Status Breakdown** — how many orders are new, processing, completed, cancelled
3. **Top 5 Selling Products** — ranked by units sold with revenue
4. **Inventory Alerts** — out of stock and low stock items that need attention
5. **Category Performance** — which categories are performing best/worst
6. **Recommendations** — 2-3 actionable suggestions to improve store performance

Format it as a clean, scannable report with clear sections.`;

// POST /api/chat — Send message, stream response via SSE
router.post('/', requireAdmin, async (req, res) => {
  const { messages, isDailySummary } = req.body;

  if (!isDailySummary && (!messages || !Array.isArray(messages) || messages.length === 0)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY not configured. Add it to your .env file.',
    });
  }

  try {
    // Build fresh context from DB
    const context = buildStoreContext(db);
    const systemPrompt = buildSystemPrompt(context);

    // Prepare conversation messages (limit to last 20 for token safety)
    const conversationMessages = isDailySummary
      ? [{ role: 'user', content: DAILY_SUMMARY_PROMPT }]
      : messages.slice(-20).map((m) => ({ role: m.role, content: m.content }));

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Set SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Use create() with stream:true and async iteration
    // This is safer than .stream() because all errors are caught by try-catch
    const stream = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemPrompt,
      messages: conversationMessages,
      stream: true,
    });

    for await (const event of stream) {
      // Check if client disconnected
      if (res.writableEnded || res.destroyed) break;

      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ type: 'text', content: event.delta.text })}\n\n`);
      }
    }

    // Stream finished successfully
    if (!res.writableEnded && !res.destroyed) {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    }
  } catch (error) {
    // Client disconnect / abort — this is normal, not a real error
    if (error.name === 'APIUserAbortError' || error.message?.includes('aborted')) {
      console.log('Chat stream aborted (client disconnected)');
      if (!res.writableEnded) {
        try { res.end(); } catch { /* ignore */ }
      }
      return;
    }

    console.error('Chat endpoint error:', error.message || error);

    if (!res.headersSent) {
      // Headers not sent yet — we can send a proper JSON error
      res.status(500).json({
        error: error.message?.includes('authentication')
          ? 'Invalid API key. Check ANTHROPIC_API_KEY in .env'
          : error.message?.includes('Could not resolve')
            ? 'Cannot reach Anthropic API. Check your internet connection.'
            : `AI request failed: ${error.message || 'Unknown error'}`,
      });
    } else {
      // Headers already sent (SSE mode) — send error as SSE event
      try {
        res.write(
          `data: ${JSON.stringify({ type: 'error', content: `AI error: ${error.message}` })}\n\n`
        );
        res.end();
      } catch {
        /* response already closed */
      }
    }
  }
});

export default router;
