'use client';

import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';

export function Header() {
  const { cart } = useCart();
  const pathname = usePathname();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { href: '/product/articogolf-1-standard', label: 'Produk' },
    { href: '/product/articogolf-1-standard?custom=true', label: 'Custom Print' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'transition-colors hover:text-foreground/80',
                    (pathname.startsWith('/product') && link.label === 'Produk') || (pathname.startsWith('/product') && new URLSearchParams(window.location.search).get('custom') && link.label === 'Custom Print')
                      ? 'text-foreground'
                      : 'text-foreground/60'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
        </div>


        <div className="flex items-center gap-2">
          <Button asChild>
              <Link href="/cart">Pesan Sekarang</Link>
          </Button>
          <Button asChild variant="outline" size="icon">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
