'use client';

import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { LogOut, ShoppingCart, User as UserIcon, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

export function Header() {
  const { cart } = useCart();
  const pathname = usePathname();
  const { user, logOut, loading } = useAuth();
  const router = useRouter();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/product/ag-1-standard', label: 'Shop' },
    { href: '/product/ag-1-standard?custom=true', label: 'Custom' },
    { href: '/admin', label: 'Admin' },
  ];
  
  const handleLogout = async () => {
    await logOut();
    router.push('/');
  }

  const renderUserAuth = () => {
    if (loading) {
      return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
    }

    if (user) {
      return (
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                <AvatarFallback><UserIcon className="h-5 w-5"/></AvatarFallback>
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
      <Button asChild variant="ghost" size="icon">
        <Link href="/login">
          <UserIcon className="h-6 w-6" />
          <span className="sr-only">Login</span>
        </Link>
      </Button>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="bg-primary text-primary-foreground">
            <div className="container flex h-16 max-w-7xl items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                <Logo />
                </Link>

                <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                {navLinks.map((link) => (
                    <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        'transition-colors hover:text-primary-foreground/80',
                        pathname === link.href
                        ? 'text-primary-foreground'
                        : 'text-primary-foreground/70'
                    )}
                    >
                    {link.label}
                    </Link>
                ))}
                </nav>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon">
                        <Search className="h-6 w-6" />
                        <span className="sr-only">Search</span>
                    </Button>
                    {renderUserAuth()}
                    <Button asChild variant="ghost" size="icon" className="relative">
                        <Link href="/cart">
                        <ShoppingCart className="h-6 w-6" />
                        {totalItems > 0 && (
                            <span className="absolute top-0 right-0 flex h-5 w-5 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-background text-xs font-semibold text-primary">
                            {totalItems}
                            </span>
                        )}
                        <span className="sr-only">Shopping Cart</span>
                        </Link>
                    </Button>
                </div>
            </div>
      </div>
    </header>
  );
}
