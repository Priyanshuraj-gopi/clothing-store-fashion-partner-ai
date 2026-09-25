import type { Handler } from '@netlify/functions';
import OpenAI from 'openai';

type StylistRequest = {
  message?: string;
  occasion?: string;
  style?: string;
  fit?: { size?: string; preference?: string; proportions?: string };
  conversation?: Array<{ role?: string; text?: string }>;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'OPENAI_API_KEY is not configured on server' }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}') as StylistRequest;
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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: response.output_text }),
    };
  } catch (error) {
    console.error('Netlify stylist function error', error);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Live stylist service error' }),
    };
  }
};
