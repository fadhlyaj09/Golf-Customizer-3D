'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { saveProduct } from '@/actions/productActions';
import { getProductById } from '@/lib/products';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  basePrice: z.coerce.number().min(0, 'Price must be a positive number'),
  image: z.any()
    .refine((file) => {
        if (!file || file.length === 0) return true; // Allow no file on edit
        return file?.[0]?.size <= MAX_FILE_SIZE;
    }, `Max image size is 5MB.`)
    .refine((file) => {
        if (!file || file.length === 0) return true;
        return ACCEPTED_IMAGE_TYPES.includes(file?.[0]?.type);
    }, "Only .jpg, .jpeg, .png and .webp formats are supported."),
  isFloater: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof ProductSchema>;

export default function ProductFormPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const [loading, setLoading] = useState(!!productId);
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      image: undefined,
      isFloater: false,
    },
  });

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setLoading(true);
        const fetchedProduct = await getProductById(productId);
        if (fetchedProduct) {
          form.reset({
             name: fetchedProduct.name,
             description: fetchedProduct.description,
             basePrice: fetchedProduct.basePrice,
             isFloater: fetchedProduct.isFloater,
             id: fetchedProduct.id
          });
          setImagePreview(fetchedProduct.imageUrl);
        }
        setLoading(false);
      };
      fetchProduct();
    }
  }, [productId, form]);

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('basePrice', String(data.basePrice));
    formData.append('isFloater', data.isFloater ? 'on' : 'off');
    
    if (data.id) {
        formData.append('id', data.id);
    }
    if (imagePreview) {
        formData.append('currentImageUrl', imagePreview)
    }

    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }

    startTransition(async () => {
      await saveProduct(undefined, formData);
    });
  };

  if(loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{productId ? 'Edit Produk' : 'Tambah Produk Baru'}</CardTitle>
          <CardDescription>
            Isi detail produk di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
               {productId && <input type="hidden" {...form.register('id')} />}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Produk</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Dasar (IDR)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gambar Produk</FormLabel>
                             <FormControl>
                                <Input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        field.onChange(e.target.files);
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setImagePreview(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        } else {
                                            setImagePreview(null);
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 {imagePreview && (
                    <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Pratinjau Gambar:</p>
                        <Image src={imagePreview} alt="Image preview" width={100} height={100} className="rounded-md object-cover" />
                    </div>
                )}
              <FormField
                control={form.control}
                name="isFloater"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Ini adalah produk bola floater (harga tidak ditampilkan)
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-4">
                <Button variant="outline" asChild type="button">
                  <Link href="/admin">Batal</Link>
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Produk
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
