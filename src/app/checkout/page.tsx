
'use client';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Sparkles, Truck } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState, useCallback, useTransition } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { Address, City, Province, ShippingCost } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import Select from 'react-select';
import { getCities, getProvinces, getShippingCost } from '@/actions/shippingActions';


const checkoutSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  phone: z.string().min(10, 'Invalid phone number'),
  province: z.object({ value: z.string(), label: z.string() }).nullable(),
  city: z.object({ value: z.string(), label: z.string() }).nullable(),
  address: z.string().min(10, 'Address is too short'),
  zip: z.string().min(5, 'Invalid ZIP code'),
  saveAddress: z.boolean().default(false),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

function isSameDayEligible(quantity: number) {
    if (quantity > 5) return false;
    const now = new Date();
    // WIB is UTC+7, so 15:00 WIB is 8:00 UTC
    const cutoff = new Date();
    cutoff.setUTCHours(8, 0, 0, 0);
    // Not on Sunday (0)
    return now.getDay() !== 0 && now.getTime() < cutoff.getTime();
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user, loading: userLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const selectedItems = cart.filter(item => item.selected);
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [isShippingLoading, setIsShippingLoading] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<ShippingCost | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '', phone: '', address: '', zip: '',
      province: null, city: null,
      saveAddress: true,
    }
  });
  
  // Redirect if not logged in or cart is empty
  useEffect(() => {
    if (!userLoading && !user) {
      toast({title: "Harap Login", description: "Anda harus login untuk melanjutkan ke checkout.", variant: "destructive"});
      router.push('/login?from=/checkout');
    }
    if (!userLoading && cart.length > 0 && selectedItems.length === 0) {
      toast({title: "Tidak ada item terpilih", description: "Silakan pilih item di keranjang untuk checkout.", variant: "destructive"});
      router.push('/cart');
    }
  }, [user, userLoading, router, cart.length, selectedItems.length, toast]);

  useEffect(() => {
    getProvinces().then(setProvinces);
  }, [])
  
  const selectedProvinceId = form.watch('province')?.value;
  useEffect(() => {
    if (selectedProvinceId) {
      setIsCitiesLoading(true);
      setCities([]);
      form.setValue('city', null);
      getCities(selectedProvinceId).then(res => {
          setCities(res);
          setIsCitiesLoading(false);
      });
    } else {
        setCities([]);
    }
  }, [selectedProvinceId, form]);

  const selectedCityId = form.watch('city')?.value;
  useEffect(() => {
    const fetchShippingCost = async () => {
        if(selectedCityId && totalWeight > 0) {
            setIsShippingLoading(true);
            setShippingOptions([]);
            setSelectedShipping(null);
            const costs = await getShippingCost({
                destination: selectedCityId,
                weight: totalWeight,
                courier: 'jne'
            });
            setShippingOptions(costs[0]?.costs || []);
            // auto select first option
            if(costs[0]?.costs.length > 0) {
              setSelectedShipping(costs[0].costs[0])
            }
            setIsShippingLoading(false);
        }
    }
    fetchShippingCost();
  }, [selectedCityId, totalQuantity])


  const loadSavedAddresses = useCallback(async () => {
    if (!user) return;
    try {
      const addressesCol = collection(db, 'users', user.uid, 'addresses');
      const addressSnapshot = await getDocs(addressesCol);
      const addressesList = addressSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Address));
      setSavedAddresses(addressesList);
      const defaultAddress = addressesList.find(addr => addr.isDefault);
      if (defaultAddress) {
        form.reset({
            name: defaultAddress.name,
            phone: defaultAddress.phone,
            address: defaultAddress.fullAddress,
            zip: defaultAddress.zip,
            saveAddress: false,
        });
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
      toast({ title: 'Error', description: 'Gagal memuat alamat tersimpan.', variant: 'destructive' });
    }
  }, [user, form, toast]);

  useEffect(() => {
    if(user) {
      loadSavedAddresses();
    }
  }, [user, loadSavedAddresses]);


  const totalWeight = totalQuantity * 600; // 600g per box
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + (selectedShipping?.cost[0].value || 0);

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!user || !selectedShipping || !data.city) {
        toast({ title: 'Error', description: 'Harap lengkapi alamat dan pilih opsi pengiriman.', variant: 'destructive' });
        return;
    }

    if(data.saveAddress) {
        const addressId = doc(collection(db, 'users', user.uid, 'addresses')).id;
        const addressRef = doc(db, 'users', user.uid, 'addresses', addressId);
        const newAddress: Address = { 
            id: addressId,
            name: data.name,
            phone: data.phone,
            fullAddress: data.address,
            province: data.province!.label,
            city: data.city!.label,
            zip: data.zip,
            isDefault: savedAddresses.length === 0,
        };
        try {
            await setDoc(addressRef, newAddress);
            toast({ title: 'Sukses', description: 'Alamat baru berhasil disimpan.' });
        } catch(e) {
            console.error("Error saving address", e);
            toast({ title: 'Error', description: 'Gagal menyimpan alamat baru.', variant: 'destructive' });
        }
    }

    console.log('Order placed:', {...data, total, selectedShipping});
    toast({
      title: 'Order Placed!',
      description: 'Thank you for your purchase. Your custom golf balls are on the way!',
    });
    clearCart();
    router.push('/');
  };
  
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  if (userLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/cart" className='mb-4 inline-flex items-center text-sm font-medium text-primary hover:underline'><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Keranjang</Link>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Alamat Pengiriman</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6">
                {savedAddresses.length > 0 && (
                  <div className='flex flex-col gap-2'>
                    <Label>Gunakan Alamat Tersimpan</Label>
                    <div className='flex gap-2 overflow-x-auto pb-2'>
                    {savedAddresses.map(addr => (
                      <Card key={addr.id} className='p-4 min-w-[250px] cursor-pointer hover:border-primary' onClick={() => form.reset({
                          name: addr.name,
                          phone: addr.phone,
                          address: addr.fullAddress,
                          zip: addr.zip,
                          saveAddress: false,
                      })}>
                        <p className='font-bold'>{addr.name} {addr.isDefault && <span className='text-xs text-primary'>(Utama)</span>}</p>
                        <p className='text-sm text-muted-foreground'>{addr.fullAddress}</p>
                      </Card>
                    ))}
                    </div>
                  </div>
                )}
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Nama Penerima</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Nomor Telepon</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="zip" render={({ field }) => (
                        <FormItem><FormLabel>Kode Pos</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <Controller
                        name="province"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Provinsi</FormLabel>
                                <Select
                                    {...field}
                                    placeholder="Pilih Provinsi"
                                    options={provinces.map(p => ({ value: p.province_id, label: p.province }))}
                                    isClearable
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Controller
                        name="city"
                        control={form.control}
                        render={({ field }) => (
                             <FormItem>
                                <FormLabel>Kota/Kabupaten</FormLabel>
                                <Select
                                    {...field}
                                    placeholder="Pilih Kota"
                                    options={cities.map(c => ({ value: c.city_id, label: c.city_name }))}
                                    isClearable
                                    isLoading={isCitiesLoading}
                                    isDisabled={!selectedProvinceId || isCitiesLoading}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Alamat Lengkap</FormLabel><FormControl><Textarea {...field} placeholder="Nama jalan, nomor rumah, kelurahan, kecamatan..." /></FormControl><FormMessage /></FormItem>
                )} />
                
                 <FormField
                    control={form.control}
                    name="saveAddress"
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
                            Simpan alamat ini untuk digunakan nanti
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                
                <h3 className="text-lg font-semibold pt-4 border-t">Opsi Pengiriman</h3>
                 <div className="flex flex-col gap-2">
                    {isShippingLoading && <div className='flex items-center gap-2'><Loader2 className="h-4 w-4 animate-spin" /><span>Menghitung ongkir...</span></div>}
                    {!isShippingLoading && shippingOptions.length === 0 && selectedCityId && <p className='text-sm text-muted-foreground'>Tidak ada opsi pengiriman untuk tujuan ini.</p>}
                    {!isShippingLoading && shippingOptions.map((opt: ShippingCost) => (
                         <div key={opt.service} onClick={() => setSelectedShipping(opt)} className={cn(
                            "flex justify-between items-center p-3 border rounded-lg cursor-pointer",
                            selectedShipping?.service === opt.service ? "border-primary ring-2 ring-primary" : "hover:border-slate-400"
                        )}>
                            <div>
                                <p className="font-semibold">{opt.service} ({opt.description})</p>
                                <p className="text-sm text-muted-foreground">Estimasi {opt.cost[0].etd} hari</p>
                            </div>
                            <p className="font-bold">{formatRupiah(opt.cost[0].value || 0)}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                {isSameDayEligible(totalQuantity) && (
                    <Badge variant="secondary" className="mb-4 bg-green-100 text-green-800 border-green-300">
                        <Sparkles className="mr-1 h-3 w-3"/>
                        Berpotensi dikirim hari ini!
                    </Badge>
                )}
                <div className="space-y-4">
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className='relative w-16 h-16 rounded-md bg-muted overflow-hidden'>
                           <Image src={(item.customization.side1?.type === 'logo' && item.customization.side1.content) || item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium">{item.product.name} x {item.quantity}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatRupiah(item.price)} per {item.customization.packaging === 'mesh' ? 'bag' : 'box'}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">{formatRupiah(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t pt-6 space-y-2">
                   <div className="flex justify-between">
                        <span>Subtotal ({totalQuantity} item)</span>
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
            <Alert className="bg-muted/50 border-dashed text-xs">
                <Truck className="h-4 w-4" />
                <AlertDescription>
                    <b>Same Day Shipping:</b> Pesanan 1–5 box yang dikonfirmasi sebelum 15:00 WIB dikirim hari ini (Senin-Sabtu). Pesanan >5 box diproses 1-2 hari kerja.
                </AlertDescription>
            </Alert>
             <Button type="submit" size="lg" className="w-full" disabled={!selectedShipping || form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Bayar Sekarang
             </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
