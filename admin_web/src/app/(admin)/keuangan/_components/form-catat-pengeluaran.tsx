"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, PlusCircle, Save } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

import {
  operationalCostFormSchema,
  type OperationalCostFormValues,
  KATEGORI_PENGELUARAN,
} from "../_lib/schema";
import { createOperationalCost } from "../_actions";

export default function FormCatatPengeluaran() {
  const [isPending, startTransition] = useTransition();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<OperationalCostFormValues>({
    resolver: zodResolver(operationalCostFormSchema),
    defaultValues: {
      tanggal_pencatatan: new Date(),
      kategori_pengeluaran: "Utilitas",
      deskripsi_pengeluaran: "",
      total_pengeluaran: 0,
    },
  });

  function onSubmit(values: OperationalCostFormValues) {
    const formData = new FormData();
    formData.set(
      "tanggal_pencatatan",
      values.tanggal_pencatatan.toISOString()
    );
    formData.set("kategori_pengeluaran", values.kategori_pengeluaran);
    formData.set("deskripsi_pengeluaran", values.deskripsi_pengeluaran);
    formData.set("total_pengeluaran", String(values.total_pengeluaran));

    startTransition(async () => {
      const result = await createOperationalCost(formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Pengeluaran berhasil dicatat");
      form.reset({
        tanggal_pencatatan: new Date(),
        kategori_pengeluaran: "Utilitas",
        deskripsi_pengeluaran: "",
        total_pengeluaran: 0,
      });
    });
  }

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EF4444]/10 text-[#EF4444]">
            <PlusCircle size={18} />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">
              Catat Pengeluaran Baru
            </CardTitle>
            <CardDescription>
              ID Biaya dibuat otomatis dengan format BIY-000001. Data ini
              langsung memengaruhi laba bersih di Dasbor.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="tanggal_pencatatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start bg-white text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "d MMMM yyyy", {
                                  locale: idLocale,
                                })
                              : "Pilih tanggal"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(d) => {
                            if (d) {
                              field.onChange(d);
                              setCalendarOpen(false);
                            }
                          }}
                          locale={idLocale}
                          disabled={(date) => date > new Date()}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kategori_pengeluaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori Pengeluaran</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KATEGORI_PENGELUARAN.map((k) => (
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
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
              <FormField
                control={form.control}
                name="total_pengeluaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Pengeluaran</FormLabel>
                    <FormControl>
                      <div className="flex h-8 items-center rounded-lg border border-input bg-white transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                        <span className="flex h-full items-center border-r border-gray-200 px-3 text-sm text-gray-500">
                          Rp
                        </span>
                        <Input
                          inputMode="numeric"
                          placeholder="0"
                          className="h-full border-0 bg-transparent px-3 font-semibold focus-visible:border-transparent focus-visible:ring-0"
                          value={
                            field.value === 0
                              ? ""
                              : field.value.toLocaleString("id-ID")
                          }
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            field.onChange(digits === "" ? 0 : Number(digits));
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deskripsi_pengeluaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Misal: Tagihan listrik PLN bulan Mei 2026"
                        maxLength={100}
                        rows={3}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">
                      {field.value.length} / 100 karakter
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                Catat Pengeluaran
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
