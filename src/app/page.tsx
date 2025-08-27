
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProducts } from '@/lib/products';
import { ArrowRight, ChevronRight, DraftingCompass, Globe, Club } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const features = [
    {
        icon: <DraftingCompass className="w-8 h-8 text-primary" />,
        title: 'Golf Stick',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
    },
    {
        icon: <Club className="w-8 h-8 text-primary" />,
        title: 'Ball & Tee',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
    },
    {
        icon: <Globe className="w-8 h-8 text-primary" />,
        title: 'Stick Holder',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
    },
];

const testimonials = [
  { name: 'Jessica Alba', image: 'https://i.pravatar.cc/150?img=1' },
  { name: 'John Doe', image: 'https://i.pravatar.cc/150?img=2' },
  { name: 'Jane Smith', image: 'https://i.pravatar.cc/150?img=3' },
  { name: 'Peter Jones', image: 'https://i.pravatar.cc/150?img=4' },
  { name: 'Mary Jane', image: 'https://i.pravatar.cc/150?img=5' },
];


export default async function Home() {
    const products = await getProducts();

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    }
  return (
    <div className="flex flex-col">
      <section className="relative h-[80vh] w-full text-white">
        <Image
          src="https://picsum.photos/1920/1080?random=10"
          alt="Man playing golf"
          data-ai-hint="man playing golf"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center container mx-auto px-4 md:px-6">
          <p className="text-lg font-bold text-green-400">ENJOY THE ULTIMATE</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-8xl mt-2">
            GOLF EXPERIENCE
          </h1>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="#products">
                Shop Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {features.map((feature, index) => (
                    <div key={index} className="flex flex-col items-center text-center p-6 border border-gray-200 rounded-lg">
                        {feature.icon}
                        <h3 className="text-xl font-bold mt-4 mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground mb-4">{feature.description}</p>
                        <Button variant="ghost" className="text-primary hover:text-primary">
                            Read More <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
      </section>


      <section id="products" className="w-full bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl">
            Special Products
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="block h-full">
                <Card className="group h-full transform overflow-hidden rounded-lg border shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader className="p-0">
                    <div className="relative h-60 w-full">
                      <Image
                        src={product.imageUrl || 'https://placehold.co/400x400'}
                        alt={product.name}
                        fill
                        data-ai-hint="golf accessory"
                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center text-center p-6">
                    <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
                    <p className="mt-2 text-md font-bold text-primary">
                      {product.isFloater ? "Hubungi untuk harga" : formatRupiah(product.basePrice)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-gray-800 py-16 md:py-24 text-white" style={{backgroundImage: 'url(/golf-pattern.svg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
         <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tighter sm:text-4xl">Thus Spake our Customers</h2>
            <p className="max-w-2xl mx-auto mb-12 text-gray-300">
                We are rated 4.9 out of 5 stars by our customers. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
            </p>
            <div className="flex justify-center items-center gap-4 md:gap-8">
                {testimonials.map((t, i) => (
                    <div key={t.name} className={`flex flex-col items-center gap-2 ${i === 2 ? 'transform scale-125' : 'opacity-60'}`}>
                        <Avatar className={`h-20 w-20 border-4 ${i === 2 ? 'border-primary' : 'border-gray-500'}`}>
                            <AvatarImage src={t.image} alt={t.name} />
                            <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {i === 2 && <p className="font-bold mt-2">{t.name}</p>}
                    </div>
                ))}
            </div>
         </div>
      </section>
    </div>
  );
}
