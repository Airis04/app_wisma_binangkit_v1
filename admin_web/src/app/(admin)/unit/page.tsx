import Link from "next/link";
import { Plus, Building2 } from "lucide-react";

import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import UnitCard from "./_components/unit-card";

export default async function UnitListPage() {
  const units = await prisma.unit.findMany({
    orderBy: { id_unit: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Unit</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data unit homestay (rumah utama dan kamar luar) yang
            ditampilkan di katalog tamu.
          </p>
        </div>
        <Button
          asChild
          className="bg-[#1E3A8A] hover:bg-[#162d6e] text-white shrink-0"
        >
          <Link href="/unit/baru">
            <Plus size={16} className="mr-1" />
            Tambah Unit Baru
          </Link>
        </Button>
      </div>

      {units.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <Building2 size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-700 font-medium">Belum ada unit</p>
          <p className="text-sm text-gray-500 mt-1">
            Tambahkan unit pertama agar tamu bisa melihatnya di katalog.
          </p>
          <Button
            asChild
            className="mt-4 bg-[#1E3A8A] hover:bg-[#162d6e] text-white"
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
