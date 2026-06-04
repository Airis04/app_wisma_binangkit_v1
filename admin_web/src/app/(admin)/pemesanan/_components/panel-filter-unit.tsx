"use client";

import { Building2, CheckCircle2, ListFilter } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export type UnitOption = {
  id_unit: string;
  nama_unit: string;
  kategori: string;
};

type Props = {
  units: UnitOption[];
  selected: string[];
  onChange: (next: string[]) => void;
};

export default function PanelFilterUnit({ units, selected, onChange }: Props) {
  function toggle(idUnit: string) {
    if (selected.includes(idUnit)) {
      onChange(selected.filter((id) => id !== idUnit));
    } else {
      onChange([...selected, idUnit]);
    }
  }

  function selectAll() {
    onChange(units.map((u) => u.id_unit));
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div className="space-y-4">
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1E3A8A]/5 text-[#1E3A8A]">
              <ListFilter size={18} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold text-gray-900">
                Filter Unit
              </CardTitle>
              <CardDescription>
                {selected.length} dari {units.length} unit ditampilkan
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-1">
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={selectAll}
              className="rounded-full border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 px-3 py-1 font-medium text-[#1E3A8A] hover:bg-[#1E3A8A]/10"
            >
              Pilih Semua
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full border border-gray-200 px-3 py-1 font-medium text-gray-600 hover:bg-[#F9FAFB]"
            >
              Kosongkan
            </button>
          </div>

          {units.length === 0 ? (
            <p className="text-sm text-gray-500">
              Belum ada unit. Tambahkan dulu di menu Unit.
            </p>
          ) : (
            units.map((unit) => {
              const id = `filter-${unit.id_unit}`;
              const checked = selected.includes(unit.id_unit);
              return (
                <label
                  key={unit.id_unit}
                  htmlFor={id}
                  className="flex cursor-pointer select-none items-center gap-3 rounded-lg border border-gray-200 bg-[#F9FAFB] px-3 py-2.5 transition-colors hover:border-[#1E3A8A]/30 hover:bg-[#1E3A8A]/5"
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={() => toggle(unit.id_unit)}
                  />
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#1E3A8A] ring-1 ring-gray-200">
                    <Building2 size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {unit.nama_unit}
                    </p>
                    <p className="text-xs text-gray-500">{unit.kategori}</p>
                  </div>
                </label>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#10B981]/10 text-[#10B981]">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">
                Legenda
              </CardTitle>
              <CardDescription>Arti warna pada kalender</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-1 text-sm">
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-[#F9FAFB] px-3 py-2">
            <span className="inline-block h-3 w-8 rounded-full bg-[#EF4444]"></span>
            <span className="text-gray-700">Terisi (reservasi Selesai)</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-[#F9FAFB] px-3 py-2">
            <span className="inline-block h-3 w-8 rounded-full border border-[#10B981] bg-[#10B981]/10"></span>
            <span className="text-gray-700">Tersedia (slot kosong)</span>
          </div>
          <p className="rounded-lg bg-[#1E3A8A]/5 p-3 text-xs leading-relaxed text-gray-600">
            Pita merah merentang dari tanggal check-in sampai sebelum
            check-out. Klik pita untuk melihat detail tamu.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
