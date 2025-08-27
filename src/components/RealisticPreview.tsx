'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RealisticPreviewProps {
  children: React.ReactNode;
  ballDesignDataUri: string;
  customText?: string;
}

export function RealisticPreview({ children, ballDesignDataUri, customText }: RealisticPreviewProps) {
  const [open, setOpen] = useState(false);
  const [lighting, setLighting] = useState('sunny');
  const [angle, setAngle] = useState('top-down');
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [compositeImage, setCompositeImage] = useState<string>('');
  
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setPreviewImage(null);
      setIsLoading(false);
      setCompositeImage('');
      
      // Create a composite image using canvas
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const baseImage = new window.Image();
      baseImage.crossOrigin = "Anonymous"; 
      baseImage.src = 'https://picsum.photos/512/512?random=ball';
      
      baseImage.onload = () => {
        canvas.width = baseImage.width;
        canvas.height = baseImage.height;
        ctx.drawImage(baseImage, 0, 0);

        if (ballDesignDataUri.startsWith('data:image')) {
            const logoImage = new window.Image();
            logoImage.src = ballDesignDataUri;
            logoImage.onload = () => {
                const logoSize = 100;
                const x = (canvas.width - logoSize) / 2;
                const y = (canvas.height - logoSize) / 2;
                ctx.drawImage(logoImage, x, y, logoSize, logoSize);
                if (customText) drawText();
                setCompositeImage(canvas.toDataURL('image/png'));
            }
        } else {
             if (customText) drawText();
             setCompositeImage(canvas.toDataURL('image/png'));
        }
      };
      
      baseImage.onerror = () => {
        toast({
          title: 'Gagal Memuat Gambar Dasar',
          description: 'Tidak dapat memuat gambar bola golf. Silakan coba lagi.',
          variant: 'destructive'
        })
      }

      const drawText = () => {
        if(customText) {
            ctx.fillStyle = 'black';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(customText, canvas.width / 2, canvas.height * 0.7);
        }
      }
    }
  }, [open, ballDesignDataUri, customText, toast]);


  const handleGeneratePreview = async () => {
    setIsLoading(true);
    setPreviewImage(null);
    try {
      if(!compositeImage) {
        throw new Error('Gambar desain dasar belum siap.');
      }
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
                <RadioGroupItem value="sunny" id="r1" />
                <Label htmlFor="r1">Cerah</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="overcast" id="r2" />
                <Label htmlFor="r2">Mendung</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="indoor" id="r3" />
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
                <RadioGroupItem value="top-down" id="a1" />
                <Label htmlFor="a1">Atas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="side view" id="a2" />
                <Label htmlFor="a2">Samping</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="mt-4 flex h-64 w-full items-center justify-center rounded-lg border bg-muted/50">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Membuat preview Anda...</p>
              </div>
            ) : previewImage ? (
              <Image src={previewImage} alt="Realistic preview" width={256} height={256} className="h-full w-full object-contain" />
            ) : (
                <div className="text-center text-muted-foreground">
                    <Wand2 className="mx-auto h-8 w-8" />
                    <p className="mt-2">Preview yang di-generate AI akan muncul di sini.</p>
                </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleGeneratePreview} disabled={isLoading || !compositeImage}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate
          </Button>
        </DialogFooter>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>
    </Dialog>
  );
}
