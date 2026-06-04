"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah, formatRupiahCompact } from "@/lib/format";

export type TrenLabaPoint = {
  bulan: string;
  laba: number;
};

type Props = {
  data: TrenLabaPoint[];
};

export default function TrenLabaChart({ data }: Props) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg font-bold text-gray-900">
            Tren Laba Bersih
          </CardTitle>
          <p className="text-sm text-gray-500">
            Perkembangan laba bersih 12 bulan terakhir.
          </p>
        </div>
      </CardHeader>
      <CardContent className="h-[280px] pl-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="grad-laba" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              vertical={false}
            />
            <XAxis
              dataKey="bulan"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatRupiahCompact}
              width={70}
            />
            <Tooltip
              cursor={{
                stroke: "#3B82F6",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: 13,
              }}
              formatter={(value) => [
                formatRupiah(Number(value)),
                "Laba Bersih",
              ]}
              labelStyle={{ color: "#374151", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="laba"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#grad-laba)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
