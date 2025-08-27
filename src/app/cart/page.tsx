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
import { Separator } from '@/components/ui/separator';

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

    return details.map((d, i) => <p key={i} className="text-xs text-muted-foreground">{d}</p>)
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <XCircle className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added any custom golf balls yet.</p>
        <Button asChild className="mt-6">
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground mt-1">Review your items and proceed to checkout.</p>
        </div>
        <Button onClick={clearCartSelection} variant="link" className="text-muted-foreground">Clear All Selections</Button>
      </div>
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
            <Card className='shadow-none border-0'>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[20px]"></TableHead>
                            <TableHead colSpan={2}>Product</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Total Price</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {cart.map((item) => (
                            <TableRow key={item.id} data-state={item.selected ? 'selected' : ''} className='border-b'>
                             <TableCell>
                                <Checkbox
                                    checked={item.selected}
                                    onCheckedChange={() => toggleItemSelected(item.id)}
                                />
                             </TableCell>
                            <TableCell className="w-[100px] p-2">
                                <div className="relative h-24 w-24 rounded-md overflow-hidden">
                                <Image
                                    src={(item.customization.side1?.type === 'logo' && item.customization.side1.content) || item.product.imageUrl}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                />
                                </div>
                            </TableCell>
                            <TableCell className="font-medium align-top py-4">
                                <p className="font-bold text-base">{item.product.name}</p>
                                <div className="mt-1">
                                    {renderCustomizationDetails(item.customization)}
                                </div>
                            </TableCell>
                            <TableCell className="align-top py-4">
                                <div className="flex items-center justify-center gap-1 sm:gap-2">
                                    <Button variant="outline" size="icon" className='h-8 w-8' onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                        className="h-8 w-14 text-center"
                                    />
                                    <Button variant="outline" size="icon" className='h-8 w-8' onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-medium align-top py-4">{formatRupiah(item.price * item.quantity)}</TableCell>
                            <TableCell className="align-top py-4">
                                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                                    <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-4">
          <Card className="sticky top-24 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                Only selected items will be processed.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex justify-between">
                <span className='text-muted-foreground'>Subtotal ({selectedItems.length} item)</span>
                <span>{formatRupiah(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className='text-muted-foreground'>Shipping</span>
                <Link href="/checkout" className='text-primary font-medium underline text-sm'>Calculate at checkout</Link>
              </div>
              <Separator className='my-2'/>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatRupiah(total)}</span>
              </div>
              <Button onClick={handleCheckout} size="lg" className="w-full mt-4" disabled={selectedItems.length === 0}>
                  Proceed to Checkout ({selectedItems.length}) <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
