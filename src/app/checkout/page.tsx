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
import { useEffect, useState, useCallback } from 'react';
import { getShippingCost, getCities, getProvinces, City, Province, ShippingCost } from '@/actions/shippingActions';
import Select from 'react-select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { Address } from '@/lib/types';


const checkoutSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  phone: z.string().min(10, 'Invalid phone number'),
  address: z.string().min(10, 'Address is too short'),
  province: z.object({ value: z.string(), label: z.string() }).nullable(),
  city: z.object({ value: z.string(), label: z.string() }).nullable(),
  zip: z.string().min(5, 'Invalid ZIP code'),
  courier: z.object({ value: z.string(), label: z.string() }).nullable(),
  saveAddress: z.boolean().default(false),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user, loading: userLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const selectedItems = cart.filter(item => item.selected);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [shippingCosts, setShippingCosts] = useState<ShippingCost[] | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingCost | null>(null);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '', phone: '', address: '', zip: '',
      province: null, city: null, courier: null, saveAddress: true,
    }
  });
  
  // Redirect if not logged in or cart is empty
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login?from=/checkout');
    }
    if (cart.length > 0 && selectedItems.length === 0) {
      toast({title: "Tidak ada item terpilih", description: "Silakan pilih item di keranjang untuk checkout.", variant: "destructive"});
      router.push('/cart');
    }
  }, [user, userLoading, router, cart.length, selectedItems.length, toast]);

  const loadSavedAddresses = useCallback(async () => {
    if (!user) return;
    setIsLoadingAddresses(true);
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
            province: { value: defaultAddress.province.split('|')[0], label: defaultAddress.province.split('|')[1] },
            city: { value: defaultAddress.city.split('|')[0], label: defaultAddress.city.split('|')[1] },
            zip: defaultAddress.zip,
            courier: null,
            saveAddress: false,
        });
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
      toast({ title: 'Error', description: 'Gagal memuat alamat tersimpan.', variant: 'destructive' });
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [user, form, toast]);

  useEffect(() => {
    if(user) {
      loadSavedAddresses();
    }
  }, [user, loadSavedAddresses]);

  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = totalQuantity * 600; // 600g per box
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
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

  const selectedProvince = form.watch('province');
  const selectedCity = form.watch('city');
  const selectedCourier = form.watch('courier');

  useEffect(() => {
    const fetchCities = async () => {
        if (selectedProvince?.value) {
            setIsLoadingCities(true);
            form.setValue('city', null);
            setCities([]);
            try {
                const cityData = await getCities(selectedProvince.value);
                setCities(cityData);
            } catch (error) {
                toast({ title: 'Error', description: 'Failed to load cities.', variant: 'destructive' });
            } finally {
                setIsLoadingCities(false);
            }
        } else {
            setCities([]);
            form.setValue('city', null);
        }
    };
    fetchCities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvince?.value]);

  useEffect(() => {
      const fetchShipping = async () => {
          if(selectedCity?.value && selectedCourier?.value && totalWeight > 0) {
              setIsLoadingShipping(true);
              setShippingCosts(null);
              setSelectedShipping(null);
              try {
                  const shippingData = await getShippingCost({
                      destination: selectedCity.value,
                      weight: totalWeight,
                      courier: selectedCourier.value,
                  });
                  setShippingCosts(shippingData[0].costs);
              } catch(error) {
                  toast({ title: 'Error', description: 'Gagal memuat opsi pengiriman.', variant: 'destructive' });
              } finally {
                  setIsLoadingShipping(false);
              }
          } else {
              setShippingCosts(null);
              setSelectedShipping(null);
          }
      }
      fetchShipping();
  }, [selectedCity?.value, selectedCourier?.value, totalWeight, toast]);


  const onSubmit = async (data: CheckoutFormValues) => {
    if (!user || !selectedShipping || !data.province || !data.city) {
        toast({ title: 'Error', description: 'Informasi tidak lengkap.', variant: 'destructive' });
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
            province: `${data.province.value}|${data.province.label}`,
            city: `${data.city.value}|${data.city.label}`,
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

  if (userLoading || isLoadingAddresses) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  const courierOptions = [
      { value: 'jne', label: 'JNE' },
      { value: 'pos', label: 'POS Indonesia' },
      { value: 'tiki', label: 'TIKI' },
  ];

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
                          province: { value: addr.province.split('|')[0], label: addr.province.split('|')[1] },
                          city: { value: addr.city.split('|')[0], label: addr.city.split('|')[1] },
                          zip: addr.zip,
                          courier: null,
                          saveAddress: false,
                      })}>
                        <p className='font-bold'>{addr.name} {addr.isDefault && <span className='text-xs text-primary'>(Utama)</span>}</p>
                        <p className='text-sm text-muted-foreground'>{addr.fullAddress}, {addr.city.split('|')[1]}</p>
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
                <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Alamat Lengkap</FormLabel><FormControl><Textarea {...field} placeholder="Nama jalan, nomor rumah, kelurahan, kecamatan..." /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                     <FormField control={form.control} name="province" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Provinsi</FormLabel>
                            <FormControl>
                            <Select
                                {...field}
                                options={provinces.map(p => ({ value: p.province_id, label: p.province }))}
                                isLoading={isLoadingProvinces}
                                placeholder="Pilih Provinsi"
                            />
                            </FormControl><FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kota/Kabupaten</FormLabel>
                            <FormControl>
                            <Select
                                {...field}
                                options={cities.map(c => ({ value: c.city_id, label: `${c.type} ${c.city_name}`}))}
                                isLoading={isLoadingCities}
                                isDisabled={!selectedProvince?.value || isLoadingCities}
                                placeholder="Pilih Kota/Kab."
                            />
                            </FormControl><FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                
                <h3 className="text-lg font-semibold pt-4 border-t">Opsi Pengiriman</h3>
                 <FormField control={form.control} name="courier" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Kurir</FormLabel>
                        <FormControl>
                           <Select {...field} options={courierOptions} isDisabled={!selectedCity?.value} placeholder="Pilih Kurir" />
                        </FormControl><FormMessage />
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
                  {selectedItems.map(item => (
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
