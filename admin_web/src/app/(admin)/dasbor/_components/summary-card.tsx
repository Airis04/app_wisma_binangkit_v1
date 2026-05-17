import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format";

type Variant = "pemasukan" | "pengeluaran" | "laba";

const variantStyles: Record<
  Variant,
  { accent: string; iconBg: string; iconText: string }
> = {
  pemasukan: {
    accent: "bg-[#10B981]",
    iconBg: "bg-[#10B981]/10",
    iconText: "text-[#10B981]",
  },
  pengeluaran: {
    accent: "bg-[#EF4444]",
    iconBg: "bg-[#EF4444]/10",
    iconText: "text-[#EF4444]",
  },
  laba: {
    accent: "bg-[#3B82F6]",
    iconBg: "bg-[#3B82F6]/10",
    iconText: "text-[#3B82F6]",
  },
};

type Props = {
  label: string;
  value: number;
  description?: string;
  icon: LucideIcon;
  variant: Variant;
};

export default function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  variant,
}: Props) {
  const styles = variantStyles[variant];

  return (
    <Card className="relative overflow-hidden border-gray-200">
      <div className={cn("absolute left-0 top-0 h-full w-1.5", styles.accent)} />
      <CardContent className="flex items-center gap-4 p-6 pl-7">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg",
            styles.iconBg
          )}
        >
          <Icon className={cn("h-6 w-6", styles.iconText)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 truncate">
            {formatRupiah(value)}
          </p>
          {description && (
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
