
import type { Product } from './types';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';


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
    
    // If database is empty or fails, return a default static list to ensure page always loads
    if (productList.length === 0) {
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

// Static fallback function
function getDefaultProducts(): Product[] {
    return [
        {
            id: 'ag-1-standard',
            name: 'AG-1 Standard',
            description: 'Performa total untuk setiap pemain, dengan alignment assist.',
            basePrice: 175000,
            imageUrl: 'https://picsum.photos/400/400?random=1',
            customizable: true,
        },
        {
            id: 'ag-1-polos',
            name: 'AG-1 Polos',
            description: 'Desain klasik dan bersih untuk nuansa tradisional.',
            basePrice: 200000,
            imageUrl: 'https://picsum.photos/400/400?random=5',
            customizable: true,
        },
        {
            id: 'ag-2-color-matte',
            name: 'AG-2 Color Matte',
            description: 'Warna cerah dengan hasil akhir matte untuk visibilitas tinggi.',
            basePrice: 200000,
            imageUrl: 'https://picsum.photos/400/400?random=9',
            customizable: true,
        },
        {
            id: 'ag-3-pro-urethane',
            name: 'AG-3 Pro Urethane',
            description: 'Spin dan kontrol tingkat tour dengan cover urethane.',
            basePrice: 300000,
            imageUrl: 'https://picsum.photos/400/400?random=13',
            customizable: true,
        },
        {
            id: 'articogolf-floater',
            name: 'Articogolf Floater',
            description: 'Bola golf inovatif yang dapat mengapung di air. Sempurna untuk latihan di dekat danau atau rintangan air. Kustomisasi tersedia.',
            basePrice: 250000,
            imageUrl: 'https://picsum.photos/400/400?random=20',
            customizable: true,
            isFloater: true,
        }
    ];
}
