"use client";

import { useRef, useState } from "react";
import { CloudUpload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  value: File | null;
  onChange: (file: File | null) => void;
  existingUrl?: string | null;
};

export default function FotoUploader({ value, onChange, existingUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFile(file: File | null) {
    setError(null);

    if (!file) {
      onChange(null);
      setPreviewUrl(null);
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Format harus JPG, PNG, atau WEBP");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Ukuran maksimal ${MAX_SIZE_MB}MB`);
      return;
    }

    onChange(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const displayUrl = previewUrl ?? existingUrl;

  return (
    <div className="space-y-2">
      {displayUrl ? (
        <div className="relative">
          <img
            src={displayUrl}
            alt="Pratinjau foto unit"
            className="w-full h-64 object-cover rounded-md border border-gray-200"
          />
          <button
            type="button"
            onClick={() => handleFile(null)}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 p-1.5 rounded-full shadow-md transition-colors"
            aria-label="Hapus foto"
          >
            <X size={16} />
          </button>
          {value && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-md text-xs text-gray-700">
              <ImageIcon size={14} className="text-[#1E3A8A]" />
              <span className="truncate flex-1">{value.name}</span>
              <span className="text-gray-500 shrink-0">
                {(value.size / 1024).toFixed(0)} KB
              </span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          className={cn(
            "w-full h-64 flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed transition-colors cursor-pointer",
            dragOver
              ? "border-[#1E3A8A] bg-[#1E3A8A]/5"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
          )}
        >
          <CloudUpload size={48} className="text-gray-400" />
          <p className="text-sm font-medium text-gray-700">
            Klik untuk pilih foto, atau seret ke sini
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG, atau WEBP — maksimal {MAX_SIZE_MB}MB
          </p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
