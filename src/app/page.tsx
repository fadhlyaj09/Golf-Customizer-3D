'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { products } from '@/lib/products';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    }
  return (
    <div className="flex flex-col">
      <section className="relative h-[70vh] w-full text-white">
        <Image
          src="https://picsum.photos/1920/1080?random=10"
          alt="Aesthetic golf course"
          data-ai-hint="golf course"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-start justify-center text-left container mx-auto px-4 md:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-background sm:text-5xl md:text-6xl max-w-2xl">
            ARTICOGOLF AG-1 – New 2025 Design
          </h1>
          <p className="mt-4 max-w-xl text-lg text-background/90">
            Extreme Distance & Soft Feel
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="#products">
                Lihat Produk
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
                <Link href="/product/articogolf-1-standard">
                    Buat Custom Bola
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="products" className="w-full bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl">
            Koleksi Produk Kami
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <Card className="group h-full transform overflow-hidden rounded-lg border shadow-sm transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <CardHeader className="p-0">
                    <div className="relative h-60 w-full">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        data-ai-hint="golf ball"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col p-6">
                    <CardTitle className="text-xl font-semibold">{product.name}</CardTitle>
                    <p className="mt-4 text-lg font-bold text-primary">
                      {formatRupiah(product.basePrice)}
                    </p>
                    <Button variant="outline" className="mt-4 w-full">
                        Detail Produk
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
