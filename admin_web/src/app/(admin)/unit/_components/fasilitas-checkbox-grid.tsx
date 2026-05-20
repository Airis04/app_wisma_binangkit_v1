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
    <div className="flex flex-wrap gap-x-6 gap-y-3">
      {FASILITAS_DEFAULT.map((item) => {
        const id = `fasilitas-${item.toLowerCase()}`;
        const checked = value.includes(item);
        return (
          <label
            key={item}
            htmlFor={id}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={() => toggle(item)}
            />
            <span className="text-sm text-gray-700">{item}</span>
          </label>
        );
      })}
    </div>
  );
}
