import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { products } from '@/lib/products';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative h-[60vh] w-full text-white">
        <Image
          src="https://picsum.photos/1920/1080"
          alt="Aesthetic golf ball"
          data-ai-hint="golf ball"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold tracking-tight text-background sm:text-5xl md:text-6xl">
            Golf Customizer 3D
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-background/90">
            Desain bola golf unik Anda dengan preview 3D interaktif.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90">
            <Link href="#products">
              Buat Bola Golf Custom Kamu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section id="products" className="w-full bg-background py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tighter sm:text-4xl">
            Pilih Kategori Produk
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <Card className="group h-full transform overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                  <CardHeader className="p-0">
                    <div className="relative h-60 w-full">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        data-ai-hint="golf ball"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-xl font-semibold">{product.name}</CardTitle>
                    <p className="mt-2 text-muted-foreground">{product.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-lg font-bold text-primary">
                        ${product.basePrice.toFixed(2)}
                      </p>
                      <Button variant="ghost" size="sm">
                        Customize
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
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
