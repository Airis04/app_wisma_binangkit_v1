"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Trash2, Loader2, Wallet, ReceiptText, CalendarDays } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/format";
import { deleteOperationalCost } from "../_actions";

export type RiwayatRow = {
  id_biaya: string;
  tanggal_pencatatan: Date;
  kategori_pengeluaran: string;
  deskripsi_pengeluaran: string;
  total_pengeluaran: number;
};

type Props = {
  data: RiwayatRow[];
};

const kategoriStyle: Record<string, string> = {
  Utilitas: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
  Pemeliharaan: "bg-[#1E3A8A]/5 text-[#1E3A8A] border-[#1E3A8A]/20",
  Konsumsi: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
};

export default function TabelRiwayatPengeluaran({ data }: Props) {
  const [confirmRow, setConfirmRow] = useState<RiwayatRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = data.reduce((sum, row) => sum + row.total_pengeluaran, 0);

  function handleDelete() {
    if (!confirmRow) return;
    const target = confirmRow;
    startTransition(async () => {
      const result = await deleteOperationalCost(target.id_biaya);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(`Pengeluaran ${target.id_biaya} dihapus`);
      setConfirmRow(null);
    });
  }

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1E3A8A]/5 text-[#1E3A8A]">
              <ReceiptText size={18} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">
                Riwayat Pengeluaran
              </CardTitle>
              <CardDescription>
                Daftar seluruh pengeluaran operasional yang telah dicatat.
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]"
          >
            Total {formatRupiah(total)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        {data.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-[#F9FAFB] p-12 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-white text-[#1E3A8A] ring-1 ring-gray-200">
              <Wallet size={30} />
            </div>
            <p className="text-sm font-semibold text-gray-900">
              Belum ada pengeluaran
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Catat pengeluaran pertama lewat form di atas.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader className="bg-[#F9FAFB]">
                  <TableRow>
                    <TableHead className="w-36">Tanggal</TableHead>
                    <TableHead className="w-32">ID Biaya</TableHead>
                    <TableHead className="w-36">Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right w-44">
                      Total Pengeluaran
                    </TableHead>
                    <TableHead className="w-20 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.id_biaya}>
                      <TableCell className="text-sm text-gray-700">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays size={14} className="text-gray-400" />
                          {format(row.tanggal_pencatatan, "d MMM yyyy", {
                            locale: idLocale,
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-600">
                        {row.id_biaya}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            kategoriStyle[row.kategori_pengeluaran] ??
                              "bg-gray-100 text-gray-700 border-gray-300"
                          )}
                        >
                          {row.kategori_pengeluaran}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[360px] text-sm text-gray-700">
                        <span className="line-clamp-2">
                          {row.deskripsi_pengeluaran}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-[#EF4444]">
                        {formatRupiah(row.total_pengeluaran)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#EF4444] hover:bg-[#EF4444]/5 hover:text-[#EF4444]"
                          onClick={() => setConfirmRow(row)}
                          aria-label={`Hapus ${row.id_biaya}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="text-sm font-medium text-gray-600">
                Total {data.length} pengeluaran
              </span>
              <span className="text-lg font-bold text-[#EF4444]">
                {formatRupiah(total)}
              </span>
            </div>
          </>
        )}
      </CardContent>

      <Dialog
        open={confirmRow !== null}
        onOpenChange={(open) => !open && setConfirmRow(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengeluaran?</DialogTitle>
            <DialogDescription className="pt-2">
              Pengeluaran <strong>{confirmRow?.id_biaya}</strong>{" "}
              {confirmRow ? `(${confirmRow.deskripsi_pengeluaran})` : ""} akan
              dihapus permanen. Aksi ini tidak bisa dibatalkan dan akan ikut
              memengaruhi perhitungan laba bersih di Dasbor.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmRow(null)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              className="bg-[#EF4444] hover:bg-[#dc2626] text-white"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
