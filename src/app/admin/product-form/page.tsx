
'use client';

import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { saveProduct } from '@/actions/productActions';
import { getProductById } from '@/lib/products';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  basePrice: z.coerce.number().min(0, 'Price must be a positive number'),
  imageUrl: z.string().url('Must be a valid URL'),
  isFloater: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof ProductSchema>;

function SubmitButton() {
    // This is a placeholder as useFormStatus is not available in client components directly
    // A more complex solution would be needed for pending state without experimental features
    return (
        <Button type="submit">
            Simpan Produk
        </Button>
    )
}

export default function ProductFormPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      imageUrl: '',
      isFloater: false,
    },
  });

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setLoading(true);
        const fetchedProduct = await getProductById(productId);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          form.reset(fetchedProduct);
        }
        setLoading(false);
      };
      fetchProduct();
    } else {
        setLoading(false);
    }
  }, [productId, form]);

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
          <form action={saveProduct} className="flex flex-col gap-6">
            <input type="hidden" name="id" value={productId || ''} />
             <div>
                <Label htmlFor="name">Nama Produk</Label>
                <Input id="name" name="name" defaultValue={product?.name} className="mt-1"/>
            </div>
             <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea id="description" name="description" defaultValue={product?.description} className="mt-1" />
            </div>
             <div>
                <Label htmlFor="basePrice">Harga Dasar (IDR)</Label>
                <Input id="basePrice" name="basePrice" type="number" defaultValue={product?.basePrice} className="mt-1" />
            </div>
            <div>
                <Label htmlFor="imageUrl">URL Gambar</Label>
                <Input id="imageUrl" name="imageUrl" defaultValue={product?.imageUrl} className="mt-1" />
            </div>
             <div className="flex items-center space-x-2">
                <input type="checkbox" id="isFloater" name="isFloater" defaultChecked={product?.isFloater} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <Label htmlFor="isFloater">Ini adalah produk bola floater</Label>
            </div>
            <div className="flex justify-end gap-4">
                 <Button variant="outline" asChild>
                    <Link href="/admin">Batal</Link>
                </Button>
                <Button type="submit">
                    Simpan Produk
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
