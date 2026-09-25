import { inventory } from '../data/inventory';
import { FitProfile, Outfit, Product } from '../types';

export type StyleRequest = {
  occasion: string;
  style: string;
  fit: FitProfile;
  feedback?: string[];
};

const normalize = (value: string) => value.trim().toLowerCase();
const inList = (value: string, list: string[]) => list.some((entry) => normalize(entry) === normalize(value));

// Integration seam: replace this deterministic prototype estimate with an opt-in AI vision service.
export async function analyzeUserImage(): Promise<FitProfile> {
  await new Promise((resolve) => window.setTimeout(resolve, 1100));
  return {
    height: 'Approx. 5′7″',
    size: 'M',
    shoulders: 'Balanced',
    proportions: 'Balanced frame',
    preference: 'Relaxed-tailored',
  };
}

export function generateStyleProfile(fit: FitProfile, occasion: string, style: string) {
  return `${fit.preference} ${style.toLowerCase()} styling for ${occasion.toLowerCase()} plans.`;
}

export function chatWithStylist(occasion: string, style: string) {
  return `Perfect. I’m building ${style.toLowerCase()} looks for ${occasion.toLowerCase()} and prioritising pieces available in this store. ${generateStyleProfile({ preference: 'easy, confident' } as FitProfile, occasion, style)}`;
}

export function rankProducts(request: StyleRequest, category?: Product['category']): Product[] {
  const feedback = request.feedback?.map(normalize) ?? [];
  return inventory
    .filter((product) => product.stock > 0 && (!category || product.category === category))
    .map((product) => {
      let score = 0;
      if (inList(request.occasion, product.occasion)) score += 6;
      if (inList(request.style, product.style)) score += 5;
      if (product.size.includes(request.fit.size) || product.category === 'accessory') score += 2;
      if (feedback.includes('too expensive') && product.price < 3000) score += 5;
      if (feedback.includes('not my style') && inList(request.style, product.style)) score += 4;
      if (feedback.includes("don't like the colour") && ['Black', 'Navy', 'Cream', 'Stone'].includes(product.colour)) score += 2;
      if (feedback.includes("doesn't fit") && product.size.includes(request.fit.size)) score += 3;
      if (['Navy', 'Black', 'Cream', 'Stone', 'Gold'].includes(product.colour)) score += 1;
      return { product, score };
    })
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
    .map(({ product }) => product);
}

function firstUnused(products: Product[], used: Set<string>, offset: number) {
  return products.find((product, index) => index >= offset && !used.has(product.id)) ?? products.find((product) => !used.has(product.id)) ?? products[0];
}

// Integration seam: a real model could return these same Outfit contracts from inventory results.
export function recommendOutfits(request: StyleRequest): Outfit[] {
  const tops = rankProducts(request, 'top');
  const bottoms = rankProducts(request, 'bottom');
  const onePieces = rankProducts(request, 'one-piece');
  const shoes = rankProducts(request, 'shoes');
  const accessories = rankProducts(request, 'accessory');
  const names = [
    ['Midnight Minimal', 'A sleek, intentional palette that feels put-together without trying too hard.'],
    ['Quiet Current', 'Soft tailoring and considered texture make this feel instantly elevated.'],
    ['Afterglow Edit', 'A confident silhouette with one unexpected detail to make the look yours.'],
  ];
  const used = new Set<string>();

  return names.map(([title, explanation], index) => {
    const onePiece = index === 1 ? firstUnused(onePieces, used, index) : undefined;
    const top = onePiece ? undefined : firstUnused(tops, used, index);
    const bottom = onePiece ? undefined : firstUnused(bottoms, used, index);
    const shoe = firstUnused(shoes, used, index);
    const accessory = firstUnused(accessories, used, index);
    [onePiece, top, bottom, shoe, accessory].filter(Boolean).forEach((product) => used.add(product!.id));
    const primary = onePiece ?? top!;
    return {
      id: `look-${index + 1}-${request.occasion.replace(/\s/g, '').toLowerCase()}`,
      title,
      mood: index === 0 ? 'composed & magnetic' : index === 1 ? 'softly tailored' : 'main-character energy',
      itemIds: [onePiece?.id, top?.id, bottom?.id, shoe.id, accessory.id].filter((id): id is string => Boolean(id)),
      explanation: `${explanation} Caelus found ${index === 0 ? '4' : '5'} pieces in your selected fit, all ready in-store.`,
      confidence: 92 - index * 4,
      route: { aisle: primary.aisle, shelf: primary.shelf, walk: `${index + 1} min walk` },
    };
  });
}

export function generateAccessories(cartIds: string[], request: StyleRequest) {
  return rankProducts(request, 'accessory').filter((product) => !cartIds.includes(product.id)).slice(0, 3);
}

export function findStoreLocation(productId: string) {
  const product = inventory.find((item) => item.id === productId);
  if (!product) return null;
  return { aisle: product.aisle, shelf: product.shelf, name: product.name, walk: '2 min walk' };
}

export function generateStylingAdvice(outfit: Outfit) {
  return `${outfit.title} is ${outfit.mood}. Start at ${outfit.route.aisle}, shelf ${outfit.route.shelf}, then follow the gold markers for the finishing pieces.`;
}

export const itemTotal = (itemIds: string[]) => itemIds.reduce((total, id) => total + (inventory.find((product) => product.id === id)?.price ?? 0), 0);
export const productById = (id: string) => inventory.find((product) => product.id === id);
