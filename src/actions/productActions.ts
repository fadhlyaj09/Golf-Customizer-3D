
'use server';

import { z } from 'zod';
import { db, storage } from '@/lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  basePrice: z.coerce.number().min(0, 'Price must be a positive number'),
  image: z.any().optional(),
  isFloater: z.boolean().default(false),
  customizable: z.boolean().default(true),
});

export type ProductFormState = {
  errors?: {
    name?: string[];
    description?: string[];
    basePrice?: string[];
    image?: string[];
  };
  message?: string | null;
};


export async function saveProduct(prevState: ProductFormState, formData: FormData) {

  const validatedFields = ProductSchema.safeParse({
    id: formData.get('id') || undefined,
    name: formData.get('name'),
    description: formData.get('description'),
    basePrice: formData.get('basePrice'),
    image: formData.get('image'),
    isFloater: formData.get('isFloater') === 'on',
    customizable: true,
  });
  

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields.',
    };
  }
  
  const { id, image, ...productData } = validatedFields.data;
  let imageUrl = formData.get('currentImageUrl') as string || '';
  const productId = id || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');


  try {
     if (image && image.size > 0) {
        // Upload new image
        const imageName = `${Date.now()}-${image.name}`;
        const storageRef = ref(storage, `products/${imageName}`);
        const buffer = Buffer.from(await image.arrayBuffer());
        await uploadBytes(storageRef, buffer);
        imageUrl = await getDownloadURL(storageRef);
    }
    
    const dataToSave = { ...productData, imageUrl, id: productId };
    const productRef = doc(db, 'products', productId);

    if (id) {
      // Update existing product
      await updateDoc(productRef, dataToSave);
    } else {
      // Create new product with a specific ID
      await setDoc(productRef, dataToSave);
    }
  } catch (e) {
    console.error(e);
    return { message: 'Database error. Failed to save product.' };
  }

  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath(`/product/${productId}`);
  redirect('/admin');
}


export async function deleteProduct(id: string) {
    if (!id) {
        throw new Error('Product ID is required to delete.');
    }
    try {
        const productRef = doc(db, 'products', id);
        await deleteDoc(productRef);
        revalidatePath('/admin');
        revalidatePath('/');
    } catch(e) {
        console.error(e);
        throw new Error('Failed to delete product from database.');
    }
}
