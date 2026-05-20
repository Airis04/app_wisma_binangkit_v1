import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import UnitForm from "../_components/unit-form";

export default function UnitBaruPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Tambah Unit Baru</h1>
        <p className="text-sm text-gray-500">
          Isi data unit homestay beserta fotonya. Foto akan dikompresi otomatis
          sebelum disimpan.
        </p>
      </div>

      <UnitForm mode="create" />
    </div>
  );
}
