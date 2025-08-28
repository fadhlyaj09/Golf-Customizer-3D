
import Link from 'next/link';
import { Logo } from './Logo';
import { Button } from './ui/button';
import { Input } from './ui/input';

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}


function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
        <path d="M12.52.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.78-1.61.57-.92.68-2.04.63-3.09-.04-1.88-.01-3.76-.01-5.64s-.01-3.76.01-5.64c.03-1.17.56-2.32 1.36-3.14.78-.8 1.79-1.33 2.86-1.57.29-.07.58-.12.88-.15.04-.44.09-.87.12-1.31.01.02.01.02.01.02z" />
    </svg>
  )
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10C2.5 4.24 4.24 2.5 7 2.5h10c2.76 0 4.5 1.74 4.5 4.5v10c0 2.76-1.74 4.5-4.5 4.5H7c-2.76 0-4.5-1.74-4.5-4.5Z" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col gap-4">
                <Logo />
                <p className="text-muted-foreground text-sm">
                    Perfect Ball For Your Game.
                </p>
                 <div className="flex items-center gap-4 mt-2">
                    <a href="https://instagram.com/articogolf" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <InstagramIcon className="h-5 w-5" />
                    </a>
                    <a href="https://tiktok.com/@articogolf" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <TiktokIcon className="h-5 w-5" />
                    </a>
                    <a href="https://youtube.com/@articogolf" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <YoutubeIcon className="h-5 w-5" />
                    </a>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                <h4 className="font-semibold">Shop</h4>
                <Link href="/#products" className="text-sm text-muted-foreground hover:text-foreground">Products</Link>
                <Link href="/product/ag-1-standard?custom=true" className="text-sm text-muted-foreground hover:text-foreground">Customize</Link>
            </div>
            <div className="flex flex-col gap-3">
                <h4 className="font-semibold">Support</h4>
                <a 
                  href="https://wa.me/6285723224918" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Contact
                </a>
                <Link href="/shipping-policy" className="text-sm text-muted-foreground hover:text-foreground">Shipping Policy</Link>
            </div>
            <div className="flex flex-col gap-3">
                <h4 className="font-semibold">Stay Connected</h4>
                <p className="text-sm text-muted-foreground">Join our mailing list for updates and special offers.</p>
                 <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input type="email" placeholder="Email" className="bg-secondary" />
                    <Button type="submit">Subscribe</Button>
                </div>
            </div>
             <div className="md:col-span-4 lg:col-span-4 mt-8 text-sm text-muted-foreground">
                <p className='font-medium text-foreground'>Articogolf Headquarter</p>
                <p>Jalan Sunter raya kemayoran No.53, RT.1/RW.3, Sunter Jaya, Kec. Tj. Priok, Jkt Utara, Daerah Khusus Ibukota Jakarta 14350</p>
            </div>
        </div>
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
           <div className='text-center sm:text-left'>
                <p>© {new Date().getFullYear()} Articogolf. All Rights Reserved.</p>
            </div>
            <div className="flex gap-4 mt-4 sm:mt-0">
                <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
                <Link href="#" className="hover:text-foreground">Terms of Service</Link>
            </div>
        </div>
      </div>
    </footer>
  );
}
