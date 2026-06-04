import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format";

type Variant = "pemasukan" | "pengeluaran" | "laba";
type ValueType = "currency" | "number";

const variantStyles: Record<
  Variant | "pending",
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
  pending: {
    accent: "bg-[#1E3A8A]",
    iconBg: "bg-[#1E3A8A]/10",
    iconText: "text-[#1E3A8A]",
  },
};

type Props = {
  label: string;
  value: number;
  description?: string;
  icon: LucideIcon;
  variant: Variant | "pending";
  valueType?: ValueType;
};

export default function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  variant,
  valueType = "currency",
}: Props) {
  const styles = variantStyles[variant];
  const formattedValue =
    valueType === "currency" ? formatRupiah(value) : value.toLocaleString("id-ID");

  return (
    <Card className="relative overflow-hidden border-gray-200 shadow-sm">
      <div className={cn("absolute left-0 top-0 h-full w-1.5", styles.accent)} />
      <CardContent className="flex items-center gap-4 p-6 pl-7">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-md",
            styles.iconBg
          )}
        >
          <Icon className={cn("h-6 w-6", styles.iconText)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="truncate text-2xl font-bold text-gray-900">{formattedValue}</p>
          {description && (
            <p className="mt-0.5 text-xs text-gray-400">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
