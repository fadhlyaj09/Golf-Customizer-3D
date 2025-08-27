
// This script is used to seed the Firestore database with initial product data.
// To run it, use: `npx tsx src/scripts/seed-db.ts`
// Make sure you have Firestore configured in your firebase.ts and have the necessary permissions.

import { db } from '../lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import type { Product } from '../lib/types';
import { getDefaultProducts } from '../lib/static-data';

// The static product data we want to upload.
const productsToSeed: Product[] = getDefaultProducts();


async function seedDatabase() {
  const productsCollection = collection(db, 'products');
  const batch = writeBatch(db);

  console.log('Starting to seed products...');

  productsToSeed.forEach((product) => {
    // The ID is already in the product object from getDefaultProducts
    const docRef = doc(productsCollection, product.id);
    batch.set(docRef, product);
    console.log(`Preparing to add: ${product.name} (ID: ${product.id})`);
  });

  try {
    await batch.commit();
    console.log('✅ Successfully seeded the database with products!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seedDatabase();
