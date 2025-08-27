'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function RegisterPage() {

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Sign up form submitted');
    }

    return (
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-background px-4 py-12">
            <Card className="w-full max-w-2xl">
                 <CardHeader>
                    <CardTitle className="text-2xl">No account? Sign up</CardTitle>
                    <CardDescription>
                        Registration takes less than a minute but gives you full control over your orders.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="first-name">First Name</Label>
                            <Input id="first-name" placeholder="John" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last-name">Last Name</Label>
                            <Input id="last-name" placeholder="Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail Address</Label>
                            <Input id="email" type="email" placeholder="example@email.com" defaultValue="fadhlyaj09@gmail.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="+62 812 3456 7890" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input id="confirm-password" type="password" />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                             <Button type="submit" className="w-full md:w-auto">
                                Sign Up
                            </Button>
                        </div>
                    </form>
                </CardContent>
                 <CardFooter className="flex justify-center text-sm">
                    <p>Already have an account?</p>
                    <Link href="/login" className="ml-1 font-semibold text-primary hover:underline">
                        Log in
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
