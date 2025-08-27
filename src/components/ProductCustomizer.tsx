'use client';

import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import type { Product, Customization } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { RealisticPreview } from './RealisticPreview';
import { DollarSign, Minus, Plus, Upload, Wand2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface ProductCustomizerProps {
  product: Product;
}

export default function ProductCustomizer({ product }: ProductCustomizerProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<Customization>({
    color: product.colors?.[0],
    printSides: 1,
    logo: undefined,
    text: '',
  });
  const [totalPrice, setTotalPrice] = useState(product.basePrice);

  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);

  useEffect(() => {
    const pricePerSide = 5;
    const textPrice = customization.text ? 3 : 0;
    const sidePrice = (customization.printSides - 1) * pricePerSide;
    const logoPrice = customization.logo ? pricePerSide : 0;
    
    let optionsPrice = 0;
    if (customization.logo || customization.text) {
        optionsPrice = textPrice + sidePrice + logoPrice;
    }

    setTotalPrice((product.basePrice + optionsPrice) * quantity);
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
        setCustomization((prev) => ({ ...prev, logo: result }));
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, customization, quantity, totalPrice / quantity);
  };
  
  const ballDesignDataUri = useMemo(() => {
    // This is a simplified representation. A real implementation would use canvas to create a composite image.
    // For now, we'll just use the product image URL if no logo, or the logo if uploaded.
    return customization.logo || product.imageUrl;
  }, [customization.logo, product.imageUrl]);

  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
      <div className="flex flex-col items-center">
         <Card className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg shadow-lg">
            <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                data-ai-hint="golf ball"
                className="object-cover"
                style={{
                  backgroundColor: customization.color?.hex || 'white'
                }}
            />
            {logoPreview && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                    <Image src={logoPreview} alt="Logo Preview" width={80} height={80} className="object-contain" />
                </div>
            )}
            {customization.text && (
                <div className="absolute bottom-1/4 left-1/2 w-full -translate-x-1/2 transform text-center">
                    <p className="font-bold text-xl text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
                        {customization.text}
                    </p>
                </div>
            )}
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.description}</p>
        </div>

        {product.colors && (
          <div className="flex flex-col gap-3">
            <Label className="text-base font-medium">Color</Label>
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
            <Label className="text-base font-medium">Custom Print</Label>
            <div className="flex items-center space-x-2 rounded-lg border p-4">
                <Switch 
                    id="print-sides" 
                    checked={customization.printSides === 2}
                    onCheckedChange={(checked) => setCustomization(prev => ({...prev, printSides: checked ? 2 : 1}))}
                />
                <Label htmlFor="print-sides" className='flex-grow'>{customization.printSides} Sisi</Label>
                <p className="text-sm text-muted-foreground">Harga per sisi: $5.00</p>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
                <Label htmlFor="logo-upload" className="text-base font-medium">Upload Logo</Label>
                <Button asChild variant="outline" className='h-auto'>
                    <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center justify-center p-4">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="mt-2 text-sm">{logoPreview ? 'Change Logo' : 'Upload Logo'}</span>
                    </label>
                </Button>
                <Input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </div>
            <div className="flex flex-col gap-3">
                <Label htmlFor="custom-text" className="text-base font-medium">Tambah Teks</Label>
                <Input 
                    id="custom-text" 
                    placeholder="e.g. Your Name"
                    value={customization.text}
                    onChange={(e) => setCustomization(prev => ({...prev, text: e.target.value}))}
                />
                 <p className="text-xs text-muted-foreground">Biaya tambahan teks: $3.00</p>
            </div>
        </div>
        
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q-1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-10 text-center text-lg font-bold">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => q+1)}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight">${totalPrice.toFixed(2)}</span>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <RealisticPreview 
              ballDesignDataUri={ballDesignDataUri}
              customText={customization.text}
            >
              <Button size="lg" variant="outline">
                <Wand2 className="mr-2 h-5 w-5" />
                Realistic Preview
              </Button>
            </RealisticPreview>
            <Button size="lg" onClick={handleAddToCart}>
                Add to Cart
            </Button>
        </div>
      </div>
    </div>
  );
}
