'use client';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState } from 'react';
import { getShippingCost, getCities, getProvinces, City, Province, ShippingCost } from '@/actions/shippingActions';
import Select from 'react-select';
import { Textarea } from '@/components/ui/textarea';


const checkoutSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  address: z.string().min(10, 'Address is too short'),
  province: z.object({ value: z.string(), label: z.string() }),
  city: z.object({ value: z.string(), label: z.string() }),
  zip: z.string().min(5, 'Invalid ZIP code'),
  courier: z.object({ value: z.string(), label: z.string() }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [shippingCosts, setShippingCosts] = useState<ShippingCost[] | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingCost | null>(null);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '', email: '', phone: '', address: '', zip: ''
    }
  });

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = totalQuantity * 600; // 600g per box
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + (selectedShipping?.cost[0].value || 0);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const provinceData = await getProvinces();
        setProvinces(provinceData);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load provinces.', variant: 'destructive' });
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, [toast]);

  const selectedProvinceId = form.watch('province')?.value;
  const selectedCityId = form.watch('city')?.value;
  const selectedCourier = form.watch('courier')?.value;

  useEffect(() => {
    if (selectedProvinceId) {
      const fetchCities = async () => {
        setIsLoadingCities(true);
        form.setValue('city', null as any); // Reset city
        try {
          const cityData = await getCities(selectedProvinceId);
          setCities(cityData);
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to load cities.', variant: 'destructive' });
        } finally {
          setIsLoadingCities(false);
        }
      };
      fetchCities();
    }
  }, [selectedProvinceId, form, toast]);

  useEffect(() => {
      if(selectedCityId && selectedCourier && totalWeight > 0) {
          const fetchShipping = async () => {
              setIsLoadingShipping(true);
              setShippingCosts(null);
              setSelectedShipping(null);
              try {
                  const shippingData = await getShippingCost({
                      destination: selectedCityId,
                      weight: totalWeight,
                      courier: selectedCourier,
                  });
                  setShippingCosts(shippingData[0].costs);
              } catch(error) {
                  toast({ title: 'Error', description: 'Failed to load shipping options.', variant: 'destructive' });
              } finally {
                  setIsLoadingShipping(false);
              }
          }
          fetchShipping();
      }
  }, [selectedCityId, selectedCourier, totalWeight, toast]);


  const onSubmit = (data: CheckoutFormValues) => {
    console.log('Order placed:', {...data, total, selectedShipping});
    toast({
      title: 'Order Placed!',
      description: 'Thank you for your purchase. Your custom golf balls are on the way!',
    });
    clearCart();
    router.push('/');
  };

  if (cart.length === 0 && form.formState.isSubmitted === false) {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold tracking-tight">Your cart is empty.</h1>
            <p className="mt-2 text-muted-foreground">Add items to your cart to proceed to checkout.</p>
            <Button asChild variant="link" className="mt-4">
                <Link href="/cart"><ArrowLeft className="mr-2 h-4 w-4" />Back to Cart</Link>
            </Button>
        </div>
    );
  }

  const courierOptions = [
      { value: 'jne', label: 'JNE' },
      { value: 'pos', label: 'POS Indonesia' },
      { value: 'tiki', label: 'TIKI' },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Alamat Pengiriman</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Nomor Telepon</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Alamat Lengkap</FormLabel><FormControl><Textarea {...field} placeholder="Nama jalan, nomor rumah, kelurahan, kecamatan..." /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Provinsi</FormLabel>
                            <FormControl>
                            <Select
                                {...field}
                                options={provinces.map(p => ({ value: p.province_id, label: p.province }))}
                                isLoading={isLoadingProvinces}
                                placeholder="Pilih Provinsi"
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kota/Kabupaten</FormLabel>
                            <FormControl>
                            <Select
                                {...field}
                                options={cities.map(c => ({ value: c.city_id, label: `${c.type} ${c.city_name}`}))}
                                isLoading={isLoadingCities}
                                isDisabled={!selectedProvinceId || isLoadingCities}
                                placeholder="Pilih Kota/Kab."
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <FormField control={form.control} name="zip" render={({ field }) => (
                    <FormItem><FormLabel>Kode Pos</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                
                <h3 className="text-lg font-semibold pt-4 border-t">Opsi Pengiriman</h3>
                 <FormField
                    control={form.control}
                    name="courier"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Kurir</FormLabel>
                        <FormControl>
                           <Select {...field} options={courierOptions} isDisabled={!selectedCityId} placeholder="Pilih Kurir" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 {isLoadingShipping && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Mencari opsi pengiriman...</span>
                    </div>
                 )}
                 {shippingCosts && (
                    <div className="flex flex-col gap-2">
                        {shippingCosts.map(cost => (
                            <label key={cost.service} className={cn(
                                "flex justify-between items-center p-3 border rounded-lg cursor-pointer",
                                selectedShipping?.service === cost.service && "border-primary ring-2 ring-primary"
                            )} onClick={() => setSelectedShipping(cost)}>
                                <div>
                                    <p className="font-semibold">{cost.service} ({cost.description})</p>
                                    <p className="text-sm text-muted-foreground">Estimasi {cost.cost[0].etd} hari</p>
                                </div>
                                <p className="font-bold">{formatRupiah(cost.cost[0].value)}</p>
                            </label>
                        ))}
                    </div>
                 )}
            </CardContent>
          </Card>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Image src={(item.customization.side1?.type === 'logo' && item.customization.side1.content) || item.product.imageUrl} alt={item.product.name} width={64} height={64} className="rounded-md object-cover" />
                        <div>
                          <p className="font-medium">{item.product.name} x {item.quantity}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatRupiah(item.price)} per box
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">{formatRupiah(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t pt-6 space-y-2">
                   <div className="flex justify-between">
                        <span>Subtotal ({totalQuantity} box)</span>
                        <span>{formatRupiah(subtotal)}</span>
                   </div>
                    <div className="flex justify-between">
                        <span>Berat</span>
                        <span>{(totalWeight / 1000).toFixed(2)} kg</span>
                   </div>
                   <div className="flex justify-between">
                        <span>Pengiriman</span>
                        <span>{selectedShipping ? formatRupiah(selectedShipping.cost[0].value) : 'Pilih kurir'}</span>
                   </div>
                   <div className="flex justify-between text-lg font-bold border-t pt-4 mt-2">
                        <span>Total</span>
                        <span>{formatRupiah(total)}</span>
                   </div>
                </div>
              </CardContent>
            </Card>
             <Button type="submit" size="lg" className="w-full" disabled={!selectedShipping}>
                Bayar Sekarang
             </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
