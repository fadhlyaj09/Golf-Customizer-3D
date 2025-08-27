import type { Product } from './types';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';


export const ALL_PRODUCTS_CACHE_TAG = 'products';

// This file now fetches products from Firestore instead of having a static list.

/**
 * Fetches all products from the 'products' collection in Firestore.
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    // Removed orderBy clause to prevent indexing issues. Sorting can be done client-side if needed.
    const q = query(productsCol);
    const productSnapshot = await getDocs(q);
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
    if (!id) return undefined;
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      return { id: productSnap.id, ...productSnap.data() } as Product;
    } else {
      console.warn(`Product with id ${id} not found in Firestore.`);
      // Fallback: search by id field if doc.id doesn't match
      const q = query(collection(db, 'products'), where('id', '==', id));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Product;
      }
      return undefined;
    }
  } catch (error) {
    console.error(`Error fetching product with id ${id} from Firestore:`, error);
    return undefined;
  }
}
