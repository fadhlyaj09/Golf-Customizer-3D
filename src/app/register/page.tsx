'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';


const registerSchema = z.object({
    firstName: z.string().min(2, 'Nama depan terlalu pendek'),
    lastName: z.string().min(2, 'Nama belakang terlalu pendek'),
    email: z.string().email('Alamat email tidak valid'),
    phone: z.string().min(10, 'Nomor telepon tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;


export default function RegisterPage() {
    const { toast } = useToast();
    const router = useRouter();

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

    const handleSignUp = async (data: RegisterFormValues) => {
        let user;
        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            user = userCredential.user;

            // 2. Update the user's profile in Firebase Auth
            await updateProfile(user, {
                displayName: `${data.firstName} ${data.lastName}`
            });
            
            // 3. Store additional user info in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                displayName: `${data.firstName} ${data.lastName}`,
                email: data.email,
                phone: data.phone,
                createdAt: new Date(),
            });

            toast({ title: 'Pendaftaran Berhasil', description: 'Akun Anda telah berhasil dibuat. Anda akan dialihkan.' });
            router.push('/');

        } catch (error: any) {
            console.error("Sign up error code:", error.code);
            console.error("Sign up error message:", error.message);
            
            // If writing to Firestore fails, delete the created Auth user to allow retry
            if (user) {
                await deleteUser(user);
                console.log("Partially created user was deleted from Auth.");
            }

            let errorMessage = 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.';
            } else if (error.code === 'permission-denied') {
                errorMessage = 'Gagal menyimpan data pengguna. Pastikan Firestore API telah diaktifkan di Google Cloud Console untuk proyek Anda dan aturan keamanan memperbolehkan penulisan.';
            }
            
            toast({ title: 'Pendaftaran Gagal', description: errorMessage, variant: 'destructive', duration: 9000 });
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-background px-4 py-12">
            <Card className="w-full max-w-2xl">
                 <CardHeader>
                    <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
                    <CardDescription>
                        Daftar untuk mendapatkan kontrol penuh atas pesanan Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSignUp)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField control={form.control} name="firstName" render={({ field }) => (
                                <FormItem><FormLabel>Nama Depan</FormLabel><FormControl><Input {...field} placeholder="John" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="lastName" render={({ field }) => (
                                <FormItem><FormLabel>Nama Belakang</FormLabel><FormControl><Input {...field} placeholder="Doe" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Alamat E-mail</FormLabel><FormControl><Input {...field} type="email" placeholder="example@email.com" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Nomor Telepon</FormLabel><FormControl><Input {...field} type="tel" placeholder="+62 812 3456 7890" /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem><FormLabel>Password</FormLabel><FormControl><Input {...field} type="password" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                <FormItem><FormLabel>Konfirmasi Password</FormLabel><FormControl><Input {...field} type="password" /></FormControl><FormMessage /></FormItem>
                            )} />

                            <div className="md:col-span-2 flex justify-end">
                                 <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Daftar
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
                 <CardFooter className="flex justify-center text-sm">
                    <p>Sudah punya akun?</p>
                    <Link href="/login" className="ml-1 font-semibold text-primary hover:underline">
                        Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
