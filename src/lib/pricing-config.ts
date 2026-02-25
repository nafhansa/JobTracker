export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: string[];
  currency: 'USD' | 'IDR';
  paymentProvider: 'paddle' | 'midtrans';
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
