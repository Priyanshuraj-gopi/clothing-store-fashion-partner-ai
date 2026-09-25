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
  | 'thanks'
  | 'crm';

export type LeadStatus = 'New' | 'Fitting Room' | 'Styling Active' | 'VIP Client' | 'Completed';

export type CustomerRecord = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  tier: 'Standard' | 'Silver' | 'Gold VIP' | 'Black Diamond';
  status: LeadStatus;
  fitProfile: FitProfile;
  favoriteOccasion: string;
  favoriteStyle: string;
  stylistNotes: string;
  visitCount: number;
  totalSpend: number;
  lastVisit: string;
  fittingRoomAssigned?: string;
  savedOutfitIds: string[];
};

export type StoreAssociate = {
  id: string;
  name: string;
  role: 'Stylist Lead' | 'Floor Associate' | 'Store Manager';
  shiftStatus: 'Active Floor' | 'On Break';
};
