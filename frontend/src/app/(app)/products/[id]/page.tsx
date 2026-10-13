import { Metadata } from 'next';
import ProductDetailsClient from './ProductDetailsClient';

type Props = {
  params: Promise<{ id: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const baseApi = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/+$/, '');
    const endpoint = baseApi.endsWith('/api/v1') ? `${baseApi}/products/${id}` : `${baseApi}/api/v1/products/${id}`;

    const res = await fetch(endpoint, { next: { revalidate: 60 } });

    if (!res.ok) {
      return {
        title: 'Sản phẩm không tồn tại | ThriftSwap',
      };
    }

    const data = await res.json();
    const product = data?.data || data;

    if (!product) {
      return { title: 'Sản phẩm không tồn tại | ThriftSwap' };
    }

    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg';

    return {
      title: `${product.title} - Mua Bán Đồ Si | ThriftSwap`,
      description: product.description || 'Mua bán đồ secondhand uy tín, giá rẻ trên nền tảng đấu giá và thương mại điện tử ThriftSwap.',
      openGraph: {
        title: product.title,
        description: product.description || 'Sản phẩm chất lượng trên ThriftSwap',
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 600,
            alt: product.title,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.title,
        description: product.description,
        images: [imageUrl],
      }
    };
  } catch (error) {
    console.error("Error generating metadata for product", error);
    return {
      title: 'Chi tiết sản phẩm | ThriftSwap',
    };
  }
}

export default function ProductDetailsPage({ params }: Props) {
  return <ProductDetailsClient />;
}
