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

export const WEEKLY_CREDITS_BY_PLAN = {
  free: 1,
  monthly: 5,
  lifetime: 10,
};

export const CREDIT_PACKAGES = [
  { id: 'starter', name: 'Starter', credits: 5, price_idr: 9900, price_usd: 0.99 },
  { id: 'popular', name: 'Popular', credits: 15, price_idr: 24900, price_usd: 2.49 },
  { id: 'best-value', name: 'Best Value', credits: 50, price_idr: 64900, price_usd: 5.99 },
];
