'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';


const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;


export default function LoginPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();
    const searchParams = useSearchParams();
    
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' }
    });

    useEffect(() => {
        if(user) {
            const from = searchParams.get('from') || '/';
            router.replace(from);
        }
    }, [user, router, searchParams]);


    const handleLogin = async (data: LoginFormValues) => {
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            toast({ title: 'Login Berhasil', description: 'Selamat datang kembali!' });
            const from = searchParams.get('from') || '/';
            router.push(from);
        } catch (error) {
            console.error("Login Error", error);
            toast({ title: 'Login Gagal', description: 'Email atau kata sandi salah.', variant: 'destructive' });
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-background px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Masuk ke akun Anda untuk melanjutkan.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleLogin)} className="grid gap-4">
                             <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input {...field} placeholder="example@email.com" type="email" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl><Input {...field} type="password" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Login
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="text-center text-sm text-muted-foreground">
                        Atau lanjutkan dengan
                    </div>
                     <Button onClick={() => toast({ title: 'Segera Hadir', description: 'Login dengan Google akan segera tersedia.'})} variant="outline" className="w-full">
                        Lanjutkan dengan Google
                    </Button>
                    <div className="mt-4 text-center text-sm">
                        Belum punya akun?{' '}
                        <Link href="/register" className="font-semibold text-primary hover:underline">
                            Daftar
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
