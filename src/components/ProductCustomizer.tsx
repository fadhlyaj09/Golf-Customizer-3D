'use client';

import { useState, useEffect, useMemo, ChangeEvent, useCallback } from 'react';
import type { Product, Customization } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { RealisticPreview } from './RealisticPreview';
import { Minus, Plus, Upload, Wand2, X, ShoppingCart, Type, Image as ImageIcon, MessageCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';


interface ProductCustomizerProps {
  product: Product;
  startWithCustom: boolean;
}

const fonts = ["Roboto", "Montserrat", "Poppins", "Merriweather", "Orbitron", "Pirulen", "Arial", "Cream Cake"];
const textColors = [
    { name: 'Hitam', value: '#000000'},
    { name: 'Biru', value: '#0000FF'},
    { name: 'Merah', value: '#FF0000'},
];

interface SideCustomizerProps {
    side: 'side1' | 'side2';
    customization: Customization;
    onSideTypeChange: (side: 'side1' | 'side2', type: 'logo' | 'text' | 'none') => void;
    onSideContentChange: (side: 'side1' | 'side2', content: string) => void;
    onSideFileUpload: (side: 'side1' | 'side2', e: ChangeEvent<HTMLInputElement>) => void;
    onSideFontChange: (side: 'side1' | 'side2', font: string) => void;
    onSideColorChange: (side: 'side1' | 'side2', color: string) => void;
}

const RenderSideCustomizer = ({ side, customization, onSideTypeChange, onSideContentChange, onSideFileUpload, onSideFontChange, onSideColorChange }: SideCustomizerProps) => {
    const sideData = customization[side];

    return (
        <div className="flex flex-col gap-4 p-4 border rounded-lg">
             {customization.printSides === 2 && <h4 className="font-semibold text-center">Sisi {side === 'side1' ? 'Depan' : 'Belakang'}</h4>}
            <RadioGroup
                value={sideData.type}
                onValueChange={(v) => onSideTypeChange(side, v as 'logo' | 'text' | 'none')}
                className="flex gap-2 justify-center"
            >
                <div className="flex items-center">
                    <RadioGroupItem value="logo" id={`${side}-logo`} className="peer sr-only" />
                    <Label htmlFor={`${side}-logo`} className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-background p-3 text-center cursor-pointer peer-data-[state=checked]:border-primary w-28">
                       <ImageIcon className="h-6 w-6"/>
                       Logo
                    </Label>
                </div>
                 <div className="flex items-center">
                    <RadioGroupItem value="text" id={`${side}-text`} className="peer sr-only" />
                    <Label htmlFor={`${side}-text`} className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-background p-3 text-center cursor-pointer peer-data-[state=checked]:border-primary w-28">
                        <Type className="h-6 w-6"/>
                        Teks
                    </Label>
                </div>
            </RadioGroup>

            {sideData.type === 'logo' && (
                 <div className="flex flex-col gap-3">
                    <div className="relative">
                        <Button asChild variant="outline" className='h-auto w-full'>
                            <label htmlFor={`${side}-upload`} className="cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                                <span className="mt-2 text-sm text-center">{sideData.content ? 'Ganti Logo' : 'Klik untuk upload (JPG/PNG)'}</span>
                            </label>
                        </Button>
                        {sideData.content && (
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => onSideContentChange(side, '')}>
                                <X className="h-4 w-4"/>
                            </Button>
                        )}
                    </div>
                    <Input id={`${side}-upload`} type="file" className="hidden" accept="image/jpeg,image/png" onChange={(e) => onSideFileUpload(side, e)} />
                </div>
            )}
            {sideData.type === 'text' && (
                 <div className="flex flex-col gap-3">
                    <Input 
                        placeholder="e.g. Inisial atau Nama Anda"
                        value={sideData.content}
                        onChange={(e) => onSideContentChange(side, e.target.value)}
                    />
                     <div className="grid grid-cols-2 gap-4">
                         <Select value={sideData.font} onValueChange={(v) => onSideFontChange(side, v)}>
                             <SelectTrigger><SelectValue placeholder="Pilih Font" /></SelectTrigger>
                             <SelectContent>
                                 {fonts.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                             </SelectContent>
                         </Select>
                         <Select value={sideData.color} onValueChange={(v) => onSideColorChange(side, v)}>
                             <SelectTrigger><SelectValue placeholder="Warna Teks" /></SelectTrigger>
                             <SelectContent>
                                 {textColors.map(c => <SelectItem key={c.name} value={c.value}>{c.name}</SelectItem>)}
                             </SelectContent>
                         </Select>
                     </div>
                </div>
            )}
        </div>
    )
}


export default function ProductCustomizer({ product, startWithCustom }: ProductCustomizerProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<Customization>({
    color: product.colors?.[0],
    printSides: 0,
    side1: { type: 'none', content: '', font: 'Roboto', color: '#000000' },
    side2: { type: 'none', content: '', font: 'Roboto', color: '#000000' },
  });

  const [totalPrice, setTotalPrice] = useState(product.basePrice);
  
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  useEffect(() => {
    let finalPrice = product.basePrice;
    
    if (!product.isFloater) {
        const pricePerSide = customization.printSides === 1 ? 25000 : customization.printSides === 2 ? 40000 : 0;
        finalPrice += pricePerSide;
    }

    setTotalPrice(finalPrice * quantity);
  }, [customization.printSides, quantity, product.basePrice, product.isFloater]);

  const handleColorChange = (colorName: string) => {
    const selectedColor = product.colors?.find((c) => c.name === colorName);
    setCustomization((prev) => ({ ...prev, color: selectedColor }));
  };
  
  const handlePrintSidesChange = (value: string) => {
    const sides = Number(value) as (0 | 1 | 2);
    setCustomization(prev => {
        const newCustomization = {...prev, printSides: sides};
        if (sides === 0) {
            newCustomization.side1 = { type: 'none', content: '', font: 'Roboto', color: '#000000' };
            newCustomization.side2 = { type: 'none', content: '', font: 'Roboto', color: '#000000' };
        }
        if (sides === 1) {
            if (newCustomization.side1.type === 'none') newCustomization.side1.type = 'logo'; // Default to logo
            newCustomization.side2 = { type: 'none', content: '', font: 'Roboto', color: '#000000' };
        }
        if (sides === 2) {
            if(newCustomization.side1.type === 'none') newCustomization.side1.type = 'logo';
            if(newCustomization.side2.type === 'none') newCustomization.side2.type = 'text';
        }
        return newCustomization;
    });
  }

  const handleSideTypeChange = useCallback((side: 'side1' | 'side2', type: 'logo' | 'text' | 'none') => {
      setCustomization(prev => ({
          ...prev,
          [side]: { ...prev[side], type, content: '' }
      }));
  }, []);

  const handleSideContentChange = useCallback((side: 'side1' | 'side2', content: string) => {
       setCustomization(prev => ({
          ...prev,
          [side]: { ...prev[side], content }
      }));
  }, []);

  const handleSideFileUpload = useCallback((side: 'side1' | 'side2', e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        handleSideContentChange(side, result);
      };
      reader.readAsDataURL(file);
    }
  }, [handleSideContentChange]);

  const handleSideFontChange = useCallback((side: 'side1' | 'side2', font: string) => {
       setCustomization(prev => ({
          ...prev,
          [side]: { ...prev[side], font }
      }));
  }, []);

  const handleSideColorChange = useCallback((side: 'side1' | 'side2', color: string) => {
       setCustomization(prev => ({
          ...prev,
          [side]: { ...prev[side], color }
      }));
  }, []);


  const handleAddToCart = () => {
    if (!user) {
        router.push('/login?from=' + window.location.pathname);
        return;
    }
    const finalCustomization: Customization = {
        ...customization,
    };
    addToCart(product, finalCustomization, quantity, totalPrice / quantity);
    router.push('/cart');
  };
  
  const ballDesignDataUri = useMemo(() => {
    // This logic might need to be smarter if we want to show both sides in the realistic preview
    return customization.side1.type === 'logo' ? customization.side1.content : product.imageUrl;
  }, [customization.side1, product.imageUrl]);

  const renderSideCustomizerProps = {
      customization,
      onSideTypeChange: handleSideTypeChange,
      onSideContentChange: handleSideContentChange,
      onSideFileUpload: handleSideFileUpload,
      onSideFontChange: handleSideFontChange,
      onSideColorChange: handleSideColorChange,
  };
  
  const activeImageUrl = useMemo(() => {
      // Use the color-specific image if available, otherwise use a high-quality 3D ball
      return customization.color?.imageUrl || "https://storage.googleapis.com/studioprod-bucket/d0139369-1a40-4a87-97d8-301124483713.png";
  }, [customization.color]);


  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <div className="flex flex-col items-center gap-4">
        <Card className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg border shadow-lg">
            <Image
                src={activeImageUrl}
                alt={product.name}
                fill
                data-ai-hint="golf ball"
                className="object-contain"
                unoptimized // Prevents Next.js from optimizing the external image
            />
            {/* Side 1 Preview */}
            {customization.side1.type === 'logo' && customization.side1.content && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                    <Image src={customization.side1.content} alt="Logo Preview" width={80} height={80} className="object-contain" />
                </div>
            )}
            {customization.side1.type === 'text' && customization.side1.content && (
                <div className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 transform text-center">
                    <p className="font-bold text-xl" style={{ fontFamily: customization.side1.font, color: customization.side1.color }}>
                        {customization.side1.content}
                    </p>
                </div>
            )}
            {/* Side 2 Preview (smaller, on a corner) */}
            {customization.side2.type === 'logo' && customization.side2.content && (
                <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 transform">
                    <Image src={customization.side2.content} alt="Side 2 Logo Preview" width={40} height={40} className="object-contain opacity-80" />
                </div>
            )}
            {customization.side2.type === 'text' && customization.side2.content && (
                <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 transform text-center">
                    <p className="font-bold text-xs" style={{ fontFamily: customization.side2.font, color: customization.side2.color, opacity: 0.8 }}>
                        {customization.side2.content}
                    </p>
                </div>
            )}
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.description}</p>
          {!product.isFloater && <p className="mt-4 text-2xl font-bold">{formatRupiah(product.basePrice)} / box (12 bola)</p>}
        </div>
        
        {product.isFloater ? (
            <Alert>
                <MessageCircle className="h-4 w-4" />
                <AlertTitle>Info Khusus Bola Floater</AlertTitle>
                <AlertDescription>
                    Harga dan kustomisasi untuk bola floater dapat bervariasi. Silakan hubungi kami via WhatsApp untuk konsultasi dan penawaran terbaik.
                </AlertDescription>
            </Alert>
        ) : (
            <div className="flex flex-col gap-4">
                <Separator />
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
                    <Label className="text-base font-medium">Pilih Opsi Print</Label>
                    <Select 
                        value={String(customization.printSides)}
                        onValueChange={handlePrintSidesChange}
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

                {customization.printSides === 1 && <RenderSideCustomizer side="side1" {...renderSideCustomizerProps} />}
                {customization.printSides === 2 && (
                    <Tabs defaultValue="side1" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="side1">Sisi Depan</TabsTrigger>
                            <TabsTrigger value="side2">Sisi Belakang</TabsTrigger>
                        </TabsList>
                        <TabsContent value="side1">
                            <RenderSideCustomizer side="side1" {...renderSideCustomizerProps} />
                        </TabsContent>
                        <TabsContent value="side2">
                            <RenderSideCustomizer side="side2" {...renderSideCustomizerProps} />
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        )}

        {!product.isFloater && <Separator />}
        
        {!product.isFloater && (
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
        )}

        <div className="grid grid-cols-1 gap-4">
           { !product.isFloater && (
            <Button size="lg" onClick={handleAddToCart} disabled={
                (customization.printSides === 1 && customization.side1.type !== 'none' && !customization.side1.content) ||
                (customization.printSides === 2 && ((customization.side1.type !== 'none' && !customization.side1.content) || (customization.side2.type !== 'none' && !customization.side2.content)))
            }>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Tambah ke Keranjang
            </Button>
           )}
           { !product.isFloater && (
             <RealisticPreview 
                ballDesignDataUri={ballDesignDataUri}
                customText={customization.side1.type === 'text' ? customization.side1.content : undefined}
                side2Data={customization.side2}
              >
                <Button size="lg" variant="outline" className="w-full">
                  <Wand2 className="mr-2 h-5 w-5" />
                  Lihat Realistic Preview (AI)
                </Button>
              </RealisticPreview>
           )}
             <Button size="lg" variant="secondary" asChild>
                <a href="https://wa.me/6285723224918?text=Halo%20Articogolf,%20saya%20tertarik%20dengan%20bola%20golf%20custom." target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Konsultasi via WA
                </a>
              </Button>
        </div>
      </div>
    </div>
  );
}
