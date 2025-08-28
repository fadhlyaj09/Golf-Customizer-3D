
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { auth, googleProvider } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Invalid phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
});

type RegisterFormValues = z.infer<typeof registerSchema>;


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

export default function RegisterPage() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading } = useAuth();


    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        }
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
            toast({ title: "Daftar Berhasil", description: "Selamat datang!" });
            const from = searchParams.get('from') || '/';
            router.push(from);
        } catch (error: any) {
            console.error("Google Sign In Error", error);
            toast({ title: 'Daftar Gagal', description: 'Gagal mendaftar dengan Google.', variant: 'destructive' });
        }
    };


    const handleSignUp = async (data: RegisterFormValues) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            
            await updateProfile(userCredential.user, {
                displayName: `${data.firstName} ${data.lastName}`
            });
            
            toast({ title: 'Registration Successful', description: 'Your account has been created. You will be redirected.' });
            const from = searchParams.get('from') || '/';
            router.push(from);

        } catch (error: any) {
            console.error("Sign up error:", error);
            
            let errorMessage = 'An error occurred during registration. Please try again.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Please use another email or log in.';
            }
            
            toast({ title: 'Registration Failed', description: errorMessage, variant: 'destructive' });
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-background px-4 py-12">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Create a New Account</CardTitle>
                    <CardDescription>
                        Sign up to get full control over your orders.
                    </CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSignUp)}>
                        <CardContent className="grid grid-cols-1 gap-6">
                             <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn}>
                                <GoogleIcon className="mr-2 h-5 w-5" />
                                Daftar dengan Google
                            </Button>
                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Atau daftar dengan email</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="firstName" render={({ field }) => (
                                    <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} placeholder="John" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="lastName" render={({ field }) => (
                                    <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} placeholder="Doe" /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input {...field} type="email" placeholder="example@email.com" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} type="tel" placeholder="Your phone number" /></FormControl><FormMessage /></FormItem>
                            )} />
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="password" render={({ field }) => (
                                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input {...field} type="password" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                    <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input {...field} type="password" /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                             <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign Up
                            </Button>
                            <div className="text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link href="/login" className="font-semibold text-primary hover:underline">
                                    Login
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}

    