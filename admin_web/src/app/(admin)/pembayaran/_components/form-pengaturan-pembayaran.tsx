"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, ClipboardList, Loader2, Save, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  paymentSettingFormSchema,
  type PaymentSettingFormValues,
} from "../_lib/schema";
import { updatePaymentSetting } from "../_actions";

type Props = {
  defaultValues: PaymentSettingFormValues;
};

export default function FormPengaturanPembayaran({
  defaultValues,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<PaymentSettingFormValues>({
    resolver: zodResolver(paymentSettingFormSchema),
    defaultValues,
  });
  const preview = useWatch({ control: form.control });

  function onSubmit(values: PaymentSettingFormValues) {
    const formData = new FormData();
    formData.set("id_setting", values.id_setting);
    formData.set("nama_bank", values.nama_bank);
    formData.set("nomor_rekening", values.nomor_rekening);
    formData.set(
      "nama_pemilik_rekening",
      values.nama_pemilik_rekening
    );
    formData.set("instruksi_pembayaran", values.instruksi_pembayaran);

    startTransition(async () => {
      const result = await updatePaymentSetting(formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    });
  }

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1E3A8A]/5 text-[#1E3A8A]">
            <Banknote size={18} />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">
              Rekening Pembayaran Manual
            </CardTitle>
            <CardDescription>
              Data ini ditampilkan di aplikasi tamu saat tamu lanjut ke step
              pembayaran dan mengunggah bukti bayar.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <input type="hidden" {...form.register("id_setting")} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nama_bank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Bank</FormLabel>
                        <FormControl>
                          <Input placeholder="BCA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nomor_rekening"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Rekening</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            placeholder="1234567890"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nama_pemilik_rekening"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Atas Nama</FormLabel>
                      <FormControl>
                        <Input placeholder="Wisma Binangkit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instruksi_pembayaran"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instruksi Pembayaran</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          maxLength={200}
                          className="resize-none"
                          placeholder="Tulis instruksi singkat untuk tamu"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        {field.value.length} / 200 karakter
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-xl border border-gray-200 bg-[#F9FAFB] p-4">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Smartphone size={16} className="text-[#1E3A8A]" />
                  Preview Mobile
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E3A8A] text-white">
                      <Banknote size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Instruksi Pembayaran
                      </p>
                      <p className="text-xs text-gray-500">
                        Transfer manual ke rekening berikut.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl bg-[#F9FAFB] p-3">
                    <PreviewRow label="Bank" value={preview.nama_bank} />
                    <PreviewRow
                      label="Nomor Rekening"
                      value={preview.nomor_rekening}
                    />
                    <PreviewRow
                      label="Atas Nama"
                      value={preview.nama_pemilik_rekening}
                    />
                  </div>

                  <div className="mt-4 rounded-xl border border-[#1E3A8A]/10 bg-[#1E3A8A]/5 p-3">
                    <p className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
                      <ClipboardList size={13} />
                      Catatan untuk tamu
                    </p>
                    <p className="text-sm leading-relaxed text-gray-700">
                      {preview.instruksi_pembayaran ||
                        "Instruksi pembayaran belum diisi."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#1E3A8A] hover:bg-[#162d6e] text-white"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Simpan Pembayaran
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function PreviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="break-words text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}
