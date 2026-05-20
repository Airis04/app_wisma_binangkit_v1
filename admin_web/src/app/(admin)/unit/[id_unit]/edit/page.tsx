import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import UnitForm from "../../_components/unit-form";
import {
  KATEGORI_UNIT,
  STATUS_UNIT,
  type UnitFormValues,
} from "../../_lib/schema";

type Props = {
  params: Promise<{ id_unit: string }>;
};

export default async function UnitEditPage({ params }: Props) {
  const { id_unit } = await params;

  const unit = await prisma.unit.findUnique({
    where: { id_unit },
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

  const defaultValues: UnitFormValues = {
    id_unit: unit.id_unit,
    nama_unit: unit.nama_unit,
    kategori,
    harga_per_malam: unit.harga_per_malam,
    kapasitas: unit.kapasitas,
    fasilitas: unit.fasilitas
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean),
    status_unit: status,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
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
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Unit {unit.nama_unit}
        </h1>
        <p className="text-sm text-gray-500">
          Perbarui data unit. Ganti foto hanya jika Anda ingin mengganti foto
          existing.
        </p>
      </div>

      <UnitForm
        mode="edit"
        defaultValues={defaultValues}
        existingFotoUrl={unit.foto_unit}
      />
    </div>
  );
}
