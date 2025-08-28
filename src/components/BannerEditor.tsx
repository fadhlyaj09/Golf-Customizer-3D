
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { saveBanner } from '@/actions/bannerActions';
import { getBanner } from '@/lib/banner';
import { Banner } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const BannerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  image: z.any()
    .optional()
    .refine((files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine((files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), "Only .jpg, .jpeg, .png and .webp formats are supported."),
});

type BannerFormValues = z.infer<typeof BannerSchema>;

export default function BannerEditor() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const { toast } = useToast();

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(BannerSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      image: undefined,
    },
  });

  useEffect(() => {
    const fetchBanner = async () => {
      setLoading(true);
      const fetchedBanner = await getBanner();
      if (fetchedBanner) {
        form.reset({
           title: fetchedBanner.title || '',
           subtitle: fetchedBanner.subtitle || '',
        });
        if (fetchedBanner.imageUrl) {
          setImagePreview(fetchedBanner.imageUrl);
          setCurrentImageUrl(fetchedBanner.imageUrl);
        }
      }
      setLoading(false);
    };
    fetchBanner();
  }, [form]);

  const onSubmit = (data: BannerFormValues) => {
    startTransition(async () => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('subtitle', data.subtitle);
        if (currentImageUrl) {
            formData.append('currentImageUrl', currentImageUrl);
        }
        if (data.image && data.image.length > 0) {
            formData.append('image', data.image[0]);
        }
        const result = await saveBanner(formData);
        if (result?.message) {
            toast({
                title: result.message.includes('success') ? 'Sukses' : 'Error',
                description: result.message,
                variant: result.message.includes('success') ? 'default' : 'destructive',
            })
        }
    });
  };
  
  if (loading) {
    return (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Banner</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub-judul Banner</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="image"
            render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                    <FormLabel>Gambar Banner</FormLabel>
                     <FormControl>
                        <Input 
                            type="file" 
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                onChange(e.target.files);
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setImagePreview(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                } else {
                                    setImagePreview(currentImageUrl);
                                }
                            }}
                            {...rest}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
         {imagePreview && (
            <div className="mt-2">
                <p className="text-sm font-medium mb-2">Pratinjau Banner:</p>
                <Image src={imagePreview} alt="Image preview" width={200} height={100} className="rounded-md object-cover" />
            </div>
        )}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Banner
          </Button>
        </div>
      </form>
    </Form>
  );
}
