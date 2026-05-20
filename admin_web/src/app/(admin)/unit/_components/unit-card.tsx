"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Users, Pencil, Trash2, ImageOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { deleteUnit } from "../_actions";

type Props = {
  unit: {
    id_unit: string;
    nama_unit: string;
    kategori: string;
    harga_per_malam: number;
    kapasitas: number;
    fasilitas: string;
    foto_unit: string | null;
    status_unit: string;
  };
};

const statusStyle: Record<string, string> = {
  Tersedia: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  Terisi: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
  Perawatan: "bg-gray-200 text-gray-700 border-gray-300",
};

export default function UnitCard({ unit }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUnit(unit.id_unit);
      if (!result.ok) {
        toast.error(result.message);
        setConfirmOpen(false);
        return;
      }
      toast.success(`Unit ${unit.nama_unit} berhasil dihapus`);
      setConfirmOpen(false);
    });
  }

  const fasilitasList = unit.fasilitas
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  return (
    <Card className="border-gray-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <div className="w-full sm:w-48 h-32 shrink-0 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
          {unit.foto_unit ? (
            <img
              src={unit.foto_unit}
              alt={unit.nama_unit}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageOff size={32} className="text-gray-400" />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-mono text-gray-500">{unit.id_unit}</p>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {unit.nama_unit}
              </h3>
              <p className="text-sm text-gray-600">{unit.kategori}</p>
            </div>
            <Badge
              variant="outline"
              className={cn("shrink-0", statusStyle[unit.status_unit])}
            >
              {unit.status_unit}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
            <div className="flex items-center gap-1.5 text-gray-700">
              <Users size={16} className="text-gray-400" />
              <span>{unit.kapasitas} orang</span>
            </div>
            <div className="font-semibold text-[#1E3A8A]">
              {formatRupiah(unit.harga_per_malam)}{" "}
              <span className="text-xs font-normal text-gray-500">
                / malam
              </span>
            </div>
          </div>

          {fasilitasList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {fasilitasList.slice(0, 5).map((f) => (
                <span
                  key={f}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
                >
                  {f}
                </span>
              ))}
              {fasilitasList.length > 5 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  +{fasilitasList.length - 5}
                </span>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-gray-300"
            >
              <Link href={`/unit/${unit.id_unit}/edit`}>
                <Pencil size={14} className="mr-1" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/5 hover:text-[#EF4444]"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 size={14} className="mr-1" />
              Hapus
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Unit?</DialogTitle>
            <DialogDescription className="pt-2">
              Unit <strong>{unit.nama_unit}</strong> ({unit.id_unit}) akan
              dihapus permanen beserta fotonya. Aksi ini tidak bisa
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
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
