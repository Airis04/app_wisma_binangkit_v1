"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  unitFormSchema,
  type UnitFormValues,
  KATEGORI_UNIT,
  STATUS_UNIT,
} from "../_lib/schema";
import { createUnit, updateUnit } from "../_actions";
import FasilitasCheckboxGrid from "./fasilitas-checkbox-grid";
import MultiFotoUploader, { type FotoExisting } from "./multi-foto-uploader";

type Props = {
  mode: "create" | "edit";
  defaultValues?: UnitFormValues;
  existingFotos?: FotoExisting[];
};

export default function UnitForm({
  mode,
  defaultValues,
  existingFotos = [],
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedExistingIds, setRemovedExistingIds] = useState<number[]>([]);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: defaultValues ?? {
      id_unit: "",
      nama_unit: "",
      kapasitas: 1,
      fasilitas: [],
      fasilitas_lainnya: "",
      kategori: "Rumah Utama",
      status_unit: "Tersedia",
      harga_per_malam: 0,
    },
  });

  function onSubmit(values: UnitFormValues) {
    if (mode === "create" && newFiles.length === 0) {
      toast.error("Tambahkan minimal 1 foto unit");
      return;
    }

    const remainingExisting = existingFotos.filter(
      (f) => !removedExistingIds.includes(f.id)
    );
    if (
      mode === "edit" &&
      remainingExisting.length === 0 &&
      newFiles.length === 0
    ) {
      toast.error("Unit harus punya minimal 1 foto");
      return;
    }

    const formData = new FormData();
    formData.set("id_unit", values.id_unit);
    formData.set("nama_unit", values.nama_unit);
    formData.set("kategori", values.kategori);
    formData.set("harga_per_malam", String(values.harga_per_malam));
    formData.set("kapasitas", String(values.kapasitas));
    formData.set("status_unit", values.status_unit);
    values.fasilitas.forEach((f) => formData.append("fasilitas", f));
    formData.set("fasilitas_lainnya", values.fasilitas_lainnya);
    newFiles.forEach((file) => formData.append("foto_baru", file));
    removedExistingIds.forEach((id) =>
      formData.append("foto_dihapus", String(id))
    );

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createUnit(formData)
          : await updateUnit(values.id_unit, formData);

      if (result && !result.ok) {
        toast.error(result.message);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">
                Informasi Dasar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="id_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Unit</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Misal: UNT-001"
                        maxLength={10}
                        disabled={mode === "edit"}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nama_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Unit</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Misal: Kamar 101"
                        maxLength={30}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kapasitas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kapasitas</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                        <Input
                          type="number"
                          min={1}
                          placeholder="Misal: 2"
                          className="pl-9"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Controller
                control={form.control}
                name="fasilitas"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Fasilitas
                    </label>
                    <FasilitasCheckboxGrid
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {fieldState.error && (
                      <p className="text-sm text-red-600">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="fasilitas_lainnya"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fasilitas Lainnya</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ketik fasilitas lainnya, pisahkan dengan koma"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kategori"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KATEGORI_UNIT.map((k) => (
                          <SelectItem key={k} value={k}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_UNIT.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="harga_per_malam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga (Per Malam)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                          Rp
                        </span>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          className="pl-10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">
                Foto Unit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MultiFotoUploader
                newFiles={newFiles}
                onNewFilesChange={setNewFiles}
                existingFotos={existingFotos}
                removedExistingIds={removedExistingIds}
                onRemoveExisting={(id) =>
                  setRemovedExistingIds((prev) => [...prev, id])
                }
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/unit")}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[#1E3A8A] hover:bg-[#162d6e] text-white"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Simpan Unit" : "Perbarui Unit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
