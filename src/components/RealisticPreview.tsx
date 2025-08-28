'use client';

import { useState, useEffect } from 'react';
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

interface RealisticPreviewProps {
  children: React.ReactNode;
  ballDesignDataUri: string;
}

export function RealisticPreview({ children, ballDesignDataUri }: RealisticPreviewProps) {
  const [open, setOpen] = useState(false);
  const [lighting, setLighting] = useState('sunny');
  const [angle, setAngle] = useState('top-down');
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleGeneratePreview = async () => {
    if (isLoading) return;
    if (!ballDesignDataUri) {
        toast({ title: 'Kustomisasi Kosong', description: 'Tambahkan logo atau teks untuk membuat preview.', variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    setPreviewImage(null);
    setError(null);
    try {
      const result = await getRealisticPreview({
        ballDesignDataUri: ballDesignDataUri,
        lightingCondition: lighting,
        angle: angle,
      });
      setPreviewImage(result.previewImageDataUri);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
      setError(errorMessage);
      toast({
        title: 'Gagal Membuat Preview',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Clear state when dialog is closed
    if (!open) {
        setPreviewImage(null);
        setError(null);
        setIsLoading(false);
    }
  }, [open]);

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
                <RadioGroupItem value="sunny" id="r1" disabled={isLoading}/>
                <Label htmlFor="r1">Cerah</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="overcast" id="r2" disabled={isLoading}/>
                <Label htmlFor="r2">Mendung</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="indoor" id="r3" disabled={isLoading}/>
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
                <RadioGroupItem value="top-down" id="a1" disabled={isLoading}/>
                <Label htmlFor="a1">Atas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="side view" id="a2" disabled={isLoading}/>
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
            ) : error ? (
               <div className="flex flex-col items-center gap-2 text-destructive p-4 text-center">
                <AlertTriangle className="h-8 w-8" />
                <p className='font-semibold'>Gagal Membuat Gambar</p>
                <p className='text-xs'>{error}</p>
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
          <Button type="button" onClick={handleGeneratePreview} disabled={isLoading || !ballDesignDataUri}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
