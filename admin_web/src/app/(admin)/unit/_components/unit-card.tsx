"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Users,
  Pencil,
  Trash2,
  ImageOff,
  Loader2,
  Home,
  Tag,
} from "lucide-react";
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
    <Card className="overflow-hidden border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-stretch">
        <div className="relative flex h-48 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F9FAFB] lg:h-auto lg:w-56">
          {unit.foto_unit ? (
            <img
              src={unit.foto_unit}
              alt={unit.nama_unit}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageOff size={34} className="text-gray-400" />
          )}
          <div className="absolute left-3 top-3">
            <Badge
              variant="outline"
              className={cn(
                "border-white/70 bg-white/90 shadow-sm backdrop-blur",
                statusStyle[unit.status_unit]
              )}
            >
              {unit.status_unit}
            </Badge>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#1E3A8A]/10 bg-[#1E3A8A]/5 px-3 py-1 text-xs font-medium text-[#1E3A8A]">
                <Home size={13} />
                {unit.id_unit}
              </div>
              <h3 className="truncate text-xl font-semibold text-gray-900">
                {unit.nama_unit}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                <Tag size={14} className="text-gray-400" />
                {unit.kategori}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-[#F9FAFB] px-4 py-3 text-left md:text-right">
              <p className="text-xs text-gray-500">Harga per malam</p>
              <p className="text-lg font-bold text-[#1E3A8A]">
                {formatRupiah(unit.harga_per_malam)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700">
              <Users size={16} className="text-[#1E3A8A]" />
              <span>{unit.kapasitas} orang</span>
            </div>
          </div>

          {fasilitasList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {fasilitasList.slice(0, 5).map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-gray-200 bg-[#F9FAFB] px-2.5 py-1 text-xs text-gray-700"
                >
                  {f}
                </span>
              ))}
              {fasilitasList.length > 5 && (
                <span className="rounded-full border border-gray-200 bg-[#F9FAFB] px-2.5 py-1 text-xs text-gray-500">
                  +{fasilitasList.length - 5}
                </span>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:text-[#1E3A8A]"
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
