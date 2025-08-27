'use server';

import { z } from 'zod';
import { db, storage } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { revalidatePath } from 'next/cache';

const BannerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  image: z.any().optional(),
});

export async function saveBanner(formData: FormData) {
  const validatedFields = BannerSchema.safeParse({
    title: formData.get('title'),
    subtitle: formData.get('subtitle'),
    image: formData.get('image'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed.',
    };
  }
  
  const { image, ...bannerData } = validatedFields.data;
  let imageUrl = formData.get('currentImageUrl') as string || '';
  const bannerRef = doc(db, 'config', 'homeBanner');

  try {
     if (image && image.size > 0) {
        const imageName = `banner-${Date.now()}-${image.name}`;
        const storageRef = ref(storage, `banners/${imageName}`);
        const buffer = Buffer.from(await image.arrayBuffer());
        await uploadBytes(storageRef, buffer);
        imageUrl = await getDownloadURL(storageRef);
    }
    
    await setDoc(bannerRef, { ...bannerData, imageUrl }, { merge: true });

  } catch (e) {
    console.error(e);
    return { message: 'Database error. Failed to save banner.' };
  }

  revalidatePath('/'); // Revalidate home page to show new banner
  revalidatePath('/admin'); // Revalidate admin to show updated data
  
  return { message: 'Banner updated successfully.' };
}
