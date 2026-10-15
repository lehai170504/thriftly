'use client';

import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Gavel, PlayCircle, Image as ImageIcon } from 'lucide-react';
import { Product } from '@/features/products/types/product';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const magnifierRef = useRef<HTMLDivElement>(null);

  const fallbackImage = `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800&h=800&seed=${product.id}`;
  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.imageUrl || fallbackImage];

  const [activeIndex, setActiveIndex] = useState(0);
  const [showingVideo, setShowingVideo] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showingVideo || !magnifierRef.current) return;
    const elem = e.currentTarget;
    const { left, top, width, height } = elem.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;
    const x = (mouseX / width) * 100;
    const y = (mouseY / height) * 100;

    magnifierRef.current.style.transform = `translate3d(${mouseX - 100}px, ${mouseY - 100}px, 0)`;
    magnifierRef.current.style.backgroundPosition = `${x}% ${y}%`;
  };

  const currentImageUrl = images[activeIndex];

  return (
    <div className="lg:col-span-5 flex flex-col gap-4">
      <div
        className={cn(
          "relative aspect-square rounded-xl overflow-hidden bg-muted border border-border group isolate [transform:translateZ(0)]",
          !showingVideo && "cursor-crosshair"
        )}
        onMouseEnter={() => !showingVideo && setShowMagnifier(true)}
        onMouseLeave={() => setShowMagnifier(false)}
        onMouseMove={handleMouseMove}
      >
        {showingVideo && product.videoUrl ? (
          <video
            src={product.videoUrl}
            controls
            autoPlay
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <>
            <img
              src={currentImageUrl}
              alt={product.title}
              className="w-full h-full object-cover transform-gpu [backface-visibility:hidden]"
            />

            <div
              ref={magnifierRef}
              className={cn(
                "absolute top-0 left-0 w-[200px] h-[200px] rounded-full pointer-events-none border-2 border-primary/60 z-50 bg-white dark:bg-black/60 shadow-xl will-change-transform transition-opacity duration-150",
                showMagnifier ? "opacity-100" : "opacity-0"
              )}
              style={{
                backgroundImage: `url(${currentImageUrl})`,
                backgroundSize: '250%',
                backgroundRepeat: 'no-repeat',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.3)'
              }}
            />
          </>
        )}

        {product.sellType === 'AUCTION' && (
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground shadow-sm px-3 py-1 text-xs rounded-md z-10">
            <Gavel className="w-4 h-4 mr-1.5" /> Đấu giá
          </Badge>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => {
              setShowingVideo(false);
              setActiveIndex(idx);
            }}
            className={cn(
              "relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
              !showingVideo && activeIndex === idx ? "border-primary" : "border-transparent hover:border-primary/50 opacity-70 hover:opacity-100"
            )}
          >
            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}

        {product.videoUrl && (
          <button
            onClick={() => setShowingVideo(true)}
            className={cn(
              "relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all flex flex-col items-center justify-center bg-black/5 dark:bg-white/5",
              showingVideo ? "border-primary" : "border-transparent hover:border-primary/50 opacity-70 hover:opacity-100"
            )}
          >
            <PlayCircle className={cn("w-8 h-8", showingVideo ? "text-primary" : "text-muted-foreground")} />
            <span className="text-xs font-medium mt-1 text-muted-foreground">Video</span>
          </button>
        )}
      </div>
    </div>
  );
}
