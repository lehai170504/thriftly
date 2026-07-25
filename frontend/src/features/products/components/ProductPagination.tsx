import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductPaginationProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

export function ProductPagination({ page, setPage, totalPages }: ProductPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setPage(p => Math.max(0, p - 1))}
        disabled={page === 0}
        className="rounded-full w-10 h-10 border-border text-foreground"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-1 mx-2">
        {Array.from({ length: totalPages }).map((_, i) => {
          if (i === 0 || i === totalPages - 1 || Math.abs(page - i) <= 1) {
            return (
              <Button
                key={i}
                variant={page === i ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPage(i)}
                className={`w-10 h-10 rounded-full font-bold ${page === i ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
              >
                {i + 1}
              </Button>
            );
          }
          if (Math.abs(page - i) === 2) {
            return <span key={i} className="text-muted-foreground">...</span>;
          }
          return null;
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
        disabled={page === totalPages - 1}
        className="rounded-full w-10 h-10 border-border text-foreground"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
