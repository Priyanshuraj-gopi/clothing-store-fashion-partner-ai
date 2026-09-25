import { FitProfile } from '../types';

export type StylistChatPayload = {
  message: string;
  occasion: string;
  style: string;
  fit: FitProfile;
  conversation: Array<{ role: 'ai' | 'user'; text: string }>;
};

export async function getLiveStylistReply(payload: StylistChatPayload): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch('/api/stylist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = (await response.json()) as { message?: string };
      if (data.message && data.message.trim().length > 0) {
        return data.message;
      }
    }
  } catch {
    clearTimeout(timeoutId);
  }

  // Graceful offline/static hosting heuristic styling response
  const { message, occasion, style, fit } = payload;
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('budget') || lowerMsg.includes('cheap') || lowerMsg.includes('price')) {
    return `Understood. I have prioritized versatile in-stock pieces under ₹3,000 in your ${fit.size} size that deliver high value without sacrificing the ${style.toLowerCase()} aesthetic.`;
  }
  if (lowerMsg.includes('black') || lowerMsg.includes('color') || lowerMsg.includes('colour') || lowerMsg.includes('blue')) {
    return `Great note on tones. I’ve balanced this ${occasion.toLowerCase()} look with neutral foundational pieces so the palette feels intentional and cohesive.`;
  }
  if (lowerMsg.includes('formal') || lowerMsg.includes('wedding') || lowerMsg.includes('party')) {
    return `For ${occasion.toLowerCase()}, structured tailoring in your ${fit.preference.toLowerCase()} fit will look sharp. You can find key statement pieces right in Aisle A & B.`;
  }

  return `Noted: “${message}”. I’ve calibrated your ${fit.size} ${fit.preference.toLowerCase()} fit with our ${style.toLowerCase()} floor inventory for ${occasion.toLowerCase()}. Let’s take a look at the curated options.`;
}
