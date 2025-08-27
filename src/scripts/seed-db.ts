
// This script is used to seed the Firestore database with initial product data.
// To run it, use: `npx tsx src/scripts/seed-db.ts`
// Make sure you have Firestore configured in your firebase.ts and have the necessary permissions.

import { db } from '../lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import type { Product } from '../lib/types';

// The static product data we want to upload.
const productsToSeed: Omit<Product, 'id'>[] = [
  {
    name: 'AG-1 Standard',
    description: 'Performa total untuk setiap pemain, dengan alignment assist.',
    basePrice: 175000,
    imageUrl: 'https://picsum.photos/400/400?random=1',
    gallery: [
        'https://picsum.photos/400/400?random=2',
        'https://picsum.photos/400/400?random=3',
        'https://picsum.photos/400/400?random=4'
    ],
    customizable: true,
  },
  {
    name: 'AG-1 Polos',
    description: 'Desain klasik dan bersih untuk nuansa tradisional.',
    basePrice: 200000,
    imageUrl: 'https://picsum.photos/400/400?random=5',
    gallery: [
        'https://picsum.photos/400/400?random=6',
        'https://picsum.photos/400/400?random=7',
        'https://picsum.photos/400/400?random=8'
    ],
    customizable: true,
  },
  {
    name: 'AG-2 Color Matte',
    description: 'Warna cerah dengan hasil akhir matte untuk visibilitas tinggi.',
    basePrice: 200000,
    imageUrl: 'https://picsum.photos/400/400?random=9',
    gallery: [
        'https://picsum.photos/400/400?random=10',
        'https://picsum.photos/400/400?random=11',
        'https://picsum.photos/400/400?random=12'
    ],
    customizable: true,
    colors: [
      { name: 'Mix Color', hex: '#FFFFFF' },
      { name: 'Pink', hex: '#FFC0CB' },
      { name: 'Green', hex: '#90EE90' },
      { name: 'Yellow', hex: '#FFFFE0' },
      { name: 'Orange', hex: '#FFA500' },
    ],
  },
  {
    name: 'AG-3 Pro Urethane',
    description: 'Spin dan kontrol tingkat tour dengan cover urethane.',
    basePrice: 300000,
    imageUrl: 'https://picsum.photos/400/400?random=13',
    gallery: [
        'https://picsum.photos/400/400?random=14',
        'https://picsum.photos/400/400?random=15',
        'https://picsum.photos/400/400?random=16'
    ],
    customizable: true,
  },
  {
    name: 'Articogolf Floater',
    description: 'Bola golf inovatif yang dapat mengapung di air. Sempurna untuk latihan di dekat danau atau rintangan air. Kustomisasi tersedia.',
    basePrice: 250000,
    imageUrl: 'https://picsum.photos/400/400?random=20',
    gallery: [
        'https://picsum.photos/400/400?random=21',
        'https://picsum.photos/400/400?random=22',
        'https://picsum.photos/400/400?random=23'
    ],
    customizable: true,
    isFloater: true,
  },
];


async function seedDatabase() {
  const productsCollection = collection(db, 'products');
  const batch = writeBatch(db);

  console.log('Starting to seed products...');

  productsToSeed.forEach((productData) => {
    // Create a URL-friendly ID from the product name
    const productId = productData.name.toLowerCase().replace(/\s+/g, '-');
    const docRef = doc(productsCollection, productId);
    batch.set(docRef, productData);
    console.log(`Preparing to add: ${productData.name} (ID: ${productId})`);
  });

  try {
    await batch.commit();
    console.log('✅ Successfully seeded the database with products!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seedDatabase();
