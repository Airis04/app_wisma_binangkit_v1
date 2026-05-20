"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import FotoUploader from "./foto-uploader";

type Props = {
  mode: "create" | "edit";
  defaultValues?: UnitFormValues;
  existingFotoUrl?: string | null;
};

export default function UnitForm({
  mode,
  defaultValues,
  existingFotoUrl,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [foto, setFoto] = useState<File | null>(null);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: defaultValues ?? {
      id_unit: "",
      nama_unit: "",
      kategori: "Rumah Utama",
      harga_per_malam: 0,
      kapasitas: 1,
      fasilitas: [],
      status_unit: "Tersedia",
    },
  });

  function onSubmit(values: UnitFormValues) {
    const formData = new FormData();
    formData.set("id_unit", values.id_unit);
    formData.set("nama_unit", values.nama_unit);
    formData.set("kategori", values.kategori);
    formData.set("harga_per_malam", String(values.harga_per_malam));
    formData.set("kapasitas", String(values.kapasitas));
    formData.set("status_unit", values.status_unit);
    values.fasilitas.forEach((f) => formData.append("fasilitas", f));
    if (foto) formData.set("foto", foto);

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
              <p className="text-sm text-gray-500">
                Data utama unit homestay yang akan ditampilkan ke tamu.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="id_unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Unit</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="UNT-000001"
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
                        <Input placeholder="Rumah Utama" maxLength={30} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="kategori"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="kapasitas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kapasitas (orang)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="harga_per_malam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga per Malam (Rp)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
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
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">
                Foto Unit
              </CardTitle>
              <p className="text-sm text-gray-500">
                Foto akan otomatis dikompresi ke WebP sebelum disimpan.
              </p>
            </CardHeader>
            <CardContent>
              <FotoUploader
                value={foto}
                onChange={setFoto}
                existingUrl={existingFotoUrl}
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
