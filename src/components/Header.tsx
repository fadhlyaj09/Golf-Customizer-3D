'use client';

import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { Club, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';

export function Header() {
  const { cart } = useCart();
  const pathname = usePathname();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/product/ag-1', label: 'Products' },
    { href: '/cart', label: 'Cart' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Club className="h-7 w-7 text-primary" />
          <span className="hidden font-bold sm:inline-block">Golf Customizer 3D</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === link.href ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
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
