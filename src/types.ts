export type Category = 'top' | 'bottom' | 'shoes' | 'accessory' | 'one-piece';

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: Category;
  gender: 'unisex' | 'women' | 'men';
  price: number;
  colour: string;
  size: string[];
  style: string[];
  occasion: string[];
  aisle: string;
  shelf: string;
  stock: number;
  image: string;
  description: string;
};

export type FitProfile = {
  height: string;
  size: string;
  shoulders: string;
  proportions: string;
  preference: string;
};

export type Outfit = {
  id: string;
  title: string;
  mood: string;
  itemIds: string[];
  explanation: string;
  confidence: number;
  route: { aisle: string; shelf: string; walk: string };
};

export type CartLine = { productId: string; quantity: number };

export type Screen =
  | 'landing'
  | 'analysis'
  | 'chat'
  | 'looks'
  | 'saved'
  | 'cart'
  | 'checkout'
  | 'thanks';
