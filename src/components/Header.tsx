
'use client';

import { cn } from '@/lib/utils';
import { LogOut, ShoppingCart, User as UserIcon, X, Menu, UserCog } from 'lucide-react';
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
  
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = user?.email === adminEmail;

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
        isMobile ? "flex flex-col gap-4 mt-8 text-lg" : "hidden md:flex"
      )}>
        {navLinks.map(link => (
             <Link key={link.href} href={link.href} className="text-foreground/80 transition-colors hover:text-foreground" onClick={() => isMobile && setMobileMenuOpen(false)}>
              {link.label}
             </Link>
        ))}
      </nav>
  );

  const renderUserMenu = () => {
    if (loading) {
      return <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />;
    }
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
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
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-7xl items-center justify-between">
        <div className="flex items-center gap-8">
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
                        <span className="absolute top-2 right-2 flex h-2 w-2 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        </span>
                    )}
                    <span className="sr-only">Shopping Cart</span>
                </Link>
            </Button>
            
            {isAdmin && (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin">
                  <UserCog className="h-5 w-5" />
                   <span className="sr-only">Admin Dashboard</span>
                </Link>
              </Button>
            )}

            {renderUserMenu()}

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                  <Button variant="ghost" size="icon"><Menu className="h-5 w-5"/></Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className='flex justify-between items-center mb-8'>
                    <Link href="/" onClick={() => setMobileMenuOpen(false)}><Logo /></Link>
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}><X className="h-5 w-5"/></Button>
                </div>
                 {renderNavLinks(true)}
                 <div className='flex flex-col gap-2 mt-8 border-t pt-6'>
                    {user ? (
                      <div className='text-center'>
                        <p>Welcome, {user.displayName}</p>
                         {isAdmin && (
                            <Button onClick={() => { router.push('/admin'); setMobileMenuOpen(false); }} className='w-full mt-2' variant="secondary">
                                Admin
                            </Button>
                         )}
                        <Button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className='w-full mt-2'>Logout</Button>
                      </div>
                    ) : (
                      <>
                        <Button asChild variant="outline" className='w-full' onClick={() => setMobileMenuOpen(false)}>
                          <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild variant="default" className='w-full' onClick={() => setMobileMenuOpen(false)}>
                          <Link href="/register">Sign Up</Link>
                        </Button>
                      </>
                    )}
                 </div>
              </SheetContent>
            </Sheet>
          </div>
          
        </div>
      </div>
    </header>
  );
}
