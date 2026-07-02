"use client";

import Image from "next/image";
import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  IdCard,
  Loader2,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
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
import {
  accountPasswordSchema,
  accountProfileSchema,
  type AccountPasswordValues,
  type AccountProfileValues,
} from "../_lib/schema";
import {
  updateAdminPassword,
  updateAdminPhoto,
  updateAdminProfile,
} from "../_actions";

type Props = {
  defaultValues: AccountProfileValues;
  email: string;
  fotoProfil: string | null;
};

export default function AccountSettingsForm({
  defaultValues,
  email,
  fotoProfil,
}: Props) {
  const router = useRouter();
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [isPhotoPending, startPhotoTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<AccountProfileValues>({
    resolver: zodResolver(accountProfileSchema),
    defaultValues,
  });

  const passwordForm = useForm<AccountPasswordValues>({
    resolver: zodResolver(accountPasswordSchema),
    defaultValues: {
      password_lama: "",
      password_baru: "",
    },
  });

  function onSubmitProfile(values: AccountProfileValues) {
    const formData = new FormData();
    formData.set("nama_lengkap", values.nama_lengkap);
    formData.set("no_telepon", values.no_telepon);

    startProfileTransition(async () => {
      const result = await updateAdminProfile(formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  function onSubmitPassword(values: AccountPasswordValues) {
    const formData = new FormData();
    formData.set("password_lama", values.password_lama);
    formData.set("password_baru", values.password_baru);

    startPasswordTransition(async () => {
      const result = await updateAdminPassword(formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      passwordForm.reset();
      toast.success(result.message);
    });
  }

  function onPhotoSelected(file: File | null) {
    if (!file) return;

    const formData = new FormData();
    formData.set("foto_profil", file);

    startPhotoTransition(async () => {
      const result = await updateAdminPhoto(formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1E3A8A]/5 text-[#1E3A8A]">
              <Camera size={18} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">
                Foto Profil
              </CardTitle>
              <CardDescription>
                Foto ini tampil di menu admin kanan atas.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="mx-auto flex w-full max-w-[264px] flex-col items-stretch gap-4">
            <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-[#F9FAFB] p-4">
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-sm ring-1 ring-gray-200">
                {fotoProfil ? (
                  <Image
                    src={fotoProfil}
                    alt={defaultValues.nama_lengkap}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-[#1E3A8A]">
                    {defaultValues.nama_lengkap.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="mt-3 text-center">
                <p className="break-words text-sm font-semibold text-gray-900">
                  {defaultValues.nama_lengkap}
                </p>
                <p className="text-xs text-gray-500">Admin Wisma Binangkit</p>
              </div>
            </div>

            <div className="rounded-lg border border-[#1E3A8A]/10 bg-[#1E3A8A]/5 p-3">
              <div className="flex items-start gap-2">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-[#1E3A8A]"
                />
                <p className="text-xs leading-relaxed text-gray-600">
                  Format foto yang didukung: JPG, PNG, atau WEBP. Ukuran
                  maksimal 5 MB dan akan dikompresi otomatis.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) =>
                onPhotoSelected(event.target.files?.[0] ?? null)
              }
            />
            <Button
              type="button"
              variant="outline"
              disabled={isPhotoPending}
              className="w-full border-[#1E3A8A]/20 text-[#1E3A8A] hover:bg-[#1E3A8A]/5 hover:text-[#1E3A8A]"
              onClick={() => fileInputRef.current?.click()}
            >
              {isPhotoPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Camera className="mr-2 h-4 w-4" />
              )}
              Ganti Foto Profil
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#10B981]/10 text-[#10B981]">
                <UserRound size={18} />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  Informasi Akun
                </CardTitle>
                <CardDescription>
                  Kelola nama dan nomor telepon admin.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="nama_lengkap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Admin</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              placeholder="Nama admin"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="no_telepon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="tel"
                            placeholder="081234567890"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-lg border border-gray-200 bg-[#F9FAFB] p-3">
                  <FormLabel>Email</FormLabel>
                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input value={email} disabled className="pl-9" />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Email admin dipakai untuk login dan belum dibuka untuk diedit.
                  </p>
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <Button
                    type="submit"
                    disabled={isProfilePending}
                    className="bg-[#1E3A8A] text-white hover:bg-[#162d6e]"
                  >
                    {isProfilePending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Simpan Profil
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EF4444]/10 text-[#EF4444]">
                <LockKeyhole size={18} />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  Ganti Kata Sandi
                </CardTitle>
                <CardDescription>
                  Gunakan kata sandi lama untuk membuat kata sandi baru.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="password_lama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kata Sandi Lama</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Masukkan kata sandi lama" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="password_baru"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kata Sandi Baru</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Minimal 8 karakter" {...field} />
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        Gunakan kombinasi huruf dan angka agar lebih aman.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end border-t border-gray-100 pt-4">
                  <Button
                    type="submit"
                    disabled={isPasswordPending}
                    className="bg-[#1E3A8A] text-white hover:bg-[#162d6e]"
                  >
                    {isPasswordPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Simpan Kata Sandi
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
