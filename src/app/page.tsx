
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/products';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { getBanner } from '@/lib/banner';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default async function Home() {
    const products = await getProducts();
    const { title, subtitle, imageUrl } = await getBanner();

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };
    
    const truncate = (str: string, n: number) => {
        return (str.length > n) ? str.slice(0, n-1) + '...' : str;
    };

    const slides = [
        {
            title: title || 'Precision Meets Elegance',
            subtitle: subtitle || 'Discover golf balls engineered for peak performance and designed for the modern player.',
            imageUrl: imageUrl || "/images/hero-banner.jpg",
            alt: "Aesthetic golf course",
            hint: "golf course landscape",
            buttons: [
                { href: "#products", text: "Explore Collection", variant: "default" },
                { href: "/product/ag-1-standard?custom=true", text: "Customize Your Own", variant: "outline" }
            ]
        },
        {
            title: "New Arrival: AG-3 Pro Urethane",
            subtitle: "Experience tour-level spin and control with our most advanced ball yet.",
            imageUrl: "https://picsum.photos/1920/1080?random=1",
            alt: "Close up of a new golf ball",
            hint: "golf ball texture",
            buttons: [
                { href: "/product/ag-3-pro-urethane", text: "Shop AG-3 Pro", variant: "default" }
            ]
        },
        {
            title: "Vibrant Colors, Matte Finish",
            subtitle: "High visibility meets premium feel with the AG-2 Color Matte edition.",
            imageUrl: "https://picsum.photos/1920/1080?random=2",
            alt: "Colorful golf balls in a row",
            hint: "colorful golfball",
            buttons: [
                { href: "/product/ag-2-color-matte", text: "See All Colors", variant: "default" }
            ]
        },
        {
            title: "Your Brand, Your Ball",
            subtitle: "Create the perfect custom golf balls for your company, event, or personal collection.",
            imageUrl: "https://picsum.photos/1920/1080?random=3",
            alt: "A golf ball with a custom logo",
            hint: "golfball logo",
            buttons: [
                { href: "/product/ag-1-standard?custom=true", text: "Start Customizing", variant: "default" }
            ]
        },
        {
            title: "Free Shipping On Orders Over Rp 500.000",
            subtitle: "Stock up on your favorite golf balls and enjoy free delivery to your door.",
            imageUrl: "https://picsum.photos/1920/1080?random=4",
            alt: "Delivery truck on a road",
            hint: "delivery truck",
            buttons: [
                { href: "#products", text: "Start Shopping", variant: "default" }
            ]
        }
    ];


  return (
    <div className="flex flex-col bg-background">
      <section className="relative w-full text-black">
        <Carousel className="w-full" opts={{ loop: true }} plugins={[]}>
            <CarouselContent>
                {slides.map((slide, index) => (
                    <CarouselItem key={index}>
                        <div className="relative h-[70vh] w-full sm:h-[80vh]">
                            <Image
                                src={slide.imageUrl}
                                alt={slide.alt}
                                data-ai-hint={slide.hint}
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
                            <div className="relative z-10 flex h-full flex-col items-center justify-end pb-20 text-center container mx-auto px-4 md:px-6">
                                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl max-w-3xl text-foreground">
                                    {slide.title}
                                </h1>
                                <p className="mt-6 max-w-xl text-lg text-foreground/80">
                                    {slide.subtitle}
                                </p>
                                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                    {slide.buttons.map(button => (
                                        <Button key={button.href} asChild size="lg" variant={button.variant as any} className={button.variant === 'outline' ? 'border-foreground/20 text-foreground bg-background/50 backdrop-blur-sm hover:bg-background' : 'bg-primary text-primary-foreground hover:bg-primary/90'}>
                                            <Link href={button.href}>{button.text}</Link>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
        </Carousel>
      </section>

      <section className="w-full bg-background py-16 md:py-24">
         <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Special Offers & Limited Editions</h2>
              <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Don't miss out on our exclusive releases and promotional prices.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Link href="/product/ag-2-color-matte" className="block group">
                    <Card className="relative overflow-hidden rounded-lg border-0 shadow-none">
                        <div className="aspect-[16/9] w-full bg-muted">
                             <Image
                                src="/images/special-offer-1.jpg"
                                alt="Color Matte Edition Golf Balls"
                                data-ai-hint="colorful golfball"
                                width={800}
                                height={450}
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                            <h3 className="text-2xl font-bold">AG-2 Color Matte Edition</h3>
                            <p className="mt-1 text-white/90">High visibility, premium feel. Now available in vibrant colors.</p>
                            <Button variant="secondary" className="mt-4">Shop Now</Button>
                        </div>
                    </Card>
                </Link>
                 <Link href="/product/ag-1-standard?custom=true" className="block group">
                    <Card className="relative overflow-hidden rounded-lg border-0 shadow-none">
                       <div className="aspect-[16/9] w-full bg-muted">
                            <Image
                                src="/images/special-offer-2.jpg"
                                alt="Custom Logo Golf Balls"
                                data-ai-hint="golfball logo"
                                width={800}
                                height={450}
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                            <h3 className="text-2xl font-bold">Custom Logo Balls</h3>
                            <p className="mt-1 text-white/90">Perfect for your company, event, or personal brand.</p>
                            <Button variant="secondary" className="mt-4">Customize Yours</Button>
                        </div>
                    </Card>
                </Link>
            </div>
         </div>
      </section>

      <section id="products" className="w-full bg-background py-16 md:py-24 border-t">
         <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Curated Collection</h2>
              <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Handpicked for quality and performance. Find the perfect ball for your game.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
               <Link key={product.id} href={`/product/${product.id}`} className="block group">
                <Card className="h-full flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-none transition-shadow duration-300 hover:shadow-lg">
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
                          <p className="text-base font-semibold text-foreground">
                            {product.isFloater ? "Contact Us" : formatRupiah(product.basePrice)}
                          </p>
                          <div className="text-muted-foreground transition-opacity group-hover:opacity-100 md:opacity-0 flex items-center gap-1">
                            Details <ArrowRight className="h-4 w-4" />
                          </div>
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
