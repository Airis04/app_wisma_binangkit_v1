import Link from "next/link";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import UnitForm from "../_components/unit-form";

export default function UnitBaruPage() {
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
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#10B981]/20 bg-[#10B981]/10 px-3 py-1 text-xs font-medium text-[#10B981]">
              <Sparkles size={13} />
              Unit baru
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tambah Unit Baru
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Isi data unit homestay beserta fotonya. Foto akan dikompresi
              otomatis sebelum disimpan.
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1E3A8A] text-white">
            <Plus size={22} />
          </div>
        </div>
      </div>

      <UnitForm mode="create" />
    </div>
  );
}
