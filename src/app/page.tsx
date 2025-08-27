import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight, Dot } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const appStores = [
  { name: 'App Store', imageUrl: 'https://placehold.co/135x40/000000/FFFFFF/png?text=App+Store' },
  { name: 'Google Play', imageUrl: 'https://placehold.co/135x40/000000/FFFFFF/png?text=Google+Play' },
  { name: 'Amazon', imageUrl: 'https://placehold.co/135x40/000000/FFFFFF/png?text=Amazon' },
];

const features = [
  {
    title: 'SOCIAL PROGRESSION',
    description: [
      'Progress with your friends',
      'Complete achievements',
      'Discover new courses',
    ],
    image: 'https://picsum.photos/300/533?random=1',
  },
  {
    title: 'REAL GOLF FEELING',
    description: [
      'Portrait gameplay',
      'Intuitive one hand controls',
      'Mobile tailored experience',
    ],
    image: 'https://picsum.photos/300/533?random=2',
  },
  {
    title: 'MULTIPLAYER',
    description: [
      'Turn based matchmaking',
      'New challenges every day',
      'Ranked games',
    ],
    image: 'https://picsum.photos/300/533?random=3',
  },
];


export default async function Home() {

  return (
    <div className="flex flex-col bg-[#080a0b]">
      <section className="relative h-[60vh] w-full text-white flex flex-col items-center justify-center">
        <Image
          src="https://picsum.photos/1920/1080?random=10"
          alt="Golf course background"
          data-ai-hint="golf course dawn"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center container mx-auto px-4 md:px-6">
          <div className="flex gap-4 mb-8">
            {appStores.map((store) => (
              <Link href="#" key={store.name}>
                <Image src={store.imageUrl} alt={store.name} width={135} height={40} className='rounded-md' />
              </Link>
            ))}
          </div>
          
          <div className='relative w-80 h-80'>
            <Image src="https://picsum.photos/400/400?random=11" alt="Golf ball" data-ai-hint="golf ball" fill className="object-contain" />
          </div>

          <h1 className="text-8xl font-extrabold tracking-tight text-white uppercase" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
            <span className='block text-5xl font-light tracking-widest'>Real Feel</span>
            Golf
          </h1>
        </div>
      </section>

      <section className="w-full bg-[#080a0b] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="flex items-center justify-center gap-8">
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white">
                <ChevronLeft className="w-8 h-8" />
            </Button>
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center text-left">
                <Image src={feature.image} alt={feature.title} width={300} height={533} data-ai-hint="golf mobile game" className="rounded-lg border-2 border-white/10" />
                <h3 className="text-xl font-bold mt-6 mb-3 text-primary uppercase">{feature.title}</h3>
                <ul className="space-y-1 text-muted-foreground">
                  {feature.description.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Dot className="text-primary w-5 h-5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white">
                <ChevronRight className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#111314] py-16 md:py-24 text-center">
         <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary uppercase">A Fast-Paced Golf Simulation</h2>
            <p className="text-muted-foreground leading-relaxed">
              REAL FEEL GOLF takes the golf simulation genre in a new direction, delivering revolutionary controls, cutting-edge social features and a fresh, contemporary style that opens golf gaming up to a wide new audience of casual and experienced golf fans!
              <br/><br/>
              Built exclusively for touch screens, Real Feel Golf's innovative "one hand" control scheme replicates the real-world actions of golf in a simplistic way never experienced before. The game's portrait view and seamlessly embedded social features makes REAL FEEL GOLF the perfect companion for all golf fans.
            </p>
         </div>
      </section>
    </div>
  );
}
