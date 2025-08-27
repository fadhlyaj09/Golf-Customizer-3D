'use client';

import { useState, useEffect, useMemo, ChangeEvent, useCallback, Suspense } from 'react';
import type { Product, Customization, Decal } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { RealisticPreview } from './RealisticPreview';
import { Minus, Plus, Upload, Wand2, ShoppingCart, Type, Image as ImageIcon, MessageCircle, Trash2 } from 'lucide-react';
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
  startWithCustom: boolean;
}

const fonts = ["Roboto", "Montserrat", "Poppins", "Merriweather", "Orbitron", "Pirulen", "Arial", "Cream Cake"];
const textColors = [
    { name: 'Hitam', value: '#000000'},
    { name: 'Putih', value: '#FFFFFF'},
    { name: 'Biru', value: '#0000FF'},
    { name: 'Merah', value: '#FF0000'},
    { name: 'Hijau', value: '#008000'},
];

export default function ProductCustomizer({ product, startWithCustom }: ProductCustomizerProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [decals, setDecals] = useState<Decal[]>([]);
  const [activeDecal, setActiveDecal] = useState<string | null>(null);

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
        const pricePerSide = decals.length > 0 ? 25000 + (decals.length - 1) * 15000 : 0;
        finalPrice += pricePerSide;
    }

    setTotalPrice(finalPrice * quantity);
  }, [decals, quantity, product.basePrice, product.isFloater]);


  const handleColorChange = (colorName: string) => {
    const selectedColor = product.colors?.find((c) => c.name === colorName);
    setCustomization((prev) => ({ ...prev, color: selectedColor }));
  };
  
  const handleAddDecal = (type: 'logo' | 'text') => {
    const newDecal: Decal = {
      id: MathUtils.generateUUID(),
      type: type,
      content: type === 'text' ? 'Your Text' : '',
      position: new Vector3(0, 0, 0.5),
      rotation: new Euler(0,0,0),
      scale: 0.15,
      font: 'Roboto',
      color: '#000000',
    };
    setDecals(prev => [...prev, newDecal]);
    setActiveDecal(newDecal.id);
  }

  const handleUpdateDecal = (id: string, newProps: Partial<Decal>) => {
    setDecals(prev => prev.map(d => d.id === id ? { ...d, ...newProps } : d));
  };
  
  const handleRemoveDecal = (id: string) => {
    setDecals(prev => prev.filter(d => d.id !== id));
    if (activeDecal === id) {
      setActiveDecal(null);
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
        setActiveDecal(newDecal.id);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleAddToCart = () => {
    if (!user) {
        router.push('/login?from=' + window.location.pathname);
        return;
    }
    // This part would need to be updated to handle the new decal structure if needed
    // For now, we'll use the old customization structure for cart compatibility
    const finalCustomization: Customization = {
        ...customization,
        printSides: decals.length > 0 ? (decals.length > 1 ? 2 : 1) : 0,
        // A more complex mapping would be needed to save full 3D state
        side1: { type: 'none', content: ''},
        side2: { type: 'none', content: ''},
    };
    addToCart(product, finalCustomization, quantity, totalPrice / quantity);
    router.push('/cart');
  };
  
  const ballDesignDataUri = useMemo(() => {
    // This logic might need to be smarter if we want to show both sides in the realistic preview
    return decals.find(d => d.type === 'logo')?.content || product.imageUrl;
  }, [decals, product.imageUrl]);

  const activeDecalData = useMemo(() => {
    return decals.find(d => d.id === activeDecal);
  }, [decals, activeDecal]);
  
  const activeImageUrl = useMemo(() => {
      return customization.color?.imageUrl || "https://storage.googleapis.com/studioprod-bucket/d0139369-1a40-4a87-97d8-301124483713.png";
  }, [customization.color]);


  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <div className="flex flex-col items-center gap-4 sticky top-24 h-[80vh]">
         <Suspense fallback={<div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">Loading 3D Preview...</div>}>
            <GolfBallCanvas 
                ballColor={customization.color?.hex || '#ffffff'}
                decals={decals}
                setDecals={setDecals}
                activeDecalId={activeDecal}
                setActiveDecalId={setActiveDecal}
            />
        </Suspense>
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
                    <div className='flex flex-wrap gap-2'>
                        {product.colors.map((color) => (
                            <button
                                key={color.name}
                                onClick={() => handleColorChange(color.name)}
                                className={`flex cursor-pointer items-center gap-2 rounded-full border-2 p-1 pr-3 transition-colors ${customization.color?.name === color.name ? 'border-primary' : 'border-muted'}`}
                            >
                                <span
                                className="block h-6 w-6 rounded-full"
                                style={{ backgroundColor: color.hex, border: color.hex === '#FFFFFF' ? '1px solid #ccc' : 'none' }}
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
                        <Button asChild variant="outline">
                            <label htmlFor="logo-upload" className='cursor-pointer'><ImageIcon className='mr-2'/> Tambah Logo</label>
                        </Button>
                        <Input id="logo-upload" type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleFileUpload} />
                    </div>
                </div>

                {decals.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <Label>Desain Aktif</Label>
                        {decals.map((decal, index) => (
                            <div key={decal.id} 
                                 className={`p-2 border rounded-lg flex justify-between items-center cursor-pointer ${activeDecal === decal.id ? 'border-primary bg-muted/50' : ''}`}
                                 onClick={() => setActiveDecal(decal.id)}>
                                <span>{decal.type === 'logo' ? `Logo ${index + 1}` : decal.content}</span>
                                <Button size="icon" variant="ghost" className='h-7 w-7' onClick={(e) => { e.stopPropagation(); handleRemoveDecal(decal.id); }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {activeDecalData?.type === 'text' && (
                     <div className="flex flex-col gap-3 p-3 border rounded-lg bg-muted/30">
                        <Label>Edit Teks</Label>
                        <Input 
                            value={activeDecalData.content}
                            onChange={(e) => handleUpdateDecal(activeDecalData.id, { content: e.target.value })}
                        />
                        <div className='grid grid-cols-2 gap-4'>
                            <Select value={activeDecalData.font} onValueChange={(v) => handleUpdateDecal(activeDecalData.id, { font: v })}>
                                 <SelectTrigger><SelectValue placeholder="Pilih Font" /></SelectTrigger>
                                 <SelectContent>
                                     {fonts.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
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
           { !product.isFloater && (
             <RealisticPreview 
                ballDesignDataUri={ballDesignDataUri || ''}
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