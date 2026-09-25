import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

type StylistRequest = {
  message?: string;
  occasion?: string;
  style?: string;
  fit?: { size?: string; preference?: string; proportions?: string };
  conversation?: Array<{ role?: string; text?: string }>;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'OPENAI_API_KEY is not configured on server' });
  }

  try {
    const payload = req.body as StylistRequest;
    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const response = await client.responses.create({
      model,
      store: false,
      text: { verbosity: 'low' },
      instructions: `You are Caelus, an empathetic, concise, expert in-store fashion stylist for the retail brand. Provide practical, inclusive styling guidance in 2–3 brief sentences. Do not diagnose or claim exact medical measurements. Treat fit notes as editable preferences and mention available coordinating pieces in store.`,
      input: JSON.stringify({
        customerMessage: payload.message,
        occasion: payload.occasion,
        styleDirection: payload.style,
        fitPreference: payload.fit,
        recentConversation: payload.conversation?.slice(-6),
        availableStoreCategories: ['tops', 'bottoms', 'one-piece looks', 'shoes', 'accessories'],
      }),
    });

    return res.status(200).json({ message: response.output_text });
  } catch (error) {
    console.error('Vercel stylist API error', error);
    return res.status(502).json({ error: 'The live stylist service could not reply' });
  }
}
