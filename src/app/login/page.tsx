
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
    email: z.string().email('Alamat email tidak valid'),
    password: z.string().min(1, 'Password tidak boleh kosong'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.556,44,29.865,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
    );
}

export default function LoginPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user, loading } = useAuth();
    const searchParams = useSearchParams();
    const [isPasswordResetting, setIsPasswordResetting] = useState(false);
    
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' }
    });

    useEffect(() => {
        if (!loading && user) {
            const from = searchParams.get('from') || '/';
            router.replace(from);
        }
    }, [user, loading, router, searchParams]);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            toast({ title: "Login Berhasil", description: "Selamat datang!" });
            const from = searchParams.get('from') || '/';
            router.push(from);
        } catch (error: any) {
            console.error("Google Sign In Error", error);
            toast({ title: 'Login Gagal', description: 'Gagal masuk dengan Google.', variant: 'destructive' });
        }
    };

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
    };

    const handleForgotPassword = async () => {
        const email = form.getValues('email');
        if (!email) {
            form.setError('email', { type: 'manual', message: 'Masukkan email Anda untuk reset password.' });
            return;
        }

        setIsPasswordResetting(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast({ title: 'Email Reset Terkirim', description: 'Silakan periksa inbox Anda untuk instruksi reset password.' });
        } catch (error: any) {
            console.error("Forgot Password Error", error);
            toast({ title: 'Gagal Mengirim Email', description: 'Pastikan email yang Anda masukkan benar dan coba lagi.', variant: 'destructive' });
        } finally {
            setIsPasswordResetting(false);
        }
    };

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
                                    <div className="flex justify-between items-center">
                                        <FormLabel>Password</FormLabel>
                                        <button type="button" onClick={handleForgotPassword} className="text-xs font-medium text-primary hover:underline" disabled={isPasswordResetting}>
                                            Lupa Password?
                                        </button>
                                    </div>
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
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Atau lanjut dengan</span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                        <GoogleIcon className="mr-2 h-5 w-5" />
                        Masuk dengan Google
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="text-center text-sm text-muted-foreground">
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

    