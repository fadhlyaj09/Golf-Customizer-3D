'use client';

import { cn } from '@/lib/utils';
import { Facebook, Twitter } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Logo } from './Logo';


export function Header() {

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>

            <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
               <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                SUPPORT
               </Link>
               <Link href="#" className="text-foreground transition-colors hover:text-foreground/80">
                EN
               </Link>
               <span className='text-muted-foreground'>|</span>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                FR
               </Link>
            </nav>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="#"><Facebook className="h-4 w-4" /></Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="#"><Twitter className="h-4 w-4" /></Link>
                </Button>
            </div>
        </div>
    </header>
  );
}
