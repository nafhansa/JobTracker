export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: string[];
  currency: 'USD' | 'IDR';
}

export const LIFETIME_ACCESS_LIMIT = 20;

export const PRICING_USD = {
  free: {
    price: '$0',
  },
  monthly: {
    price: '$2.66',
    originalPrice: '$2.99',
    discount: '11.13%',
  },
  lifetime: {
    price: '$7.16',
    originalPrice: '$7.99',
    discount: '10.36%',
  },
};

export const PRICING_IDR = {
  free: {
    price: 'Rp 0',
  },
  monthly: {
    price: 'Rp31.988',
    originalPrice: 'Rp36.000',
    discount: '11.13%',
  },
  lifetime: {
    price: 'Rp51.988',
    originalPrice: 'Rp58.000',
    discount: '10.36%',
  },
};

export const WEEKLY_COINS_BY_PLAN = {
  free: 240,
  monthly: 400,
  lifetime: 400,
};

export const COIN_PACKAGES = [
  { id: 'jalur-doa', name: 'Jalur Doa', label: 'Jalur Doa', coins: 1000, price_idr: 10000, description: '12x generate', is_active: true },
  { id: 'mulai-panik', name: 'Mulai Panik', label: 'Mulai Panik', coins: 2200, price_idr: 20000, description: '27x generate', is_active: true },
  { id: 'budak-korporat', name: 'Budak Korporat', label: 'Budak Korporat', coins: 4500, price_idr: 40000, description: '56x generate', is_active: true },
];