import { FitProfile } from '../types';

export type StylistChatPayload = {
  message: string;
  occasion: string;
  style: string;
  fit: FitProfile;
  conversation: Array<{ role: 'ai' | 'user'; text: string }>;
};

export async function getLiveStylistReply(payload: StylistChatPayload) {
  const response = await fetch('/api/stylist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Live stylist is not configured');
  const data = await response.json() as { message?: string };
  if (!data.message) throw new Error('Live stylist returned no message');
  return data.message;
}
