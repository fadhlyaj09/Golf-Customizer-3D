import { Golf } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Golf className="h-6 w-6 text-primary" />
          <span className="font-semibold">Golf Customizer 3D</span>
        </Link>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Golf Customizer 3D. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
