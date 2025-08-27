import type { Product } from './types';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';


export const ALL_PRODUCTS_CACHE_TAG = 'products';

// This file now fetches products from Firestore instead of having a static list.

/**
 * Fetches all products from the 'products' collection in Firestore.
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    const productSnapshot = await getDocs(productsCol);
    const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    return productList;
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
    return []; // Return empty array on error
  }
}

/**
 * Fetches a single product by its ID from the 'products' collection in Firestore.
 * @param {string} id The ID of the product to fetch.
 * @returns {Promise<Product | undefined>} A promise that resolves to the product or undefined if not found.
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      return { id: productSnap.id, ...productSnap.data() } as Product;
    } else {
      console.warn(`Product with id ${id} not found in Firestore.`);
      return undefined;
    }
  } catch (error) {
    console.error(`Error fetching product with id ${id} from Firestore:`, error);
    return undefined;
  }
}
