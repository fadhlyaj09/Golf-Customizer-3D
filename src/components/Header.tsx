'use client';

import { cn } from '@/lib/utils';
import { LogOut, ShoppingCart, User as UserIcon, X, Menu, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';


export function Header() {
  const { user, logOut, loading } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const handleLogout = async () => {
    await logOut();
    router.push('/');
  }

  const userInitial = user?.displayName?.charAt(0).toUpperCase() || '?';

  const navLinks = [
    { href: "/product/ag-1-standard", label: "Products" },
    { href: "/product/ag-1-standard?custom=true", label: "Customize" },
    { href: "#", label: "About" },
  ]
  
  const renderNavLinks = (isMobile: boolean = false) => (
     <nav className={cn(
        "items-center gap-6 text-sm font-medium",
        isMobile ? "flex flex-col gap-4 mt-8" : "hidden md:flex"
      )}>
        {navLinks.map(link => (
             <Link key={link.href} href={link.href} className="text-foreground/80 transition-colors hover:text-foreground">
              {link.label}
             </Link>
        ))}
      </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>
             {renderNavLinks(false)}
        </div>


        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {totalCartItems > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {totalCartItems}
                        </span>
                    )}
                    <span className="sr-only">Shopping Cart</span>
                </Link>
            </Button>

          {loading ? (
             <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{userInitial}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link href="/admin">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
          
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                  <Button variant="ghost" size="icon"><Menu /></Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className='flex justify-between items-center mb-8'>
                    <Logo />
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}><X /></Button>
                </div>
                 {renderNavLinks(true)}
              </SheetContent>
            </Sheet>
          </div>
          
        </div>
      </div>
    </header>
  );
}
