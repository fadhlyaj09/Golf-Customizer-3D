
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

const registerSchema = z.object({
    displayName: z.string().min(1, 'Nama tidak boleh kosong'),
    email: z.string().email('Alamat email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading } = useAuth();


    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            displayName: '',
            email: '',
            password: '',
        }
    });

    useEffect(() => {
        if (!loading && user) {
            const from = searchParams.get('from') || '/';
            router.replace(from);
        }
    }, [user, loading, router, searchParams]);

    const handleSignUp = async (data: RegisterFormValues) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            
            await updateProfile(userCredential.user, {
                displayName: data.displayName
            });
            
            toast({ title: 'Pendaftaran Berhasil', description: 'Akun Anda telah berhasil dibuat. Anda akan dialihkan.' });
            router.push('/');

        } catch (error: any) {
            console.error("Sign up error:", error);
            
            let errorMessage = 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.';
            }
            
            toast({ title: 'Pendaftaran Gagal', description: errorMessage, variant: 'destructive' });
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-background px-4 py-12">
            <Card className="w-full max-w-lg">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSignUp)}>
                        <CardHeader>
                            <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
                            <CardDescription>
                                Daftar untuk mendapatkan kontrol penuh atas pesanan Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-6">
                            <FormField control={form.control} name="displayName" render={({ field }) => (
                                <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input {...field} placeholder="Nama Anda" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Alamat E-mail</FormLabel><FormControl><Input {...field} type="email" placeholder="example@email.com" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem><FormLabel>Password</FormLabel><FormControl><Input {...field} type="password" /></FormControl><FormMessage /></FormItem>
                            )} />
                             <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Daftar
                            </Button>
                        </CardContent>
                    </form>
                </Form>
                <CardFooter className="flex justify-center text-sm">
                    <p className="text-muted-foreground">Sudah punya akun?</p>
                    <Link href="/login" className="ml-1 font-semibold text-primary hover:underline">
                        Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
