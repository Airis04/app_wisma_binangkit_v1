"use client";

import { useState } from "react";
import PanelFilterUnit, { type UnitOption } from "./panel-filter-unit";
import KalenderPemesanan, { type ReservasiEvent } from "./kalender-pemesanan";

type Props = {
  units: UnitOption[];
  events: ReservasiEvent[];
};

export default function PemesananView({ units, events }: Props) {
  const [selected, setSelected] = useState<string[]>(units.map((u) => u.id_unit));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      <PanelFilterUnit
        units={units}
        selected={selected}
        onChange={setSelected}
      />
      <KalenderPemesanan events={events} selectedUnitIds={selected} />
    </div>
  );
}
