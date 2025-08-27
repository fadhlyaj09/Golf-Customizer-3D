import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background">
      <div className="container mx-auto flex flex-col sm:flex-row h-auto sm:h-24 items-center justify-between py-6 sm:py-0 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        <nav className="flex gap-4 sm:gap-6 mt-4 sm:mt-0 text-sm">
            <Link href="/product/articogolf-1-standard" className="text-muted-foreground hover:text-foreground">Produk</Link>
            <Link href="/product/articogolf-1-standard?custom=true" className="text-muted-foreground hover:text-foreground">Custom</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">FAQ</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">Kontak</Link>
        </nav>
        <p className="text-sm text-muted-foreground mt-4 sm:mt-0">
          © {new Date().getFullYear()} Articogolf. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
