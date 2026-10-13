import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MoreHorizontal, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

function PrimitiveGallery() {
  return (
    <div className="mx-auto grid max-w-5xl gap-10">
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Button</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary action</Button>
          <Button variant="outline">Outline action</Button>
          <Button variant="ghost">Ghost action</Button>
          <Button variant="destructive">Delete item</Button>
          <Button variant="link">Text link</Button>
          <Button shape="pill">Pill exception</Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
          <Button size="icon" variant="outline" aria-label="Settings"><Settings /></Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badge</h2>
        <div className="flex flex-wrap gap-2">
          {(["neutral", "brand", "info", "success", "warning", "danger", "live"] as const).map((tone) => (
            <Badge key={tone} tone={tone}>{tone}</Badge>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Static card</CardTitle><CardDescription>Không thay đổi elevation khi hover.</CardDescription></CardHeader>
          <CardContent>Nội dung thông tin.</CardContent>
        </Card>
        <Card variant="interactive" tabIndex={0}>
          <CardHeader><CardTitle>Interactive card</CardTitle><CardDescription>Có affordance khi hover và focus.</CardDescription></CardHeader>
          <CardContent>Nội dung có thể tương tác.</CardContent>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="story-name">Tên sản phẩm</Label><Input id="story-name" placeholder="Ví dụ: Áo khoác denim" /></div>
        <div className="space-y-2"><Label htmlFor="story-invalid">Trường không hợp lệ</Label><Input id="story-invalid" aria-invalid="true" aria-describedby="story-error" defaultValue="Sai dữ liệu" /><p id="story-error" className="text-xs text-destructive">Hãy kiểm tra lại dữ liệu.</p></div>
        <div className="space-y-2"><Label>Danh mục</Label><Select defaultValue="fashion"><SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger><SelectContent><SelectItem value="fashion">Thời trang</SelectItem><SelectItem value="electronics">Đồ điện tử</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="story-description">Mô tả</Label><Textarea id="story-description" placeholder="Mô tả tình trạng sản phẩm" /></div>
      </section>

      <section className="space-y-4">
        <Tabs defaultValue="overview">
          <TabsList><TabsTrigger value="overview">Tổng quan</TabsTrigger><TabsTrigger value="history">Lịch sử</TabsTrigger></TabsList>
          <TabsContent value="overview" className="pt-4">Nội dung tổng quan.</TabsContent>
          <TabsContent value="history" className="pt-4">Nội dung lịch sử.</TabsContent>
        </Tabs>
      </section>

      <section className="flex flex-wrap gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}><MoreHorizontal />Menu</DropdownMenuTrigger>
          <DropdownMenuContent><DropdownMenuItem>Chỉnh sửa</DropdownMenuItem><DropdownMenuItem variant="destructive">Xóa</DropdownMenuItem></DropdownMenuContent>
        </DropdownMenu>
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Xác nhận thao tác</DialogTitle>
            <DialogDescription>Dialog dùng radius và shadow overlay chuẩn.</DialogDescription>
          </DialogContent>
        </Dialog>
        <Sheet>
          <SheetContent>
            <SheetTitle>Bộ lọc</SheetTitle>
            <SheetDescription>Sheet chia sẻ elevation và motion contract.</SheetDescription>
          </SheetContent>
        </Sheet>
      </section>
    </div>
  );
}

const meta = {
  title: "Foundations/Primitives",
  component: PrimitiveGallery,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PrimitiveGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllStates: Story = {};
