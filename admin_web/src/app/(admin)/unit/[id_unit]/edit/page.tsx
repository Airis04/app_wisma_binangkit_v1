import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PencilLine } from "lucide-react";

import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import UnitForm from "../../_components/unit-form";
import {
  KATEGORI_UNIT,
  STATUS_UNIT,
  pisahFasilitas,
  type UnitFormValues,
} from "../../_lib/schema";

type Props = {
  params: Promise<{ id_unit: string }>;
};

export default async function UnitEditPage({ params }: Props) {
  const { id_unit } = await params;

  const unit = await prisma.unit.findUnique({
    where: { id_unit },
    include: { fotos: { orderBy: { urutan: "asc" } } },
  });

  if (!unit) {
    notFound();
  }

  const kategori = KATEGORI_UNIT.includes(
    unit.kategori as (typeof KATEGORI_UNIT)[number]
  )
    ? (unit.kategori as (typeof KATEGORI_UNIT)[number])
    : "Rumah Utama";

  const status = STATUS_UNIT.includes(
    unit.status_unit as (typeof STATUS_UNIT)[number]
  )
    ? (unit.status_unit as (typeof STATUS_UNIT)[number])
    : "Tersedia";

  const { fasilitas, fasilitas_lainnya } = pisahFasilitas(unit.fasilitas);

  const defaultValues: UnitFormValues = {
    id_unit: unit.id_unit,
    nama_unit: unit.nama_unit,
    kategori,
    harga_per_malam: unit.harga_per_malam,
    kapasitas: unit.kapasitas,
    fasilitas: fasilitas as ("WiFi" | "AC" | "TV")[],
    fasilitas_lainnya,
    status_unit: status,
  };

  const existingFotos = unit.fotos.map((f) => ({
    id: f.id_foto,
    url: f.file_path,
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 text-gray-600 hover:text-[#1E3A8A]"
        >
          <Link href="/unit">
            <ArrowLeft size={16} className="mr-1" />
            Kembali ke daftar unit
          </Link>
        </Button>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 px-3 py-1 text-xs font-medium text-[#1E3A8A]">
              <PencilLine size={13} />
              Edit data unit
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Unit {unit.nama_unit}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Perbarui data unit. Foto pertama akan menjadi cover di daftar
              unit dan katalog tamu.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-[#F9FAFB] px-4 py-3 text-sm">
            <p className="text-xs text-gray-500">ID Unit</p>
            <p className="font-semibold text-gray-900">{unit.id_unit}</p>
          </div>
        </div>
      </div>

      <UnitForm
        mode="edit"
        defaultValues={defaultValues}
        existingFotos={existingFotos}
      />
    </div>
  );
}
