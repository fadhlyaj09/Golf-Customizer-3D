import Link from 'next/link';
import { Logo } from './Logo';
import { Button } from './ui/button';
import { Facebook, Twitter } from 'lucide-react';
import Image from 'next/image';

const appStores = [
  { name: 'App Store', imageUrl: 'https://placehold.co/135x40/000000/FFFFFF/png?text=App+Store' },
  { name: 'Google Play', imageUrl: 'https://placehold.co/135x40/000000/FFFFFF/png?text=Google+Play' },
  { name: 'Amazon', imageUrl: 'https://placehold.co/135x40/000000/FFFFFF/png?text=Amazon' },
];


export function Footer() {
  return (
    <footer className="w-full bg-[#111314] border-t border-white/10 text-muted-foreground">
        <div className="container mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
                <h3 className="font-bold text-white mb-4">Facebook</h3>
                <div className='space-y-4 text-sm'>
                    <p>Link shared on: July 3, 2014</p>
                    <p>Link shared on: June 25, 2014<br/>StarCitizen Monthly Report - June 2014</p>
                    <p>Link shared on: June 25, 2014<br/>Watch the first of five CG teasers introducing the races of Warhammer 40,000: Eternal Crusade</p>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-white mb-4">Tweets</h3>
                 <div className='space-y-4 text-sm'>
                    <p>Nathalie Vallires @NatVallieres - Jul 2<br/>Poste à pourvoir: Administrateur réseau / Network Administ</p>
                    <p>Nikki Grives @nikki_grives - Jun 26<br/>@miguelcaron @behaviour The game vids look amazing!! :D Cant wait! Got my first character named!</p>
                    <p>Nathalie Vallires @NatVallieres - Jun 26<br/>Poste à pourvoir: Concepteur de son/Sound Designer @behaviour</p>
                </div>
            </div>
        </div>
      <div className="bg-black">
        <div className="container mx-auto flex items-center justify-between py-8 px-4 md:px-6">
            <div className="flex gap-4">
              {appStores.map((store) => (
                <Link href="#" key={store.name}>
                  <Image src={store.imageUrl} alt={store.name} width={135} height={40} className='rounded-md' />
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-8">
              <Logo />
               <div className="text-xs">
                <p>© 2012 Behaviour Interactive Inc. | Behaviour and logo are trademarks of Behaviour Interactive Inc. All rights reserved.</p>
                 <div className="flex gap-4 mt-1">
                    <Link href="#" className="hover:text-white">Privacy Policy</Link>
                    <Link href="#" className="hover:text-white">Terms of Service</Link>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="#"><Facebook className="h-4 w-4" /></Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="#"><Twitter className="h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
        </div>
      </div>
    </footer>
  );
}
