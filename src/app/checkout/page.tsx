
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
import { doc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";
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
  province: z.object({ value: z.string(), label: z.string() }).nullable().refine(val => val, { message: "Province is required." }),
  city: z.object({ value: z.string(), label: z.string() }).nullable().refine(val => val, { message: "City is required." }),
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

  const [provinces, setProvinces] = useState<{value: string, label: string}[]>([]);
  const [cities, setCities] = useState<{value: string, label: string}[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [isShippingLoading, setIsShippingLoading] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<ShippingCost | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isAddressLoading, setIsAddressLoading] = useState(true);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '', phone: '', address: '', zip: '',
      province: null, city: null,
      saveAddress: true,
    }
  });
  
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
    getProvinces().then(p => setProvinces(p.map(prov => ({value: prov.province_id, label: prov.province}))));
  }, [])
  
  const selectedProvinceId = form.watch('province')?.value;
  useEffect(() => {
      const fetchCities = async () => {
        if (selectedProvinceId) {
            setIsCitiesLoading(true);
            setCities([]);
            form.setValue('city', null, { shouldValidate: true });
            const cityData = await getCities(selectedProvinceId);
            setCities(cityData.map(c => ({ value: c.city_id, label: c.city_name })));
            setIsCitiesLoading(false);
        } else {
            setCities([]);
            form.setValue('city', null);
        }
      }
      fetchCities();
  }, [selectedProvinceId, form]);

  const selectedCityId = form.watch('city')?.value;
  const totalWeight = selectedItems.reduce((sum, item) => sum + (item.quantity * 600), 0);
  
  useEffect(() => {
    const fetchShippingCost = async () => {
        if(selectedCityId && totalWeight > 0) {
            setIsShippingLoading(true);
            setShippingOptions([]);
            setSelectedShipping(null);
            const costs = await getShippingCost({
                destination: selectedCityId,
                weight: totalWeight,
                courier: 'jne' // Currently hardcoded to JNE
            });

            // The API returns an array, the first element contains the costs
            const availableCosts = costs[0]?.costs || [];
            setShippingOptions(availableCosts);
            
            // Automatically select the first available shipping option
            if(availableCosts.length > 0) {
              setSelectedShipping(availableCosts[0])
            }

            setIsShippingLoading(false);
        } else {
            setShippingOptions([]);
            setSelectedShipping(null);
        }
    }
    fetchShippingCost();
  }, [selectedCityId, totalWeight])


  const useAddress = useCallback(async (addr: Address) => {
    const provinceOption = provinces.find(p => p.label === addr.province) || null;
    
    // Set basic fields first
    form.reset({
        name: addr.name,
        phone: addr.phone,
        address: addr.fullAddress,
        zip: addr.zip,
        province: provinceOption,
        city: null, // Reset city initially
        saveAddress: false,
    });

    if (provinceOption) {
        setIsCitiesLoading(true);
        const cityData = await getCities(provinceOption.value);
        const cityOptions = cityData.map(c => ({ value: c.city_id, label: c.city_name }));
        setCities(cityOptions);
        setIsCitiesLoading(false);
        
        const cityOption = cityOptions.find(c => c.label === addr.city) || null;
        // Set the city value after the options have been loaded
        form.setValue('city', cityOption, { shouldValidate: true });
    }
  }, [provinces, form]);


  const loadSavedAddresses = useCallback(async () => {
    if (!user) return;
    setIsAddressLoading(true);
    try {
      const addressesCol = collection(db, 'users', user.uid, 'addresses');
      const addressSnapshot = await getDocs(addressesCol);
      const addressesList = addressSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Address));
      setSavedAddresses(addressesList);
      const defaultAddress = addressesList.find(addr => addr.isDefault);
      if (defaultAddress) {
        await useAddress(defaultAddress);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
      toast({ title: 'Error', description: 'Gagal memuat alamat tersimpan.', variant: 'destructive' });
    }
    setIsAddressLoading(false);
  }, [user, toast, useAddress]);


  useEffect(() => {
    if(user && provinces.length > 0) { // Ensure provinces are loaded before using addresses
      loadSavedAddresses();
    }
  }, [user, provinces, loadSavedAddresses]);
  

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = selectedShipping?.cost[0].value || 0;
  const total = subtotal + shippingCost;


  const onSubmit = async (data: CheckoutFormValues) => {
    if (!user || !selectedShipping || !data.city) {
        toast({ title: 'Error', description: 'Harap lengkapi alamat dan pilih opsi pengiriman.', variant: 'destructive' });
        return;
    }

    if(data.saveAddress) {
        const addressesRef = collection(db, 'users', user.uid, 'addresses');
        const batch = writeBatch(db);
        
        const newAddressIsDefault = savedAddresses.length === 0;
        if(newAddressIsDefault && savedAddresses.some(a => a.isDefault)) {
            savedAddresses.forEach(addr => {
                if(addr.isDefault) {
                    const oldDefaultRef = doc(addressesRef, addr.id);
                    batch.update(oldDefaultRef, { isDefault: false });
                }
            })
        }
        
        const newAddressId = doc(collection(db, 'users', user.uid, 'addresses')).id;
        const newAddressRef = doc(addressesRef, newAddressId);
        
        const newAddress: Address = { 
            id: newAddressId,
            name: data.name,
            phone: data.phone,
            fullAddress: data.address,
            province: data.province!.label,
            city: data.city!.label,
            zip: data.zip,
            isDefault: newAddressIsDefault,
        };
        
        try {
            batch.set(newAddressRef, newAddress);
            await batch.commit();
            toast({ title: 'Sukses', description: 'Alamat baru berhasil disimpan.' });
            setSavedAddresses(prev => [...prev, newAddress]); // Update local state
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

  if (userLoading || isAddressLoading) {
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
                      <Card key={addr.id} className='p-4 min-w-[250px] cursor-pointer hover:border-primary' onClick={() => useAddress(addr)}>
                        <p className='font-bold'>{addr.name} {addr.isDefault && <Badge variant="outline" className="ml-2 border-green-600 text-green-600">Utama</Badge>}</p>
                        <p className='text-sm text-muted-foreground line-clamp-2'>{addr.fullAddress}</p>
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
                     <FormField
                        name="province"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Provinsi</FormLabel>
                                <FormControl>
                                    <Select
                                        {...field}
                                        placeholder="Pilih Provinsi"
                                        options={provinces}
                                        isClearable
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="city"
                        control={form.control}
                        render={({ field }) => (
                             <FormItem>
                                <FormLabel>Kota/Kabupaten</FormLabel>
                                <FormControl>
                                    <Select
                                        {...field}
                                        placeholder="Pilih Kota"
                                        options={cities}
                                        isClearable
                                        isLoading={isCitiesLoading}
                                        isDisabled={!selectedProvinceId || isCitiesLoading}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
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
                        <span>{selectedShipping ? formatRupiah(shippingCost) : 'Pilih alamat'}</span>
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
