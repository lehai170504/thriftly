"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, Package, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { CommandPalette } from "./CommandPalette"
import { useDebounce } from "@/hooks/useDebounce"
import { useSearchProducts } from "@/features/products/hooks/useProducts"
import { formatCurrency } from "@/lib/utils"

interface GlobalSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState("")
  const debouncedQuery = useDebounce(searchQuery, 300)
  const { data: searchResults, isLoading: isSearching } = useSearchProducts({ query: debouncedQuery })

  const inputRef = React.useRef<HTMLInputElement>(null)

  // Reset search query when modal opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [open])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onOpenChange(false)
      if (searchQuery.trim()) {
        router.push(`/products?query=${encodeURIComponent(searchQuery.trim())}`)
      } else {
        router.push(`/products`)
      }
    }
  }

  const handleSelectProduct = (productId: string) => {
    onOpenChange(false)
    router.push(`/products/${productId}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="p-0 overflow-hidden sm:max-w-2xl gap-0 border-border bg-background/95 backdrop-blur-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Tìm kiếm</DialogTitle>
        </DialogHeader>
        <div className="flex items-center border-b border-border px-4 py-2 relative">
          <Search className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Tìm kiếm sản phẩm, thương hiệu, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-base outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground"
          />
          <kbd className="pointer-events-none hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
            <span className="text-xs">ESC</span>
          </kbd>
        </div>

        <div className="max-h-[60vh] sm:max-h-[500px] overflow-y-auto">
          {searchQuery.trim() === "" ? (
            <CommandPalette onSelect={() => onOpenChange(false)} />
          ) : isSearching ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              Đang tìm kiếm...
            </div>
          ) : searchResults?.content && searchResults.content.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Kết quả tìm kiếm
              </div>
              {searchResults.content.slice(0, 6).map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                  onClick={() => handleSelectProduct(product.id)}
                >
                  <div className="w-14 h-14 bg-muted rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-border/50">
                    <img
                      src={product.imageUrl || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100&h=100&seed=${product.id}`}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-semibold text-sm text-foreground line-clamp-1">{product.title}</h4>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
                      <span className="text-muted-foreground opacity-50">•</span>
                      <span className="text-muted-foreground line-clamp-1 text-xs font-medium">{product.categoryName}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-50 shrink-0" />
                </div>
              ))}
              <div
                className="mx-4 mt-2 mb-2 p-3 text-center text-sm text-primary font-medium bg-primary/10 hover:bg-primary/20 rounded-xl cursor-pointer transition-colors"
                onClick={() => {
                  onOpenChange(false)
                  router.push(`/products?query=${encodeURIComponent(searchQuery.trim())}`)
                }}
              >
                Xem tất cả kết quả cho "{searchQuery}"
              </div>
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <p className="text-foreground font-semibold mb-1">Không tìm thấy sản phẩm nào</p>
              <p className="text-sm text-muted-foreground">Thử tìm kiếm với từ khóa khác hoặc ngắn hơn</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
