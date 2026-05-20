"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Trash2, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Pemeliharaan: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
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
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">
          Riwayat Pengeluaran
        </CardTitle>
        <p className="text-sm text-gray-500">
          Daftar seluruh pengeluaran operasional yang telah dicatat.
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <Wallet size={40} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-700 font-medium">
              Belum ada pengeluaran
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Catat pengeluaran pertama lewat form di atas.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Tanggal</TableHead>
                  <TableHead className="w-32">ID Biaya</TableHead>
                  <TableHead className="w-32">Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="text-right w-40">
                    Total Pengeluaran
                  </TableHead>
                  <TableHead className="w-20 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id_biaya}>
                    <TableCell className="text-sm text-gray-700">
                      {format(row.tanggal_pencatatan, "d MMM yyyy", {
                        locale: idLocale,
                      })}
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
                    <TableCell className="text-sm text-gray-700">
                      {row.deskripsi_pengeluaran}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      {formatRupiah(row.total_pengeluaran)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#EF4444] hover:bg-[#EF4444]/5 hover:text-[#EF4444]"
                        onClick={() => setConfirmRow(row)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
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
