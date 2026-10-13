import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MarketplaceProductCard } from "@/features/products/components/MarketplaceProductCard";

const product = {
  id: "demo-product",
  sellerId: "seller-demo",
  sellerName: "Minh Anh",
  title: "Áo khoác denim vintage Nhật Bản form rộng",
  description: "Áo được giữ gìn kỹ, chất vải dày và còn rất mới.",
  categoryName: "Thời trang",
  condition: "LIKE_NEW" as const,
  sellType: "BUY_NOW" as const,
  price: 1250000,
  quantity: 1,
  imageUrl: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80",
};

const meta = {
  title: "Marketplace/Product card",
  component: MarketplaceProductCard,
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
  args: { product },
} satisfies Meta<typeof MarketplaceProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = { args: { variant: "standard" } };
export const Auction: Story = { args: { variant: "auction", product: { ...product, sellType: "AUCTION", auctionEndTime: "2027-12-31T12:00:00Z", currentHighestBid: 1650000, bidCount: 12 } } };
export const Live: Story = { args: { variant: "auction", product: { ...product, sellType: "AUCTION", isLive: true, auctionEndTime: "2027-12-31T12:00:00Z", bidCount: 37 } } };
export const Featured: Story = { args: { variant: "featured", product: { ...product, boostedUntil: "2027-12-31T12:00:00Z" } } };
