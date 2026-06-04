"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FASILITAS_DEFAULT } from "../_lib/schema";

type Props = {
  value: readonly string[];
  onChange: (next: string[]) => void;
};

export default function FasilitasCheckboxGrid({ value, onChange }: Props) {
  function toggle(item: string) {
    if (value.includes(item)) {
      onChange(value.filter((v) => v !== item));
    } else {
      onChange([...value, item]);
    }
  }

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {FASILITAS_DEFAULT.map((item) => {
        const id = `fasilitas-${item.toLowerCase()}`;
        const checked = value.includes(item);
        return (
          <label
            key={item}
            htmlFor={id}
            className="flex cursor-pointer select-none items-center gap-2 rounded-lg border border-gray-200 bg-[#F9FAFB] px-3 py-2 transition-colors hover:border-[#1E3A8A]/30 hover:bg-[#1E3A8A]/5"
          >
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={() => toggle(item)}
            />
            <span className="text-sm font-medium text-gray-700">{item}</span>
          </label>
        );
      })}
    </div>
  );
}
