'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';


export default function LoginPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();
    const searchParams = useSearchParams();
    
    useEffect(() => {
        // If user is already logged in, redirect them from the login page
        if(user) {
            const from = searchParams.get('from') || '/';
            router.replace(from);
        }
    }, [user, router, searchParams]);


    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            toast({ title: 'Login Berhasil', description: 'Selamat datang kembali!' });
            const from = searchParams.get('from') || '/';
            router.push(from);
        } catch (error) {
            console.error("Google Sign-In Error", error);
            toast({ title: 'Login Gagal', description: 'Terjadi kesalahan saat login dengan Google.', variant: 'destructive' });
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-background px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Pilih metode untuk masuk ke akun Anda.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
                        <FcGoogle className="mr-2 h-5 w-5" />
                        Lanjutkan dengan Google
                    </Button>
                </CardContent>
                <CardFooter className="flex justify-center text-sm">
                    <p>Belum punya akun?</p>
                    <Link href="/register" className="ml-1 font-semibold text-primary hover:underline">
                        Daftar
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
