"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  Home,
  Loader2,
  ReceiptText,
  UserRound,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/format";
import { setujuiReservasi, tolakReservasi } from "../_actions";

export type ReservasiPending = {
  id_reservasi: string;
  nama_tamu: string;
  nama_unit: string;
  tgl_checkin: string;
  tgl_checkout: string;
  total_tagihan: number;
  bukti_bayar: string | null;
};

type ConfirmAction = {
  type: "setujui" | "tolak";
  reservasi: ReservasiPending;
};

type Props = {
  data: ReservasiPending[];
};

export default function TabelVerifikasiPembayaran({ data }: Props) {
  const router = useRouter();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!confirmAction) return;
    const { type, reservasi } = confirmAction;

    startTransition(async () => {
      const result =
        type === "setujui"
          ? await setujuiReservasi(reservasi.id_reservasi)
          : await tolakReservasi(reservasi.id_reservasi);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      if (type === "setujui") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      setConfirmAction(null);
      router.refresh();
    });
  }

  return (
    <Card className="overflow-hidden border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200 bg-white">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">
              Verifikasi Pembayaran
            </CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              Cek bukti transfer tamu, lalu setujui atau tolak pembayaran.
            </p>
          </div>
          <Badge className="w-fit rounded-md bg-[#1E3A8A]/10 px-3 py-1.5 text-[#1E3A8A] hover:bg-[#1E3A8A]/10">
            {data.length} menunggu verifikasi
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#10B981]/10">
              <CheckCircle2 className="h-6 w-6 text-[#10B981]" />
            </div>
            <p className="mt-4 font-semibold text-gray-900">
              Tidak ada pembayaran yang perlu diverifikasi.
            </p>
            <p className="mt-1 max-w-md text-sm text-gray-500">
              Pesanan baru dari mobile akan muncul otomatis di tabel ini setelah
              tamu mengunggah bukti pembayaran.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                  <TableHead className="w-36">Reservasi</TableHead>
                  <TableHead>Nama Tamu</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Total Tagihan</TableHead>
                  <TableHead className="w-32">Bukti Bayar</TableHead>
                  <TableHead className="w-52 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id_reservasi} className="align-top">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ReceiptText className="h-4 w-4 text-[#1E3A8A]" />
                        <span className="font-mono text-xs font-semibold text-gray-700">
                          {row.id_reservasi}
                        </span>
                      </div>
                      <Badge className="mt-2 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/10">
                        Menunggu
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        <UserRound className="h-4 w-4 text-gray-400" />
                        {row.nama_tamu}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Home className="h-4 w-4 text-gray-400" />
                        {row.nama_unit}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <CalendarDays className="mt-0.5 h-4 w-4 text-gray-400" />
                        <span>
                          {row.tgl_checkin}
                          <span className="mx-1 text-gray-400">sampai</span>
                          {row.tgl_checkout}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-gray-900">
                      {formatRupiah(row.total_tagihan)}
                    </TableCell>
                    <TableCell>
                      {row.bukti_bayar ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#1E3A8A]/25 text-[#1E3A8A] hover:bg-[#1E3A8A]/5 hover:text-[#1E3A8A]"
                          onClick={() => window.open(row.bukti_bayar!, "_blank")}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Lihat
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">Belum ada</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          className="bg-[#1E3A8A] text-white hover:bg-[#162d6e]"
                          onClick={() =>
                            setConfirmAction({ type: "setujui", reservasi: row })
                          }
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/5 hover:text-[#EF4444]"
                          onClick={() =>
                            setConfirmAction({ type: "tolak", reservasi: row })
                          }
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Tolak
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && !isPending && setConfirmAction(null)}
      >
        <DialogContent className="rounded-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "setujui"
                ? "Setujui Pembayaran?"
                : "Tolak Pembayaran?"}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {confirmAction?.type === "setujui" ? (
                <>
                  Reservasi <strong>{confirmAction?.reservasi.id_reservasi}</strong>{" "}
                  atas nama{" "}
                  <strong>{confirmAction?.reservasi.nama_tamu}</strong> akan
                  ditandai <strong>Selesai</strong>. Slot tanggal di unit{" "}
                  {confirmAction?.reservasi.nama_unit} akan terkunci dan tidak
                  bisa dipesan lagi.
                </>
              ) : (
                <>
                  Reservasi <strong>{confirmAction?.reservasi.id_reservasi}</strong>{" "}
                  akan dibatalkan dan slot tanggalnya kembali tersedia untuk
                  tamu lain.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              disabled={isPending}
            >
              Batal
            </Button>
            {confirmAction?.type === "setujui" ? (
              <Button
                className="bg-[#1E3A8A] hover:bg-[#162d6e] text-white"
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ya, Setujui
              </Button>
            ) : (
              <Button
                className="bg-[#EF4444] hover:bg-[#dc2626] text-white"
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ya, Tolak
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
