import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import OpenAI from 'openai';
import type { IncomingMessage, ServerResponse } from 'node:http';

type StylistRequest = {
  message?: string;
  occasion?: string;
  style?: string;
  fit?: { size?: string; preference?: string; proportions?: string };
  conversation?: Array<{ role?: string; text?: string }>;
};

function readBody(request: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = '';
    request.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function stylistApi(apiKey: string | undefined, model: string): Plugin {
  return {
    name: 'caelus-openai-stylist',
    configureServer(server) {
      server.middlewares.use('/api/stylist', async (request: IncomingMessage, response: ServerResponse, next) => {
        if (request.method !== 'POST') return next();
        if (!apiKey) {
          response.writeHead(503, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ error: 'OPENAI_API_KEY is not configured' }));
          return;
        }
        try {
          const payload = JSON.parse(await readBody(request)) as StylistRequest;
          const client = new OpenAI({ apiKey });
          const responseFromModel = await client.responses.create({
            model,
            store: false,
            text: { verbosity: 'low' },
            instructions: `You are Caelus, a concise, warm premium in-store fashion stylist for Vortex Caelus. Give practical, inclusive styling guidance in 2–4 short sentences. You must not claim to measure bodies, diagnose appearance, or reserve stock. Treat all fit details as editable customer preferences. Work only from the supplied style context and say that an associate can verify availability. End with one natural follow-up question when useful.`,
            input: JSON.stringify({
              customerMessage: payload.message,
              occasion: payload.occasion,
              styleDirection: payload.style,
              fitPreference: payload.fit,
              recentConversation: payload.conversation?.slice(-8),
              availableStoreCategories: ['tops', 'bottoms', 'one-piece looks', 'shoes', 'accessories'],
            }),
          });
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ message: responseFromModel.output_text }));
        } catch (error) {
          console.error('Caelus stylist request failed', error);
          response.writeHead(502, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ error: 'The live stylist could not reply' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  return { plugins: [react(), stylistApi(apiKey, env.OPENAI_MODEL || 'gpt-5.6-terra')] };
});
