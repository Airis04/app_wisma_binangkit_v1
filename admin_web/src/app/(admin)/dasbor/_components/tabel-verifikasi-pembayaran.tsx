"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";

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
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  function handleConfirm() {
    if (!confirmAction) return;
    const { type, reservasi } = confirmAction;

    if (type === "setujui") {
      toast.success(
        `Reservasi ${reservasi.id_reservasi} disetujui. Unit ${reservasi.nama_unit} dikunci.`
      );
    } else {
      toast.error(
        `Reservasi ${reservasi.id_reservasi} ditolak. Slot tanggal kembali tersedia.`
      );
    }

    setConfirmAction(null);
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">
          Verifikasi Pembayaran
        </CardTitle>
        <p className="text-sm text-gray-500">
          Reservasi yang menunggu konfirmasi pembayaran dari admin
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">
            Tidak ada pembayaran yang perlu diverifikasi saat ini.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">ID Reservasi</TableHead>
                <TableHead>Nama Tamu</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Total Tagihan</TableHead>
                <TableHead className="w-28">Bukti Bayar</TableHead>
                <TableHead className="w-44 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id_reservasi}>
                  <TableCell className="font-mono text-xs text-gray-600">
                    {row.id_reservasi}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {row.nama_tamu}
                  </TableCell>
                  <TableCell className="text-gray-700">{row.nama_unit}</TableCell>
                  <TableCell className="text-gray-700 text-sm">
                    {row.tgl_checkin} — {row.tgl_checkout}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-gray-900">
                    {formatRupiah(row.total_tagihan)}
                  </TableCell>
                  <TableCell>
                    {row.bukti_bayar ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#1E3A8A] hover:bg-[#1E3A8A]/5"
                        onClick={() => window.open(row.bukti_bayar!, "_blank")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
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
                        className="bg-[#1E3A8A] hover:bg-[#162d6e] text-white"
                        onClick={() =>
                          setConfirmAction({ type: "setujui", reservasi: row })
                        }
                      >
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
                        Tolak
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent>
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
                  ditandai <strong>Selesai</strong>. Unit{" "}
                  {confirmAction?.reservasi.nama_unit} akan dikunci pada
                  rentang tanggal yang dipesan dan tidak bisa diubah lagi.
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
            >
              Batal
            </Button>
            {confirmAction?.type === "setujui" ? (
              <Button
                className="bg-[#1E3A8A] hover:bg-[#162d6e] text-white"
                onClick={handleConfirm}
              >
                Ya, Setujui
              </Button>
            ) : (
              <Button
                className="bg-[#EF4444] hover:bg-[#dc2626] text-white"
                onClick={handleConfirm}
              >
                Ya, Tolak
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
