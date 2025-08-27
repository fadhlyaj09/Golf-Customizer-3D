import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/products';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { getBanner } from '@/lib/banner';

export default async function Home() {
    const products = await getProducts();
    const { title, subtitle, imageUrl } = await getBanner();

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };
    
    const truncate = (str: string, n: number) => {
        return (str.length > n) ? str.slice(0, n-1) + '...' : str;
    };


  return (
    <div className="flex flex-col bg-background">
      <section className="relative h-[70vh] w-full text-white sm:h-[80vh]">
          <Image
              src={imageUrl || "https://picsum.photos/1920/1080?random=10"}
              alt="Aesthetic golf course"
              data-ai-hint="golf course"
              fill
              className="object-cover"
              priority
            />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center container mx-auto px-4 md:px-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl max-w-3xl">
              {title || 'Precision Meets Elegance'}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/90">
                {subtitle || 'Discover golf balls engineered for peak performance and designed for the modern player.'}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className='bg-white text-black hover:bg-white/90'>
                   <Link href="#products">Explore Collection</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className='border-white text-white hover:bg-white hover:text-black'>
                  <Link href="/product/ag-1-standard?custom=true">
                    Customize Your Own
                  </Link>
                </Button>
            </div>
        </div>
      </section>

      <section id="products" className="w-full bg-background py-16 md:py-24">
         <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Curated Collection</h2>
              <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Handpicked for quality and performance. Find the perfect ball for your game.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
               <Link key={product.id} href={`/product/${product.id}`} className="block group">
                <Card className="h-full flex flex-col overflow-hidden rounded-lg border-0 shadow-none transition-shadow duration-300 hover:shadow-xl">
                    <CardContent className="p-0">
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            data-ai-hint="golf ball"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        </div>
                    </CardContent>
                    <div className="flex flex-1 flex-col p-4 pt-4">
                       <h3 className="text-lg font-semibold">{product.name}</h3>
                       <p className="mt-2 text-sm text-muted-foreground flex-grow">
                          {truncate(product.description, 80)}
                       </p>
                       <div className="flex justify-between items-center mt-4">
                          <p className="text-base font-semibold">
                            {product.isFloater ? "Contact Us" : formatRupiah(product.basePrice)}
                          </p>
                          <Button variant="ghost" size="sm">
                              View Details <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                       </div>
                    </div>
                </Card>
              </Link>
            ))}
            </div>
         </div>
      </section>
    </div>
  );
}
