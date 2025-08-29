
'use client';

import { useState, useEffect, ChangeEvent, useMemo, useCallback, useRef } from 'react';
import type { Product, Customization, Decal, SideCustomization } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, ShoppingCart, Type, Image as ImageIcon, MessageCircle, Trash2, Truck, Package, Wand2, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from './ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { GolfBallCanvas } from './GolfBallCanvas';
import { Euler, MathUtils, Vector3 } from 'three';
import { Slider } from './ui/slider';
import { realisticLightingSimulation } from '@/ai/flows/realistic-lighting-simulation';


interface ProductCustomizerProps {
  product: Product;
  startWithCustom?: boolean;
}

const textColors = [
    { name: 'Black', value: '#000000'},
    { name: 'White', value: '#FFFFFF'},
    { name: 'Blue', value: '#0000FF'},
    { name: 'Red', value: '#FF0000'},
    { name: 'Green', value: '#008000'},
];


const initialDecalPositions = [
    { position: new Vector3(0, 0, 0.5), rotation: new Euler(0, 0, 0) }, // Front
    { position: new Vector3(0, 0, -0.5), rotation: new Euler(0, Math.PI, 0) } // Back
];

export default function ProductCustomizer({ product, startWithCustom = false }: ProductCustomizerProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [decals, setDecals] = useState<Decal[]>([]);
  const [activeDecalId, setActiveDecalId] = useState<string | null>(null);
  const [isGeneratingRender, setIsGeneratingRender] = useState(false);
  const [realisticRender, setRealisticRender] = useState<string | null>(null);

  const [customization, setCustomization] = useState<Customization>({
    packaging: 'box',
    printSides: startWithCustom ? 1 : 0,
    side1: { type: 'none', content: '' },
    side2: { type: 'none', content: '' },
    color: undefined,
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
    if (!product || product.isFloater) return; 

    let finalPrice = product.basePrice || 0;
    
    if (customization.printSides === 1) {
        finalPrice += 25000;
    } else if (customization.printSides === 2) {
        finalPrice += 40000; // 25000 for 1st side + 15000 for 2nd
    }

    setTotalPrice(finalPrice * quantity);
  }, [customization.printSides, quantity, product]);


  const handleColorChange = (colorName: string) => {
    const selectedColor = product.colors?.find((c) => c.name === colorName);
    setCustomization((prev) => ({ ...prev, color: selectedColor }));
    setRealisticRender(null); // Reset render when color changes
  };

  const handlePrintSideChange = (value: string) => {
    const sides = parseInt(value, 10) as 0 | 1 | 2;
    setCustomization(prev => ({...prev, printSides: sides }));
    
    setDecals(prev => {
        const newDecals = prev.slice(0, sides);
        if (activeDecalId && !newDecals.find(d => d.id === activeDecalId)) {
            setActiveDecalId(null);
        }
        return newDecals;
    });
     setRealisticRender(null); // Reset render
  }
  
  const handleAddDecal = useCallback((type: 'logo' | 'text') => {
    if (decals.length >= customization.printSides) return;

    if (type === 'logo') {
      const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
      fileInput?.click(); 
    } else {
        const positionIndex = decals.length;
        const newDecal: Decal = {
            id: MathUtils.generateUUID(),
            type: 'text',
            content: 'Your Text',
            ...initialDecalPositions[positionIndex],
            scale: 0.15,
            color: '#000000',
        };
       setDecals(prev => [...prev, newDecal]);
       setActiveDecalId(newDecal.id);
       setRealisticRender(null); // Reset render
    }
  }, [decals.length, customization.printSides]);
  
  const handleRemoveDecal = (id: string) => {
    setDecals(prev => prev.filter(d => d.id !== id));
    if (activeDecalId === id) {
      setActiveDecalId(null);
    }
     setRealisticRender(null); // Reset render
  };
  
  const handleUpdateDecal = (id: string, newProps: Partial<Omit<Decal, 'id' | 'type'>>) => {
    setDecals(prev => prev.map(d => d.id === id ? { ...d, ...newProps } : d));
    setRealisticRender(null); // Reset render
  };


  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
     if (decals.length >= customization.printSides) return;

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const positionIndex = decals.length;
        const newDecal: Decal = {
          id: MathUtils.generateUUID(),
          type: 'logo',
          content: result,
          ...initialDecalPositions[positionIndex],
          scale: 0.15,
          color: '#000000',
        };
        setDecals(prev => [...prev, newDecal]);
        setActiveDecalId(newDecal.id);
        setRealisticRender(null); // Reset render
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
    
    const decalToSide = (decal?: Decal): SideCustomization => {
        if (!decal) return { type: 'none', content: '' };
        return {
            type: decal.type,
            content: decal.content,
            font: decal.font,
            color: decal.color,
        }
    }
    
    const finalCustomization: Customization = {
        ...customization,
        side1: decalToSide(decals[0]),
        side2: decalToSide(decals[1]),
    };
    
    addToCart(product, finalCustomization, quantity, totalPrice / quantity);
    router.push('/cart');
  };

  const handleGenerateRender = async () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current.querySelector('canvas');
      if (!canvas) return;

      setIsGeneratingRender(true);
      try {
          const currentActiveId = activeDecalId;
          setActiveDecalId(null);
          
          await new Promise(resolve => setTimeout(resolve, 50)); 
          
          const imageUri = canvas.toDataURL('image/png');
          
          setActiveDecalId(currentActiveId);
          
          const result = await realisticLightingSimulation({ productImageUri: imageUri });
          setRealisticRender(result.imageUri);

      } catch (error) {
          console.error("Failed to generate realistic render:", error);
      } finally {
          setIsGeneratingRender(false);
      }
  };
  
  const activeDecalData = useMemo(() => decals.find(d => d.id === activeDecalId), [decals, activeDecalId]);
  
  const DecalEditor = () => {
    if (!activeDecalData) return null;

    const handleRotationChange = (newRotation: number) => {
        handleUpdateDecal(activeDecalData.id, {
            rotation: new Euler(activeDecalData.rotation.x, activeDecalData.rotation.y, MathUtils.degToRad(newRotation))
        });
    }

    const handleScaleChange = (newScale: number) => {
        handleUpdateDecal(activeDecalData.id, { scale: newScale });
    }

    const handlePositionChange = (axis: 'x' | 'y', value: number) => {
      const currentPos = activeDecalData.position;
      const originalDecal = initialDecalPositions.find(p => p.position.z === currentPos.z) || { position: currentPos };

      const newPos = new Vector3(
        axis === 'x' ? value : currentPos.x,
        axis === 'y' ? value : currentPos.y,
        originalDecal.position.z
      );
      handleUpdateDecal(activeDecalData.id, { position: newPos });
    };

    return (
        <div className="flex flex-col gap-4 p-3 border rounded-lg bg-muted/30">
            <h3 className='font-medium'>Edit Desain Aktif</h3>
            {activeDecalData.type === 'text' && (
                <>
                <Label>Teks</Label>
                <Input 
                    value={activeDecalData.content}
                    onChange={(e) => handleUpdateDecal(activeDecalData.id, { content: e.target.value })}
                />
                 <Label>Warna Teks</Label>
                 <Select value={activeDecalData.color} onValueChange={(v) => handleUpdateDecal(activeDecalData.id, { color: v })}>
                     <SelectTrigger><SelectValue placeholder="Warna Teks" /></SelectTrigger>
                     <SelectContent>
                         {textColors.map(c => <SelectItem key={c.name} value={c.value}>{c.name}</SelectItem>)}
                     </SelectContent>
                 </Select>
                </>
            )}
            <div className='flex flex-col gap-2'>
                <Label>Posisi X</Label>
                <Slider defaultValue={[activeDecalData.position.x]} min={-0.3} max={0.3} step={0.01} onValueChange={(v) => handlePositionChange('x', v[0])} />
            </div>
             <div className='flex flex-col gap-2'>
                <Label>Posisi Y</Label>
                <Slider defaultValue={[activeDecalData.position.y]} min={-0.3} max={0.3} step={0.01} onValueChange={(v) => handlePositionChange('y', v[0])} />
            </div>
            <div className='flex flex-col gap-2'>
                <Label>Ukuran</Label>
                <Slider defaultValue={[activeDecalData.scale]} min={0.05} max={0.3} step={0.01} onValueChange={(v) => handleScaleChange(v[0])} />
            </div>
            <div className='flex flex-col gap-2'>
                <Label>Rotasi</Label>
                <Slider defaultValue={[MathUtils.radToDeg(activeDecalData.rotation.z)]} min={-180} max={180} step={1} onValueChange={(v) => handleRotationChange(v[0])} />
            </div>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-2 lg:gap-x-12">
      <div className="h-[50vh] lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24 flex flex-col gap-4">
         <div ref={canvasRef} className="w-full h-full border rounded-lg overflow-hidden relative bg-gray-100">
            {realisticRender ? (
                <div className='w-full h-full relative'>
                     <img src={realisticRender} alt="Realistic Render" className='w-full h-full object-cover' />
                     <Button onClick={() => setRealisticRender(null)} variant="outline" size="sm" className="absolute top-2 left-2">Back to Editor</Button>
                </div>
            ) : (
                <GolfBallCanvas 
                    ballColor={customization.color?.hex || '#ffffff'}
                    decals={decals}
                    activeDecalId={activeDecalId}
                    setActiveDecalId={setActiveDecalId}
                />
            )}
         </div>
         <Button onClick={handleGenerateRender} disabled={isGeneratingRender} variant="outline">
             {isGeneratingRender ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2"/>}
             {isGeneratingRender ? 'Generating...' : 'Create Realistic Render (AI)'}
         </Button>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.description}</p>
          {!product.isFloater && <p className="mt-4 text-2xl font-bold">{formatRupiah(product.basePrice)} / {customization.packaging === 'mesh' ? 'bag' : 'box'} (12 bola)</p>}
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
                
                <div className="flex flex-col gap-3">
                    <Label className="text-base font-medium">Packaging</Label>
                    <RadioGroup 
                        value={customization.packaging} 
                        onValueChange={(value) => setCustomization(prev => ({...prev, packaging: value as 'box' | 'mesh' }))}
                        className="grid grid-cols-2 gap-4"
                    >
                        <Label className="flex flex-row items-center gap-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <RadioGroupItem value="box" id="pkg-box" />
                            <div className='flex items-center gap-2'>
                               <Package className="h-5 w-5" />
                               <span>Box Premium</span>
                            </div>
                        </Label>
                        <Label className="flex flex-row items-center gap-3 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                             <RadioGroupItem value="mesh" id="pkg-mesh" />
                              <div className='flex items-center gap-2'>
                                 <Package className="h-5 w-5" />
                                <span>Mesh Bag</span>
                             </div>
                        </Label>
                    </RadioGroup>
                </div>

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
                    <Label className="text-base font-medium">Jumlah Sisi Print</Label>
                    <RadioGroup 
                        value={String(customization.printSides)} 
                        onValueChange={handlePrintSideChange} 
                        className="grid grid-cols-3 gap-4"
                    >
                        <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <RadioGroupItem value="0" id="print-0" className="sr-only" />
                            Tanpa Print
                            <span className="font-normal text-muted-foreground text-xs mt-1">Rp 0</span>
                        </Label>
                        <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                             <RadioGroupItem value="1" id="print-1" className="sr-only" />
                            1 Sisi
                            <span className="font-normal text-muted-foreground text-xs mt-1">+ Rp 25.000</span>
                        </Label>
                        <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <RadioGroupItem value="2" id="print-2" className="sr-only" />
                            2 Sisi
                            <span className="font-normal text-muted-foreground text-xs mt-1">+ Rp 40.000</span>
                        </Label>
                    </RadioGroup>
                </div>
                
                {customization.printSides > 0 && (
                    <div className="flex flex-col gap-3">
                        <Label className="text-base font-medium">Desain Anda</Label>
                        {decals.length < customization.printSides && (
                         <div className="grid grid-cols-2 gap-4">
                            <Button onClick={() => handleAddDecal('text')} variant="outline"><Type className='mr-2'/> Tambah Teks</Button>
                            <Button onClick={() => handleAddDecal('logo')} variant="outline"><ImageIcon className='mr-2'/> Tambah Logo</Button>
                         </div>
                        )}
                         <Input id="logo-upload" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} />
                    </div>
                )}


                {decals.length > 0 && (
                    <div className="flex flex-col gap-3 p-3 border rounded-lg bg-muted/20">
                        <Label>Daftar Desain ({decals.length}/{customization.printSides})</Label>
                        <div className="flex flex-col gap-2">
                        {decals.map((decal, index) => (
                            <div key={decal.id} 
                                 className={`p-2 border rounded-lg flex justify-between items-center cursor-pointer transition-colors ${activeDecalId === decal.id ? 'border-primary bg-primary/10' : 'bg-background hover:bg-accent'}`}
                                 onClick={() => setActiveDecalId(decal.id)}>
                                <span>{`Sisi ${index + 1}: ${decal.type === 'logo' ? 'Logo' : `Teks "${decal.content}"`}`}</span>
                                <Button size="icon" variant="ghost" className='h-7 w-7' onClick={(e) => { e.stopPropagation(); handleRemoveDecal(decal.id); }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        </div>
                    </div>
                )}

                <DecalEditor />

            </div>
        )}

        {!product.isFloater && <Separator />}
        
        {!product.isFloater && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
