
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/Logo';


type InvoicePageProps = {
  params: {
    orderId: string;
  };
};

async function getOrderDetails(orderId: string) {
    try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
            return orderSnap.data();
        }
        return null;
    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
    }
}

const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'PENDING':
        case 'PENDING_PAYMENT':
            return 'default';
        case 'PAID':
            return 'secondary';
        case 'SHIPPED':
            return 'outline';
        case 'COMPLETED':
            return 'outline';
        case 'CANCELLED':
            return 'destructive';
        default:
            return 'default';
    }
}

export default async function InvoicePage({ params }: InvoicePageProps) {
    const order = await getOrderDetails(params.orderId);

    if (!order) {
        notFound();
    }

    return (
        <div className="bg-muted/40 py-12">
            <div className="container mx-auto max-w-4xl px-4 md:px-6">
                <Card className="mx-auto w-full max-w-4xl shadow-lg">
                    <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between p-6">
                        <div className="grid gap-2">
                             <Logo />
                            <CardTitle className="text-2xl">Invoice</CardTitle>
                            <CardDescription>Nomor Invoice: {order.orderId}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 text-right">
                           <div>
                             <p className="font-semibold">{order.customerDetails.name}</p>
                             <p className="text-sm text-muted-foreground">{order.customerDetails.phone}</p>
                             <p className="text-sm text-muted-foreground">{order.customerDetails.address}</p>
                           </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-medium text-muted-foreground">Tanggal Pesanan</p>
                                <p>{formatDate(order.createdAt)}</p>
                            </div>
                            <div className='text-right'>
                                <p className="font-medium text-muted-foreground">Status Pembayaran</p>
                                <Badge variant={getStatusVariant(order.paymentDetails.status)} className="mt-1">
                                    {order.paymentDetails.status}
                                </Badge>
                            </div>
                        </div>
                        <Separator className="my-6" />
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produk</TableHead>
                                    <TableHead className='text-center'>Qty</TableHead>
                                    <TableHead className="text-right">Harga</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.product.name}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatRupiah(item.price)}</TableCell>
                                        <TableCell className="text-right">{formatRupiah(item.price * item.quantity)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Separator className="my-6" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="grid gap-2">
                                 <p className="font-medium">Pengiriman</p>
                                 <p className="text-muted-foreground">
                                    {order.shippingDetails.courier} - {order.shippingDetails.service} ({order.shippingDetails.etd} hari)
                                 </p>
                            </div>
                            <div className="grid gap-2 text-right">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatRupiah(order.summary.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Ongkos Kirim</span>
                                    <span>{formatRupiah(order.summary.shippingCost)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-base">
                                    <span>Total</span>
                                    <span>{formatRupiah(order.summary.total)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-4 p-6">
                       {order.paymentDetails.status === 'PENDING' && (
                         <Alert>
                            <AlertTitle>Selesaikan Pembayaran</AlertTitle>
                            <AlertDescription>
                                <p className="mb-2">Silakan transfer sejumlah <strong>{formatRupiah(order.summary.total)}</strong> ke:</p>
                                <div className="border rounded-lg p-3 bg-muted/50">
                                    <p className="font-semibold">{order.paymentDetails.method}</p>
                                    <p className="text-lg font-bold tracking-wider">{order.paymentDetails.vaNumber}</p>
                                </div>
                                <ul className="list-decimal list-inside text-xs mt-3">
                                    <li>Login ke myBCA, m-BCA, atau KlikBCA.</li>
                                    <li>Pilih menu "m-Transfer" > "BCA Virtual Account".</li>
                                    <li>Masukkan nomor Virtual Account di atas dan selesaikan transaksi.</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                       )}
                        <div className="flex w-full justify-end gap-2 print:hidden">
                            <Button variant="outline" onClick={() => window.print()}>Cetak</Button>
                            <Button asChild>
                                <Link href="/">Kembali ke Beranda</Link>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

    