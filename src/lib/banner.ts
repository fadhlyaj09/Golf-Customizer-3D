import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Banner } from './types';

export async function getBanner(): Promise<Partial<Banner>> {
  try {
    const bannerRef = doc(db, 'config', 'homeBanner');
    const bannerSnap = await getDoc(bannerRef);

    if (bannerSnap.exists()) {
      return bannerSnap.data() as Banner;
    }
    // Return default/empty object if not found, so page doesn't crash
    return {
        title: '',
        subtitle: '',
        imageUrl: ''
    };
  } catch (error) {
    console.error("Error fetching banner from Firestore:", error);
    return {
        title: '',
        subtitle: '',
        imageUrl: ''
    };
  }
}
