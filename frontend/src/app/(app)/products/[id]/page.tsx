import { Metadata } from 'next';
import ProductDetailsClient from './ProductDetailsClient';

type Props = {
  params: Promise<{ id: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    // We fetch data directly from our Spring Boot backend
    // Since this runs on the server, we use the internal Docker URL if available, or just the public API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

    const res = await fetch(`${apiUrl}/api/v1/products/${id}`, { next: { revalidate: 60 } }); // Cache for 60 seconds

    if (!res.ok) {
      return {
        title: 'Sản phẩm không tồn tại | ThriftSwap',
      };
    }

    const data = await res.json();
    const product = data.data; // our generic ApiResponse wraps data in 'data'

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
