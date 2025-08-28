
'use client';

import { useState, useEffect, ChangeEvent, useCallback } from 'react';
import type { Product, Customization, Decal } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, ShoppingCart, Type, Image as ImageIcon, MessageCircle, Trash2, Truck } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from './ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { GolfBallCanvas } from './GolfBallCanvas';
import { Euler, MathUtils, Vector3 } from 'three';


interface ProductCustomizerProps {
  product: Product;
}

const fonts = ["Inter", "Roboto", "Montserrat", "Poppins", "Merriweather"];
const textColors = [
    { name: 'Black', value: '#000000'},
    { name: 'White', value: '#FFFFFF'},
    { name: 'Blue', value: '#0000FF'},
    { name: 'Red', value: '#FF0000'},
    { name: 'Green', value: '#008000'},
];

export default function ProductCustomizer({ product }: ProductCustomizerProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [decals, setDecals] = useState<Decal[]>([]);
  const [activeDecalId, setActiveDecalId] = useState<string | null>(null);
  const [customization, setCustomization] = useState<Customization>({
    printSides: 0,
    side1: { type: 'none', content: '' },
    side2: { type: 'none', content: '' },
  });
  const [totalPrice, setTotalPrice] = useState(0);
  
  useEffect(() => {
    if (product) {
      setCustomization(prev => ({
        ...prev,
        color: product.colors && product.colors.length > 0 ? product.colors[0] : undefined,
      }));
      setTotalPrice(product.basePrice || 0);
    }
  }, [product]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  useEffect(() => {
    if (!product || !decals) return; 

    let finalPrice = product.basePrice || 0;
    
    if (!product.isFloater && decals.length > 0) {
        const pricePerSide = 25000 + (decals.length - 1) * 15000;
        finalPrice += pricePerSide;
    }

    setTotalPrice(finalPrice * quantity);
  }, [decals, quantity, product]);


  const handleColorChange = (colorName: string) => {
    const selectedColor = product.colors?.find((c) => c.name === colorName);
    setCustomization((prev) => ({ ...prev, color: selectedColor }));
  };
  
  const handleAddDecal = (type: 'logo' | 'text') => {
    const newDecal: Decal = {
      id: MathUtils.generateUUID(),
      type: type,
      content: type === 'text' ? 'Your Text' : '', // Placeholder for text, empty for logo until uploaded
      position: new Vector3(0, 0, 0.5), // Default position on the front
      rotation: new Euler(0,0,0),
      scale: 0.15,
      font: 'Inter',
      color: '#000000',
    };
    
    if (type === 'logo') {
      const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
      fileInput?.click(); 
    } else {
       setDecals(prev => [...prev, newDecal]);
       setActiveDecalId(newDecal.id);
    }
  }

  const handleUpdateDecal = (id: string, newProps: Partial<Omit<Decal, 'id' | 'type'>>) => {
    setDecals(prev => prev.map(d => d.id === id ? { ...d, ...newProps } : d));
  };
  
  const handleRemoveDecal = (id: string) => {
    setDecals(prev => prev.filter(d => d.id !== id));
    if (activeDecalId === id) {
      setActiveDecalId(null);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const newDecal: Decal = {
          id: MathUtils.generateUUID(),
          type: 'logo',
          content: result,
          position: new Vector3(0, 0, 0.5),
          rotation: new Euler(0,0,0),
          scale: 0.15,
        };
        setDecals(prev => [...prev, newDecal]);
        setActiveDecalId(newDecal.id);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };


  const handleAddToCart = () => {
    if (!user) {
        router.push('/login?from=' + window.location.pathname);
        return;
    }
    
    const finalCustomization: Customization = {
        ...customization,
        printSides: decals.length > 0 ? (decals.length > 1 ? 2 : 1) : 0,
        side1: { 
            type: decals.find(d => d.type === 'logo')?.type || 'none',
            content: decals.find(d => d.type === 'logo')?.content || ''
        },
        side2: { type: 'none', content: ''}, // simplified for now
    };
    addToCart(product, finalCustomization, quantity, totalPrice / quantity);
    router.push('/cart');
  };
  
  const activeDecalData = decals.find(d => d.id === activeDecalId);


  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <div className="flex flex-col items-center gap-4 sticky top-24 h-[80vh]">
         <GolfBallCanvas 
            ballColor={customization.color?.hex || '#ffffff'}
            decals={decals}
            activeDecalId={activeDecalId}
            setActiveDecalId={setActiveDecalId}
        />
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.description}</p>
          {!product.isFloater && <p className="mt-4 text-2xl font-bold">{formatRupiah(product.basePrice)} / box (12 bola)</p>}
        </div>
        
        <Alert className="bg-muted/50 border-dashed">
            <Truck className="h-4 w-4" />
            <AlertTitle className="font-semibold">Same Day Shipping</AlertTitle>
            <AlertDescription className="text-xs">
                Pesanan 1–5 box yang dikonfirmasi sebelum 15:00 WIB dikirim hari ini (Senin-Sabtu). Pesanan >5 box diproses 1-2 hari kerja.
            </AlertDescription>
        </Alert>

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
                {product.colors && product.colors.length > 0 && (
                <div className="flex flex-col gap-3">
                    <Label className="text-base font-medium">Warna Bola</Label>
                    <div className='flex flex-wrap gap-2'>
                        {product.colors.map((color) => (
                            <button
                                key={color.name}
                                onClick={() => handleColorChange(color.name)}
                                className={`flex cursor-pointer items-center gap-2 rounded-full border-2 p-1 pr-3 transition-colors ${customization.color?.name === color.name ? 'border-primary' : 'border-transparent'}`}
                            >
                                <span
                                className="block h-6 w-6 rounded-full"
                                style={{ backgroundColor: color.hex, border: color.hex.toUpperCase() === '#FFFFFF' ? '1px solid #ccc' : 'none' }}
                                />
                                {color.name}
                            </button>
                        ))}
                    </div>
                </div>
                )}
                
                <div className="flex flex-col gap-3">
                    <Label className="text-base font-medium">Tambah Desain</Label>
                     <div className="grid grid-cols-2 gap-4">
                        <Button onClick={() => handleAddDecal('text')} variant="outline"><Type className='mr-2'/> Tambah Teks</Button>
                        <Button onClick={() => handleAddDecal('logo')} variant="outline"><ImageIcon className='mr-2'/> Tambah Logo</Button>
                     </div>
                     <Input id="logo-upload" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} />
                </div>

                {decals.length > 0 && (
                    <div className="flex flex-col gap-3 p-3 border rounded-lg bg-muted/20">
                        <Label>Daftar Desain</Label>
                        <div className="flex flex-col gap-2">
                        {decals.map((decal, index) => (
                            <div key={decal.id} 
                                 className={`p-2 border rounded-lg flex justify-between items-center cursor-pointer ${activeDecalId === decal.id ? 'border-primary bg-primary/10' : 'bg-background'}`}
                                 onClick={() => setActiveDecalId(decal.id)}>
                                <span>{decal.type === 'logo' ? `Logo ${index + 1}` : `Teks: "${decal.content}"`}</span>
                                <Button size="icon" variant="ghost" className='h-7 w-7' onClick={(e) => { e.stopPropagation(); handleRemoveDecal(decal.id); }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        </div>
                    </div>
                )}

                {activeDecalData?.type === 'text' && (
                     <div className="flex flex-col gap-3 p-3 border rounded-lg bg-muted/30">
                        <Label>Edit Teks Aktif</Label>
                        <Input 
                            value={activeDecalData.content}
                            onChange={(e) => handleUpdateDecal(activeDecalData.id, { content: e.target.value })}
                        />
                        <div className='grid grid-cols-2 gap-4'>
                            <Select value={activeDecalData.font} onValueChange={(v) => handleUpdateDecal(activeDecalData.id, { font: v })}>
                                 <SelectTrigger><SelectValue placeholder="Pilih Font" /></SelectTrigger>
                                 <SelectContent>
                                     {fonts.map(f => <SelectItem key={f} value={f} style={{fontFamily: f}}>{f}</SelectItem>)}
                                 </SelectContent>
                            </Select>
                            <Select value={activeDecalData.color} onValueChange={(v) => handleUpdateDecal(activeDecalData.id, { color: v })}>
                                 <SelectTrigger><SelectValue placeholder="Warna Teks" /></SelectTrigger>
                                 <SelectContent>
                                     {textColors.map(c => <SelectItem key={c.name} value={c.value}>{c.name}</SelectItem>)}
                                 </SelectContent>
                            </Select>
                        </div>
                    </div>
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
            <Button size="lg" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Tambah ke Keranjang
            </Button>
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
