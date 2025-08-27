import { getProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { deleteProduct } from '@/actions/productActions';
import { revalidatePath } from 'next/cache';

function DeleteProduct({ id }: { id: string }) {
  const deleteProductWithId = async () => {
    'use server';
    try {
      await deleteProduct(id);
      revalidatePath('/admin');
    } catch(e) {
        console.error(e)
    }
  };
  return (
    <form action={deleteProductWithId}>
       <button type="submit" className="w-full text-left">
          <DropdownMenuItem className="text-red-600 cursor-pointer">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
       </button>
    </form>
  );
}

export default async function AdminPage() {
    const products = await getProducts();

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Manajemen Produk</h1>
                    <p className="text-muted-foreground">Tambah, edit, atau hapus produk Anda.</p>
                </div>
                 <Button asChild>
                    <Link href="/admin/product-form">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Produk
                    </Link>
                </Button>
            </div>
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Gambar</TableHead>
                                <TableHead>Nama Produk</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            width={64}
                                            height={64}
                                            className="rounded-md object-cover"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.isFloater ? "Hubungi" : formatRupiah(product.basePrice)}</TableCell>
                                    <TableCell className="text-right">
                                       <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/product-form?id=${product.id}`}>Edit</Link>
                                                </DropdownMenuItem>
                                                <DeleteProduct id={product.id} />
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
