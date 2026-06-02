"use client";

import Image from "next/image";
import { useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2 } from "lucide-react";
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
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">
            Foto Profil
          </CardTitle>
          <p className="text-sm text-gray-500">
            Foto ini tampil di menu admin kanan atas.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
              {fotoProfil ? (
                <Image
                  src={fotoProfil}
                  alt={defaultValues.nama_lengkap}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-[#1E3A8A]">
                  {defaultValues.nama_lengkap.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => onPhotoSelected(event.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isPhotoPending}
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            {isPhotoPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Camera className="mr-2 h-4 w-4" />
            )}
            Ganti Foto Profil
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">
              Informasi Akun
            </CardTitle>
            <p className="text-sm text-gray-500">
              Kelola nama dan nomor telepon admin.
            </p>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                className="space-y-4"
              >
                <FormField
                  control={profileForm.control}
                  name="nama_lengkap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Admin</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama admin" {...field} />
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

                <div>
                  <FormLabel>Email</FormLabel>
                  <Input value={email} disabled className="mt-2" />
                  <p className="mt-1 text-xs text-gray-500">
                    Email admin dipakai untuk login dan belum dibuka untuk diedit.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isProfilePending}
                    className="bg-[#1E3A8A] text-white hover:bg-[#162d6e]"
                  >
                    {isProfilePending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Simpan Profil
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">
              Ganti Kata Sandi
            </CardTitle>
            <p className="text-sm text-gray-500">
              Gunakan kata sandi lama untuk membuat kata sandi baru.
            </p>
          </CardHeader>
          <CardContent>
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
                        <Input type="password" {...field} />
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
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isPasswordPending}
                    className="bg-[#1E3A8A] text-white hover:bg-[#162d6e]"
                  >
                    {isPasswordPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
