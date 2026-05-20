"use client";

import { useRef, useState } from "react";
import { CloudUpload, X, Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SIZE_MB = 5;
const MAX_FOTOS = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type FotoExisting = {
  id: number;
  url: string;
};

type Props = {
  newFiles: File[];
  onNewFilesChange: (files: File[]) => void;
  existingFotos: FotoExisting[];
  removedExistingIds: number[];
  onRemoveExisting: (id: number) => void;
};

export default function MultiFotoUploader({
  newFiles,
  onNewFilesChange,
  existingFotos,
  removedExistingIds,
  onRemoveExisting,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleExisting = existingFotos.filter(
    (f) => !removedExistingIds.includes(f.id)
  );
  const totalCount = visibleExisting.length + newFiles.length;
  const isCoverNew = visibleExisting.length === 0 && newFiles.length > 0;

  function addFiles(files: FileList | File[]) {
    setError(null);
    const arr = Array.from(files);

    for (const file of arr) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`${file.name}: format harus JPG, PNG, WEBP, atau GIF`);
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`${file.name}: ukuran maksimal ${MAX_SIZE_MB}MB`);
        return;
      }
    }

    const remainingSlot = MAX_FOTOS - totalCount;
    if (arr.length > remainingSlot) {
      setError(`Maksimal ${MAX_FOTOS} foto. Sisa slot: ${remainingSlot}.`);
      return;
    }

    onNewFilesChange([...newFiles, ...arr]);
  }

  function removeNew(idx: number) {
    onNewFilesChange(newFiles.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      {totalCount === 0 ? (
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
            if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "w-full min-h-[280px] flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed transition-colors cursor-pointer",
            dragOver
              ? "border-[#1E3A8A] bg-[#1E3A8A]/5"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
          )}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1E3A8A]">
            <CloudUpload size={28} className="text-white" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            Klik untuk unggah atau seret foto ke sini
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG, WEBP, atau GIF — maks. {MAX_SIZE_MB}MB / foto
          </p>
        </button>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {visibleExisting.map((foto, idx) => (
            <div
              key={`existing-${foto.id}`}
              className="group relative aspect-square rounded-md overflow-hidden border border-gray-200"
            >
              <img
                src={foto.url}
                alt={`Foto ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-[#1E3A8A] text-white text-xs px-2 py-0.5 rounded-full">
                  <Star size={10} fill="currentColor" />
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemoveExisting(foto.id)}
                className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-white text-gray-700 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Hapus foto"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {newFiles.map((file, idx) => {
            const url = URL.createObjectURL(file);
            const isCover = isCoverNew && idx === 0;
            return (
              <div
                key={`new-${idx}-${file.name}`}
                className="group relative aspect-square rounded-md overflow-hidden border border-gray-200"
              >
                <img
                  src={url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                {isCover && (
                  <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-[#1E3A8A] text-white text-xs px-2 py-0.5 rounded-full">
                    <Star size={10} fill="currentColor" />
                    Cover
                  </span>
                )}
                <span className="absolute bottom-1.5 left-1.5 bg-[#10B981] text-white text-[10px] px-1.5 py-0.5 rounded">
                  Baru
                </span>
                <button
                  type="button"
                  onClick={() => removeNew(idx)}
                  className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-white text-gray-700 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Hapus foto"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}

          {totalCount < MAX_FOTOS && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[#1E3A8A] transition-colors"
            >
              <Plus size={24} className="text-gray-400" />
              <span className="text-xs text-gray-600">Tambah foto</span>
              <span className="text-[10px] text-gray-400">
                {totalCount} / {MAX_FOTOS}
              </span>
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            addFiles(e.target.files);
          }
          e.target.value = "";
        }}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-gray-500">
        Foto pertama otomatis menjadi cover yang ditampilkan di daftar unit
        dan katalog tamu.
      </p>
    </div>
  );
}
