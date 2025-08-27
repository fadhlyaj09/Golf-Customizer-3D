'use client';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, Trash2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Customization } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, toggleItemSelected, clearCartSelection } = useCart();
  const router = useRouter();

  const selectedItems = cart.filter(item => item.selected);
  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (selectedItems.length > 0) {
      router.push('/checkout');
    }
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }
  
  const renderCustomizationDetails = (customization: Customization) => {
    const details = [];
    if (customization.color) details.push(`Warna: ${customization.color.name}`);

    if (customization.printSides > 0) {
      details.push(`Print: ${customization.printSides} sisi`);
      if (customization.side1?.type !== 'none') {
        details.push(`Sisi 1: ${customization.side1.type === 'logo' ? 'Logo' : `Teks "${customization.side1.content}"`}`);
      }
      if (customization.side2?.type !== 'none') {
        details.push(`Sisi 2: ${customization.side2.type === 'logo' ? 'Logo' : `Teks "${customization.side2.content}"`}`);
      }
    } else {
        details.push('Print: Tanpa Print');
    }

    return details.map((d, i) => <p key={i}>{d}</p>)
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <XCircle className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Keranjang Anda Kosong</h1>
        <p className="mt-2 text-muted-foreground">Sepertinya Anda belum menambahkan bola golf custom.</p>
        <Button asChild className="mt-6">
          <Link href="/">Mulai Belanja</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className='flex justify-between items-center mb-8'>
        <h1 className="text-3xl font-bold tracking-tight">Keranjang Belanja</h1>
        <Button onClick={clearCartSelection} variant="link">Hapus Pilihan</Button>
      </div>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[20px]"></TableHead>
                            <TableHead className="w-[100px]">Produk</TableHead>
                            <TableHead>Detail</TableHead>
                            <TableHead className="text-center">Jumlah</TableHead>
                            <TableHead className="text-right">Harga</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {cart.map((item) => (
                            <TableRow key={item.id} data-state={item.selected ? 'selected' : ''}>
                             <TableCell>
                                <Checkbox
                                    checked={item.selected}
                                    onCheckedChange={() => toggleItemSelected(item.id)}
                                />
                             </TableCell>
                            <TableCell>
                                <div className="relative h-20 w-20">
                                <Image
                                    src={(item.customization.side1?.type === 'logo' && item.customization.side1.content) || item.product.imageUrl}
                                    alt={item.product.name}
                                    fill
                                    className="rounded-md object-cover"
                                />
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">
                                <p className="font-bold">{item.product.name}</p>
                                <div className="text-xs text-muted-foreground">
                                    {renderCustomizationDetails(item.customization)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-center gap-1 sm:gap-2">
                                    <Button variant="outline" size="icon" className='h-8 w-8' onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                        className="h-8 w-12 text-center"
                                    />
                                    <Button variant="outline" size="icon" className='h-8 w-8' onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">{formatRupiah(item.price * item.quantity)}</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
              <CardDescription>
                Hanya item yang dipilih akan diproses.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex justify-between">
                <span>Subtotal ({selectedItems.length} item)</span>
                <span>{formatRupiah(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pengiriman</span>
                <Link href="/checkout" className='text-primary font-medium underline text-sm'>Hitung di checkout</Link>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-4 mt-2">
                <span>Total</span>
                <span>{formatRupiah(total)}</span>
              </div>
              <Button onClick={handleCheckout} size="lg" className="w-full mt-4" disabled={selectedItems.length === 0}>
                  Lanjut ke Checkout ({selectedItems.length}) <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
