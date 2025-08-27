import Link from 'next/link';
import { Logo } from './Logo';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-4">
                <Logo />
                <p className="text-muted-foreground text-sm">
                    Premium golf balls for the modern player.
                </p>
            </div>
            <div className="flex flex-col gap-3">
                <h4 className="font-semibold">Shop</h4>
                <Link href="/product/ag-1-standard" className="text-sm text-muted-foreground hover:text-foreground">Products</Link>
                <Link href="/product/ag-1-standard?custom=true" className="text-sm text-muted-foreground hover:text-foreground">Customize</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Best Sellers</Link>
            </div>
            <div className="flex flex-col gap-3">
                <h4 className="font-semibold">Support</h4>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</Link>
            </div>
            <div className="flex flex-col gap-3">
                <h4 className="font-semibold">Stay Connected</h4>
                <p className="text-sm text-muted-foreground">Join our mailing list for updates and special offers.</p>
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input type="email" placeholder="Email" className="bg-secondary" />
                    <Button type="submit">Subscribe</Button>
                </div>
            </div>
        </div>
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Articogolf. All Rights Reserved.</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
                <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
                <Link href="#" className="hover:text-foreground">Terms of Service</Link>
            </div>
        </div>
      </div>
    </footer>
  );
}
