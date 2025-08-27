import Link from 'next/link';
import { Logo } from './Logo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-background border-t">
        <div className="py-12 bg-gray-100">
            <div className="container mx-auto px-4 md:px-6 text-center">
                <h3 className="text-2xl font-bold">Sign up For our Discounts today!</h3>
                <p className="text-muted-foreground mt-2 mb-6 max-w-xl mx-auto">
                    Promotional offers, new products and sales. Directly to your inbox.
                    We’ll never share your email address with a third-party.
                </p>
                <form className="flex max-w-md mx-auto">
                    <Input type="email" placeholder="Enter your email address" className="rounded-r-none focus:z-10" />
                    <Button type="submit" className="rounded-l-none">Subscribe</Button>
                </form>
                <div className="flex justify-center gap-4 mt-6">
                    <Link href="#"><Facebook className="w-6 h-6 text-muted-foreground hover:text-primary" /></Link>
                    <Link href="#"><Twitter className="w-6 h-6 text-muted-foreground hover:text-primary" /></Link>
                    <Link href="#"><Instagram className="w-6 h-6 text-muted-foreground hover:text-primary" /></Link>
                    <Link href="#"><Youtube className="w-6 h-6 text-muted-foreground hover:text-primary" /></Link>
                </div>
            </div>
        </div>
      <div className="bg-neutral-900 text-neutral-300">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 py-12 px-4 md:px-6">
            <div>
                <Logo />
                <p className="mt-4 text-sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
            </div>
            <div>
                <h4 className="font-bold text-white mb-4">Help</h4>
                <nav className="flex flex-col gap-2 text-sm">
                    <Link href="#" className="hover:text-primary">Search</Link>
                    <Link href="#" className="hover:text-primary">Help</Link>
                    <Link href="#" className="hover:text-primary">Information</Link>
                    <Link href="#" className="hover:text-primary">Privacy Policy</Link>
                    <Link href="#" className="hover:text-primary">Shipping Details</Link>
                </nav>
            </div>
            <div>
                 <h4 className="font-bold text-white mb-4">Support</h4>
                <nav className="flex flex-col gap-2 text-sm">
                    <Link href="#" className="hover:text-primary">Contact us</Link>
                    <Link href="#" className="hover:text-primary">About us</Link>
                    <Link href="#" className="hover:text-primary">Careers</Link>
                    <Link href="#" className="hover:text-primary">Refunds & Returns</Link>
                    <Link href="#" className="hover:text-primary">Deliveries</Link>
                </nav>
            </div>
            <div>
                 <h4 className="font-bold text-white mb-4">Information</h4>
                 <div className="text-sm flex flex-col gap-2">
                    <p>Lorem Ipsum, 40C, Lorem Ipsum, 64500, India</p>
                    <p>+91 9876543210</p>
                    <p>info@golf.com</p>
                 </div>
            </div>
        </div>
        <div className="border-t border-neutral-700">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between py-4 px-4 md:px-6 text-sm">
                <p>&copy; {new Date().getFullYear()} Articogolf. All Rights Reserved.</p>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <p>Visa</p>
                    <p>MasterCard</p>
                    <p>PayPal</p>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
}
