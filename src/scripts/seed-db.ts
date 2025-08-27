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
    imageUrl: '/images/ag-1-standard-1.jpg',
    gallery: [
        '/images/ag-1-standard-1.jpg',
        '/images/ag-1-standard-2.jpg',
        '/images/ag-1-standard-3.jpg'
    ],
    customizable: true,
  },
  {
    name: 'AG-1 Polos',
    description: 'Desain klasik dan bersih untuk nuansa tradisional.',
    basePrice: 200000,
    imageUrl: '/images/ag-1-polos-1.jpg',
    gallery: [
        '/images/ag-1-polos-1.jpg',
        '/images/ag-1-polos-2.jpg',
        '/images/ag-1-polos-3.jpg'
    ],
    customizable: true,
  },
  {
    name: 'AG-2 Color Matte',
    description: 'Warna cerah dengan hasil akhir matte untuk visibilitas tinggi.',
    basePrice: 200000,
    imageUrl: '/images/ag-2-matte-1.jpg',
    gallery: [
        '/images/ag-2-matte-1.jpg',
        '/images/ag-2-matte-2.jpg',
        '/images/ag-2-matte-3.jpg'
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
    imageUrl: '/images/ag-3-pro-1.jpg',
    gallery: [
        '/images/ag-3-pro-1.jpg',
        '/images/ag-3-pro-2.jpg',
        '/images/ag-3-pro-3.jpg'
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
