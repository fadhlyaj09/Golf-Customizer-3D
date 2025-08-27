import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/products';
import { ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getBanner } from '@/lib/banner';

export default async function Home() {
    const products = await getProducts();
    const { title, subtitle, imageUrl } = await getBanner();

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };
    
    // Truncate description to 100 characters
    const truncate = (str: string, n: number) => {
        return (str.length > n) ? str.slice(0, n-1) + '...' : str;
    };


  return (
    <div className="flex flex-col">
        {/* Hero Section */}
      <section className="relative h-[70vh] w-full text-white">
          <Image
              src={imageUrl || "https://picsum.photos/1920/1080?random=10"}
              alt="Aesthetic golf course"
              data-ai-hint="golf course"
              fill
              className="object-cover"
              priority
            />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex h-full flex-col items-start justify-center text-left container mx-auto px-4 md:px-6">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl max-w-2xl">
              {title || 'ARTICOGOLF AG-1 – New 2025 Design'}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/90">
                {subtitle || 'Extreme Distance & Soft Feel'}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className='bg-primary hover:bg-primary/90 text-primary-foreground'>
                   <Link href="#products">Lihat Produk</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/product/ag-1-standard?custom=true">
                    Buat Custom Bola
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
            </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="w-full bg-background py-16 md:py-24">
         <div className="container mx-auto px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl">Koleksi Produk Kami</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
               <Link key={product.id} href={`/product/${product.id}`} className="block group">
                <Card className="h-full flex flex-col overflow-hidden rounded-lg border shadow-sm transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1">
                    <CardHeader className="p-0">
                        <div className="relative h-60 w-full overflow-hidden">
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            data-ai-hint="golf ball"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col p-4">
                       <h3 className="text-lg font-semibold">{product.name}</h3>
                       <p className="mt-1 text-base font-bold text-primary">
                          {product.isFloater ? "Hubungi untuk harga" : formatRupiah(product.basePrice)}
                       </p>
                       <p className="mt-2 text-sm text-muted-foreground flex-grow">
                          {truncate(product.description, 80)}
                       </p>
                       <Button variant="outline" className="mt-4 w-full">
                           {product.isFloater ? "Konsultasi" : "Detail Produk"}
                       </Button>
                    </CardContent>
                </Card>
              </Link>
            ))}
            </div>
         </div>
      </section>
    </div>
  );
}
