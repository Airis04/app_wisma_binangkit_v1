"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">
          Pengaturan Pembayaran Manual
        </CardTitle>
        <p className="text-sm text-gray-500">
          Data ini ditampilkan di aplikasi tamu saat tamu lanjut ke step
          pembayaran dan mengunggah bukti bayar.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...form.register("id_setting")} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Textarea rows={4} maxLength={200} {...field} />
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    {field.value.length} / 200 karakter
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#1E3A8A] hover:bg-[#162d6e] text-white"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Pengaturan
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
