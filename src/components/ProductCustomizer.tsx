'use client';

import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import type { Product, Customization } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { RealisticPreview } from './RealisticPreview';
import { Minus, Plus, Upload, Wand2, X, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from './ui/separator';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface ProductCustomizerProps {
  product: Product;
  startWithCustom: boolean;
}

const fonts = ["Roboto", "Montserrat", "Playfair", "Poppins", "Merriweather"];
const textColors = [
    { name: 'Hitam', value: '#000000'},
    { name: 'Putih', value: '#FFFFFF'},
    { name: 'Emas', value: '#FFD700'},
    { name: 'Silver', value: '#C0C0C0'},
];

export default function ProductCustomizer({ product, startWithCustom }: ProductCustomizerProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<Customization>({
    color: product.colors?.[0],
    printSides: 0,
    logo: undefined,
    text: '',
    font: 'Roboto',
    textColor: '#000000',
    playNumber: '1',
  });
  const [totalPrice, setTotalPrice] = useState(product.basePrice);

  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);
  
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  useEffect(() => {
    let finalPrice = product.basePrice;
    
    const pricePerSide = customization.printSides === 1 ? 25000 : customization.printSides === 2 ? 40000 : 0;
    
    let optionsPrice = pricePerSide;
    
    finalPrice += optionsPrice;

    setTotalPrice(finalPrice * quantity);
  }, [customization, quantity, product.basePrice]);

  const handleColorChange = (colorName: string) => {
    const selectedColor = product.colors?.find((c) => c.name === colorName);
    setCustomization((prev) => ({ ...prev, color: selectedColor }));
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomization((prev) => ({ ...prev, logo: result, printSides: prev.printSides === 0 ? 1 : prev.printSides }));
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeLogo = () => {
    setLogoPreview(undefined);
    setCustomization(prev => ({...prev, logo: undefined}));
  }

  const handleAddToCart = () => {
    addToCart(product, customization, quantity, totalPrice / quantity);
  };
  
  const ballDesignDataUri = useMemo(() => {
    return customization.logo || product.imageUrl;
  }, [customization.logo, product.imageUrl]);

  const handlePlayNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{0,2}$/.test(value)) { // Allow up to 2 digits
      setCustomization(prev => ({...prev, playNumber: value}));
    }
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <div className="flex flex-col items-center gap-4">
         <Carousel className="w-full max-w-md">
            <CarouselContent>
                 {(product.gallery || [product.imageUrl]).map((img, index) => (
                    <CarouselItem key={index}>
                        <Card className="relative aspect-square w-full overflow-hidden rounded-lg border shadow-lg">
                             <Image
                                src={img}
                                alt={`${product.name} - view ${index + 1}`}
                                fill
                                data-ai-hint="golf ball"
                                className="object-cover"
                                style={{
                                  backgroundColor: customization.color?.hex || 'white'
                                }}
                            />
                             {index === 0 && customization.playNumber && (
                                <div
                                className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center"
                                style={{ top: '42%' }}
                                >
                                <p className="font-bold text-2xl text-black">
                                    {customization.playNumber.padStart(2, '0')}
                                </p>
                                </div>
                            )}
                            {index === 0 && logoPreview && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                                    <Image src={logoPreview} alt="Logo Preview" width={80} height={80} className="object-contain" />
                                </div>
                            )}
                            {index === 0 && customization.text && (
                                <div className="absolute bottom-1/4 left-1/2 w-full -translate-x-1/2 transform text-center">
                                    <p className="font-bold text-xl" style={{ fontFamily: customization.font, color: customization.textColor }}>
                                        {customization.text}
                                    </p>
                                </div>
                            )}
                        </Card>
                    </CarouselItem>
                 ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
        </Carousel>

      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.description}</p>
          <p className="mt-4 text-2xl font-bold">{formatRupiah(product.basePrice)} / box (12 bola)</p>
        </div>

        <Separator />

        <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Customisasi Bola Anda</h2>
            {product.colors && (
              <div className="flex flex-col gap-3">
                <Label className="text-base font-medium">Warna Bola</Label>
                <RadioGroup
                  value={customization.color?.name}
                  onValueChange={handleColorChange}
                  className="flex flex-wrap gap-2"
                >
                  {product.colors.map((color) => (
                    <div key={color.name} className="flex items-center">
                      <RadioGroupItem value={color.name} id={color.name} className="peer sr-only" />
                      <Label
                        htmlFor={color.name}
                        className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-muted bg-background p-1 pr-3 transition-colors peer-data-[state=checked]:border-primary"
                      >
                        <span
                          className="block h-6 w-6 rounded-full"
                          style={{ backgroundColor: color.hex, border: color.hex === '#FFFFFF' ? '1px solid #ccc' : 'none' }}
                        />
                        {color.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
                <Label className="text-base font-medium">Nomor Pemain (0-99)</Label>
                <Input
                    id="play-number"
                    type="text"
                    pattern="\d*"
                    maxLength={2}
                    placeholder="e.g. 7"
                    value={customization.playNumber}
                    onChange={handlePlayNumberChange}
                    className="w-24"
                />
            </div>

            <div className="flex flex-col gap-3">
                <Label className="text-base font-medium">Upload Logo/Desain</Label>
                <div className="relative">
                    <Button asChild variant="outline" className='h-auto w-full'>
                        <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="mt-2 text-sm text-center">{logoPreview ? 'Ganti Logo' : 'Klik untuk upload (JPG/PNG)'}</span>
                        </label>
                    </Button>
                    {logoPreview && (
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={removeLogo}>
                            <X className="h-4 w-4"/>
                        </Button>
                    )}
                </div>
                <Input id="logo-upload" type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleLogoUpload} />
            </div>

            <div className="flex flex-col gap-3">
                <Label htmlFor="custom-text" className="text-base font-medium">Tambah Teks</Label>
                <Input 
                    id="custom-text" 
                    placeholder="e.g. Inisial atau Nama Anda"
                    value={customization.text}
                    onChange={(e) => setCustomization(prev => ({...prev, text: e.target.value}))}
                />
                 <div className="grid grid-cols-2 gap-4">
                     <Select value={customization.font} onValueChange={(v) => setCustomization(p => ({...p, font: v}))}>
                         <SelectTrigger><SelectValue placeholder="Pilih Font" /></SelectTrigger>
                         <SelectContent>
                             {fonts.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                         </SelectContent>
                     </Select>
                     <Select value={customization.textColor} onValueChange={(v) => setCustomization(p => ({...p, textColor: v}))}>
                         <SelectTrigger><SelectValue placeholder="Warna Teks" /></SelectTrigger>
                         <SelectContent>
                             {textColors.map(c => <SelectItem key={c.name} value={c.value}>{c.name}</SelectItem>)}
                         </SelectContent>
                     </Select>
                 </div>
            </div>

            <div className="flex flex-col gap-3">
                <Label className="text-base font-medium">Pilih Opsi Print</Label>
                 <Select 
                    value={String(customization.printSides)}
                    onValueChange={(value) => setCustomization(prev => ({...prev, printSides: Number(value) as (0 | 1 | 2)}))}
                 >
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih jumlah sisi untuk di-print" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">Tanpa Print</SelectItem>
                        <SelectItem value="1">1 Sisi (+{formatRupiah(25000)})</SelectItem>
                        <SelectItem value="2">2 Sisi (+{formatRupiah(40000)})</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <Separator />
        
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q-1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-10 text-center text-lg font-bold">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => q+1)}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Harga</p>
                <p className="text-3xl font-bold tracking-tight">{formatRupiah(totalPrice)}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <Button size="lg" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Tambah ke Keranjang
            </Button>
             <RealisticPreview 
                ballDesignDataUri={ballDesignDataUri}
                customText={customization.text}
              >
                <Button size="lg" variant="outline" className="w-full">
                  <Wand2 className="mr-2 h-5 w-5" />
                  Lihat Realistic Preview (AI)
                </Button>
              </RealisticPreview>
        </div>
      </div>
    </div>
  );
}
