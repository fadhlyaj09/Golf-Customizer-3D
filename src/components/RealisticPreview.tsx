'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getRealisticPreview } from '@/actions/aiActions';
import Image from 'next/image';
import { Loader2, Wand2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Customization } from '@/lib/types';

interface RealisticPreviewProps {
  children: React.ReactNode;
  ballDesignDataUri: string;
  customText?: string;
  side2Data: Customization['side2'];
}

export function RealisticPreview({ children, ballDesignDataUri, customText, side2Data }: RealisticPreviewProps) {
  const [open, setOpen] = useState(false);
  const [lighting, setLighting] = useState('sunny');
  const [angle, setAngle] = useState('top-down');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [errorPreparing, setErrorPreparing] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [compositeImage, setCompositeImage] = useState<string>('');
  
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isGeneratingRef = useRef(false);

  const generateCompositeImage = useCallback(async () => {
    if (isGeneratingRef.current) return;

    setIsPreparing(true);
    setErrorPreparing(null);
    setCompositeImage('');
    isGeneratingRef.current = true;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      setErrorPreparing("Gagal menginisialisasi canvas.");
      isGeneratingRef.current = false;
      setIsPreparing(false);
      return;
    }

    const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(new Error(`Gagal memuat gambar: ${src.substring(0, 50)}...`));
        img.src = src;
    });

    try {
        const baseImage = await loadImage('https://storage.googleapis.com/studioprod-bucket/d0139369-1a40-4a87-97d8-301124483713.png');
        canvas.width = baseImage.width;
        canvas.height = baseImage.height;
        ctx.drawImage(baseImage, 0, 0);

        const drawText = (text: string, font: string, color: string, yPos: number) => {
            ctx.fillStyle = color;
            ctx.font = `bold 24px "${font}"`;
            ctx.textAlign = 'center';
            ctx.fillText(text, canvas.width / 2, yPos);
        };

        const drawLogo = async (dataUri: string, yPos: number, size: number) => {
            const logoImage = await loadImage(dataUri);
            const x = (canvas.width - size) / 2;
            ctx.drawImage(logoImage, x, yPos, size, size);
        };
        
        // Handle side 1
        if (ballDesignDataUri.startsWith('data:image')) {
            await drawLogo(ballDesignDataUri, (canvas.height/2) - 100, 100);
        } else if (customText) {
            drawText(customText, 'Arial', 'black', (canvas.height / 2) - 20);
        }
        
        // Handle side 2, visible only in 'side view'
        if (angle === 'side view') {
            if (side2Data.type === 'logo' && side2Data.content) {
                await drawLogo(side2Data.content, (canvas.height/2) + 50, 50);
            } else if (side2Data.type === 'text' && side2Data.content && side2Data.font && side2Data.color) {
                drawText(side2Data.content, side2Data.font, side2Data.color, canvas.height * 0.7);
            }
        }

        setCompositeImage(canvas.toDataURL('image/png'));

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
        setErrorPreparing(errorMessage);
        toast({ title: 'Gagal Menyiapkan Preview', description: errorMessage, variant: 'destructive' });
    } finally {
        isGeneratingRef.current = false;
        setIsPreparing(false);
    }
  }, [ballDesignDataUri, customText, side2Data, angle, toast]);


  // Effect to generate image when dialog opens or angle changes
  useEffect(() => {
    if (open) {
      setPreviewImage(null); // Clear previous AI image
      generateCompositeImage();
    }
  }, [open, angle, generateCompositeImage]);


  const handleGeneratePreview = async () => {
    if (isLoading || isPreparing || !compositeImage) {
        let description = 'Harap tunggu proses saat ini selesai.';
        if (!compositeImage) description = 'Gambar dasar belum siap. Coba lagi sesaat lagi.';
        if (errorPreparing) description = 'Tidak bisa generate karena ada error: ' + errorPreparing;

        toast({ title: 'Tidak Dapat Generate', description, variant: 'destructive' });
        return;
    }

    setIsLoading(true);
    setPreviewImage(null);
    try {
      const result = await getRealisticPreview({
        ballDesignDataUri: compositeImage,
        lightingCondition: lighting,
        angle: angle,
      });
      setPreviewImage(result.previewImageDataUri);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Gagal Membuat Preview',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Realistic Preview</DialogTitle>
          <DialogDescription>
            Lihat bagaimana tampilan bola golf custom Anda dalam berbagai kondisi. Proses ini menggunakan AI dan mungkin perlu beberapa saat.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lighting" className="text-right">
              Cahaya
            </Label>
             <RadioGroup defaultValue="sunny" className="col-span-3 flex gap-4" onValueChange={setLighting} value={lighting}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sunny" id="r1" disabled={isPreparing || isLoading}/>
                <Label htmlFor="r1">Cerah</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="overcast" id="r2" disabled={isPreparing || isLoading}/>
                <Label htmlFor="r2">Mendung</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="indoor" id="r3" disabled={isPreparing || isLoading}/>
                <Label htmlFor="r3">Indoor</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="angle" className="text-right">
              Sudut
            </Label>
            <RadioGroup defaultValue="top-down" className="col-span-3 flex gap-4" onValueChange={setAngle} value={angle}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="top-down" id="a1" disabled={isPreparing || isLoading}/>
                <Label htmlFor="a1">Atas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="side view" id="a2" disabled={isPreparing || isLoading}/>
                <Label htmlFor="a2">Samping</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="mt-4 flex h-64 w-full items-center justify-center rounded-lg border bg-muted/50">
            {isLoading || isPreparing ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>{isLoading ? 'Membuat preview Anda...' : 'Menyiapkan gambar...'}</p>
              </div>
            ) : errorPreparing ? (
               <div className="flex flex-col items-center gap-2 text-destructive p-4 text-center">
                <AlertTriangle className="h-8 w-8" />
                <p className='font-semibold'>Gagal Menyiapkan Gambar</p>
                <p className='text-xs'>{errorPreparing}</p>
              </div>
            ) : previewImage ? (
              <Image src={previewImage} alt="Realistic preview" width={256} height={256} className="h-full w-full object-contain" />
            ) : (
                <div className="text-center text-muted-foreground p-4">
                    <Wand2 className="mx-auto h-8 w-8" />
                    <p className="mt-2">Preview yang di-generate AI akan muncul di sini.</p>
                </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleGeneratePreview} disabled={isLoading || isPreparing || !!errorPreparing}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate
          </Button>
        </DialogFooter>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>
    </Dialog>
  );
}

    