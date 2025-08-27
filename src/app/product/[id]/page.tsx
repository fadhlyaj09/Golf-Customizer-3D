import { getProductById } from '@/lib/products';
import { notFound } from 'next/navigation';
import ProductCustomizer from '@/components/ProductCustomizer';

type ProductPageProps = {
  params: {
    id: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ProductCustomizer product={product} />
    </div>
  );
}
