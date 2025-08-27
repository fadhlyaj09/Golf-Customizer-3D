
import type { Product } from './types';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { getDefaultProducts } from './static-data';


export const ALL_PRODUCTS_CACHE_TAG = 'products';

/**
 * Fetches all products from the 'products' collection in Firestore.
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    const productSnapshot = await getDocs(productsCol);
    const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    
    // If database is empty, return a default static list to ensure page always loads
    if (productList.length === 0) {
      console.warn("Firestore 'products' collection is empty. Falling back to default products.");
      return getDefaultProducts();
    }
    
    return productList;
  } catch (error) {
    console.error("Error fetching products from Firestore, returning default list:", error);
    return getDefaultProducts(); 
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
      console.warn(`Product with id ${id} not found in Firestore. Checking default products.`);
      // Fallback to default products if not found in DB
      return getDefaultProducts().find(p => p.id === id);
    }
  } catch (error) {
    console.error(`Error fetching product with id ${id} from Firestore, checking defaults:`, error);
     return getDefaultProducts().find(p => p.id === id);
  }
}
