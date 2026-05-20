"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FASILITAS_OPTIONS } from "../_lib/schema";

type Props = {
  value: string[];
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
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {FASILITAS_OPTIONS.map((item) => {
        const id = `fasilitas-${item.replace(/\s+/g, "-").toLowerCase()}`;
        const checked = value.includes(item);
        return (
          <label
            key={item}
            htmlFor={id}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-colors data-[checked=true]:border-[#1E3A8A] data-[checked=true]:bg-[#1E3A8A]/5"
            data-checked={checked}
          >
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={() => toggle(item)}
            />
            <span className="text-sm text-gray-700 select-none">{item}</span>
          </label>
        );
      })}
    </div>
  );
}
