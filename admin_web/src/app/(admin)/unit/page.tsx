import Link from "next/link";
import { Plus, Building2, CheckCircle2, Wrench, BedDouble } from "lucide-react";

import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import UnitCard from "./_components/unit-card";

export default async function UnitListPage() {
  const units = await prisma.unit.findMany({
    orderBy: { id_unit: "asc" },
  });

  const totalUnit = units.length;
  const totalTersedia = units.filter(
    (unit) => unit.status_unit === "Tersedia"
  ).length;
  const totalTerisi = units.filter((unit) => unit.status_unit === "Terisi").length;
  const totalPerawatan = units.filter(
    (unit) => unit.status_unit === "Perawatan"
  ).length;

  const summaryItems = [
    {
      label: "Total Unit",
      value: totalUnit,
      icon: Building2,
      className: "border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[#1E3A8A]",
    },
    {
      label: "Tersedia",
      value: totalTersedia,
      icon: CheckCircle2,
      className: "border-[#10B981]/20 bg-[#10B981]/10 text-[#10B981]",
    },
    {
      label: "Terisi",
      value: totalTerisi,
      icon: BedDouble,
      className: "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]",
    },
    {
      label: "Perawatan",
      value: totalPerawatan,
      icon: Wrench,
      className: "border-gray-200 bg-gray-50 text-gray-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1E3A8A]">
              Katalog Homestay
            </p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              Manajemen Unit
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Kelola foto, harga, kapasitas, fasilitas, dan status unit yang
              akan dilihat tamu di aplikasi mobile.
            </p>
          </div>
          <Button
            asChild
            className="bg-[#1E3A8A] text-white hover:bg-[#162d6e] lg:shrink-0"
          >
            <Link href="/unit/baru">
              <Plus size={16} className="mr-1" />
              Tambah Unit Baru
            </Link>
          </Button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-lg border border-gray-200 bg-[#F9FAFB] p-4"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg border ${item.className}`}
                >
                  <Icon size={18} />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {item.value}
                </p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {units.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1E3A8A]/5 text-[#1E3A8A]">
            <Building2 size={34} />
          </div>
          <p className="text-lg font-semibold text-gray-900">Belum ada unit</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            Tambahkan unit pertama agar tamu bisa melihatnya di katalog.
          </p>
          <Button
            asChild
            className="mt-5 bg-[#1E3A8A] text-white hover:bg-[#162d6e]"
          >
            <Link href="/unit/baru">
              <Plus size={16} className="mr-1" />
              Tambah Unit Baru
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {units.map((unit) => (
            <UnitCard key={unit.id_unit} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
}
