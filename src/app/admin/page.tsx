
import { getProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { deleteProduct } from '@/actions/productActions';
import BannerEditor from '@/components/BannerEditor';

function DeleteProductForm({ id }: { id: string }) {
  const deleteProductWithId = deleteProduct.bind(null, id);
  return (
    <form action={deleteProductWithId}>
       <button type="submit" className="w-full text-left relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive hover:text-white focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
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
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage your website's products and content.</p>
                </div>
            </div>

            <div className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Banner Management</CardTitle>
                        <CardDescription>Change the image, title, and subtitle of the main banner.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BannerEditor />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className='flex justify-between items-start'>
                            <div>
                                <CardTitle>Product Management</CardTitle>
                                <CardDescription>Add, edit, or delete your products.</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/admin/product-form">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Product
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="hidden sm:table-cell">
                                            <Image
                                                src={product.imageUrl || 'https://placehold.co/64x64'}
                                                alt={product.name}
                                                width={64}
                                                height={64}
                                                className="rounded-md object-cover"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.isFloater ? "Contact for Price" : formatRupiah(product.basePrice)}</TableCell>
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
                                                        <Link href={`/admin/product-form?id=${product.id}`} className='flex items-center w-full'>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DeleteProductForm id={product.id} />
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
        </div>
    );
}
