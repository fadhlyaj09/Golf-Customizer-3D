
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  basePrice: z.coerce.number().min(0, 'Price must be a positive number'),
  imageUrl: z.string().url('Must be a valid URL'),
  isFloater: z.boolean().default(false),
  customizable: z.boolean().default(true),
});

export type ProductFormState = {
  errors?: {
    name?: string[];
    description?: string[];
    basePrice?: string[];
    imageUrl?: string[];
  };
  message?: string | null;
};


export async function saveProduct(prevState: ProductFormState, formData: FormData) {
  
  const validatedFields = ProductSchema.safeParse({
    id: formData.get('id') || undefined,
    name: formData.get('name'),
    description: formData.get('description'),
    basePrice: formData.get('basePrice'),
    imageUrl: formData.get('imageUrl'),
    isFloater: formData.get('isFloater') === 'on',
    customizable: true,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields.',
    };
  }
  
  const { id, ...productData } = validatedFields.data;
  const productsCollection = collection(db, 'products');

  try {
    if (id) {
      // Update existing product
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, productData);
    } else {
      // Create new product
      const productId = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const productRef = doc(productsCollection, productId);
      await setDoc(productRef, productData);
    }
  } catch (e) {
    console.error(e);
    return { message: 'Database error. Failed to save product.' };
  }

  revalidatePath('/admin');
  revalidatePath('/');
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
