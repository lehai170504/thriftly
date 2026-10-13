import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const swatches = [
  ["Brand", "bg-primary", "text-primary-foreground"],
  ["Success", "bg-success", "text-success-foreground"],
  ["Warning", "bg-warning", "text-warning-foreground"],
  ["Danger", "bg-destructive", "text-destructive-foreground"],
  ["Info", "bg-info", "text-info-foreground"],
  ["Live", "bg-live", "text-live-foreground"],
];

function Foundations() {
  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <section className="space-y-4">
        <p className="font-brand text-4xl font-semibold">Thriftly.</p>
        <h1 className="font-brand text-5xl font-bold">Đồ cũ, câu chuyện mới.</h1>
        <h2 className="font-ui text-3xl font-bold">Khám phá marketplace</h2>
        <p className="max-w-2xl text-base text-muted-foreground">
          Be Vietnam Pro dành cho tiêu đề nghiệp vụ, tên sản phẩm và nội dung giao diện.
        </p>
        <p className="font-numeric text-3xl font-bold">1.250.000 ₫ · 09:42:16</p>
        <code className="font-mono text-sm">ORDER-7F3A91C2</code>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {swatches.map(([label, background, foreground]) => (
          <div key={label} className={`rounded-lg p-6 shadow-surface ${background} ${foreground}`}>
            <p className="text-sm font-semibold">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-surface">Surface</div>
        <div className="rounded-lg border bg-card p-6 shadow-elevated">Elevated</div>
        <div className="rounded-xl border bg-card p-6 shadow-overlay">Overlay</div>
      </section>
    </div>
  );
}

const meta = {
  title: "Foundations/Design tokens",
  component: Foundations,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Foundations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
