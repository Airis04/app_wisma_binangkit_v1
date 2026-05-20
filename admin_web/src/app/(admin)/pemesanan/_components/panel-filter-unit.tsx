"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900">
              Filter Unit
            </CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={selectAll}
                className="text-[#1E3A8A] hover:underline"
              >
                Semua
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-gray-500 hover:underline"
              >
                Kosongkan
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
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
                  className="flex items-center gap-2 cursor-pointer select-none px-2 py-1.5 -mx-2 rounded-md hover:bg-gray-50"
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={() => toggle(unit.id_unit)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">
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

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">
            Legenda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-6 rounded bg-[#EF4444]"></span>
            <span className="text-gray-700">Terisi (reservasi Selesai)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-6 rounded border border-[#10B981] bg-[#10B981]/10"></span>
            <span className="text-gray-700">Tersedia (slot kosong)</span>
          </div>
          <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            Pita merah merentang melintasi tanggal check-in sampai check-out.
            Arahkan kursor untuk lihat detail tamu.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
