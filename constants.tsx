
import { Product, Doctor } from './types';

export const PRODUCTS: Product[] = [
  { id: '1', name: 'Hydrating Cleanser', price: 25, category: 'Cleanser', image: 'https://picsum.photos/seed/cleanser/200', description: 'Gentle soap-free cleanser.', rating: 4.5 },
  { id: '2', name: 'Retinol Serum', price: 45, category: 'Serum', image: 'https://picsum.photos/seed/retinol/200', description: 'Advanced anti-aging formula.', rating: 4.8 },
  { id: '3', name: 'Mineral Sunscreen', price: 30, category: 'Protection', image: 'https://picsum.photos/seed/sun/200', description: 'SPF 50+ Broad Spectrum.', rating: 4.7 },
  { id: '4', name: 'Moisturizing Cream', price: 20, category: 'Cream', image: 'https://picsum.photos/seed/cream/200', description: 'Deep hydration for 24h.', rating: 4.6 },
];

export const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Sarah Smith', specialty: 'General Dermatology', image: 'https://picsum.photos/seed/dr1/200', availability: ['9:00 AM', '10:00 AM', '2:00 PM'] },
  { id: 'd2', name: 'Dr. John Doe', specialty: 'Cosmetic Specialist', image: 'https://picsum.photos/seed/dr2/200', availability: ['11:00 AM', '1:00 PM', '4:00 PM'] },
];
