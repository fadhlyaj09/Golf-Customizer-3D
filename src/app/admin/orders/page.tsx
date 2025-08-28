
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

async function getOrders() {
    try {
        const ordersCol = collection(db, 'orders');
        // Order by creation date, descending
        const q = query(ordersCol, orderBy('createdAt', 'desc'));
        const orderSnapshot = await getDocs(q);
        const orderList = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return orderList;
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
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
        hour: '2-digit',
        minute: '2-digit',
    });
}

const getStatusVariant = (status: string) => {
    switch (status) {
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


export default async function OrdersPage() {
    const orders = await getOrders();

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground mb-8">View and manage customer orders.</p>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Payment Status</TableHead>
                                <TableHead>Order Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {orders.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium text-primary hover:underline cursor-pointer">{order.orderId}</TableCell>
                                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                                    <TableCell>{order.customerDetails.name}</TableCell>
                                    <TableCell>{formatRupiah(order.summary.total)}</TableCell>
                                    <TableCell>
                                        <Badge variant={order.paymentDetails.status === 'PENDING' ? 'default' : 'secondary'}>
                                            {order.paymentDetails.status}
                                        </Badge>
                                    </TableCell>
                                     <TableCell>
                                        <Badge variant={getStatusVariant(order.orderStatus)}>
                                            {order.orderStatus.replace(/_/g, ' ')}
                                        </Badge>
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
