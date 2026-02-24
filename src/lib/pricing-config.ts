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
    price: '$1.99',
    originalPrice: '$2.99',
  },
  lifetime: {
    price: '$7.99',
    originalPrice: '$17.99',
  },
};

export const PRICING_IDR = {
  free: {
    price: '$0',
  },
  monthly: {
    price: 'Rp30.000',
    originalPrice: undefined,
  },
  lifetime: {
    price: 'Rp50.000',
    originalPrice: undefined,
  },
};
