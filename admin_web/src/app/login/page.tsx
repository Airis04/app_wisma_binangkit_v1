"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Building2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Waves,
  Leaf,
  Mail,
  LockKeyhole,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.email("Format email tidak valid").max(30, "Email maksimal 30 karakter"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function WismaBrandMark({
  compact = false,
  color = "#1E3A8A",
  textColor,
}: {
  compact?: boolean;
  color?: string;
  textColor?: string;
}) {
  const resolvedTextColor = textColor ?? color;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 118 78"
        aria-hidden="true"
        className={compact ? "h-[54px] w-[78px]" : "h-[78px] w-[118px]"}
      >
        <g
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 37.44 L50.74 17.16 L73.16 37.44" strokeWidth="5.3" />
          <path d="M50.74 17.16 Q61.36 26.52 73.16 37.44" strokeWidth="3.1" />
          <path
            d="M9.44 56.16 C33.04 45.24 53.1 51.48 73.16 57.72 C89.68 63.18 101.48 56.16 113.28 49.92"
            strokeWidth="3.54"
          />
          <path
            d="M21.24 65.52 C44.84 59.28 61.36 67.08 80.24 68.64 C93.22 70.2 106.2 65.52 116.82 60.84"
            strokeWidth="4"
          />
          <path
            d="M68.44 38.22 C77.88 21.84 89.68 14.04 106.2 7.8"
            strokeWidth="2.6"
          />
        </g>

        <g fill={color}>
          {[
            [71.98, 33.54, 18.88, -49],
            [76.9, 29.9, 17.92, -46],
            [81.82, 26.26, 16.96, -43],
            [86.74, 22.62, 16, -40],
            [91.66, 18.98, 15.04, -37],
            [96.58, 15.34, 14.08, -34],
            [101.5, 11.7, 13.12, -31],
          ].map(([x, y, width, rotate], index) => (
            <path
              key={index}
              d={`M0 0 Q${Number(width) * 0.42} -6.63 ${width} 0 Q${
                Number(width) * 0.4
              } 2.73 0 0`}
              transform={`translate(${x} ${y}) rotate(${rotate})`}
            />
          ))}

          {[0, 1].flatMap((col) =>
            [0, 1].map((row) => (
              <rect
                key={`${col}-${row}`}
                x={49.56 + col * 7.17}
                y={32.76 + row * 7.17}
                width="5.31"
                height="5.31"
                rx="0.64"
              />
            ))
          )}
        </g>
      </svg>

      {!compact && (
        <>
          <p
            className="mt-2 text-center text-[25px] font-semibold tracking-[0.1em]"
            style={{ color: resolvedTextColor }}
          >
            Wisma Binangkit
          </p>
          <p
            className="mt-1 text-center text-[11px] font-semibold tracking-[0.27em]"
            style={{ color: resolvedTextColor, opacity: 0.72 }}
          >
            HOMESTAY PANGANDARAN
          </p>
        </>
      )}
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const error = searchParams.get("error");
  const [serverError, setServerError] = useState<string | null>(() => {
    if (error === "CredentialsSignin" || error === "Credentials") {
      return "Email atau kata sandi salah";
    }
    if (error) return "Terjadi kesalahan saat masuk. Silakan coba lagi.";
    return null;
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (!result || result.error) {
      setServerError("Email atau kata sandi salah");
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl") ?? "/dasbor";
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="admin@wismabinangkit.com"
                      autoComplete="email"
                      className="h-10 bg-white pl-9"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Kata Sandi</FormLabel>
                <FormControl>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan kata sandi Anda"
                      autoComplete="current-password"
                      className="h-10 bg-white pl-9 pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={
                        showPassword
                          ? "Sembunyikan kata sandi"
                          : "Tampilkan kata sandi"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm font-medium text-gray-600 leading-none"
              >
                Ingat Saya
              </label>
            </div>
          )}
        />

        {serverError && (
          <div className="rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/10 px-3 py-2 text-sm text-[#EF4444]">
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="flex w-full items-center justify-center bg-[#1E3A8A] py-5 text-base text-white shadow-sm hover:bg-[#162d6e]"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 animate-spin" size={18} />
              Memproses...
            </>
          ) : (
            <>
              Masuk ke Dasbor
              <ArrowRight className="ml-2" size={18} />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full bg-[#F9FAFB]">
      <div className="relative hidden w-1/2 overflow-hidden bg-[#1E3A8A] lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.34),transparent_32%),linear-gradient(135deg,#1E3A8A_0%,#1E3A8A_55%,#3B82F6_100%)]" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full border border-white/15" />
        <div className="absolute -bottom-12 left-24 h-56 w-56 rounded-full border border-white/10" />
        <div className="absolute right-12 top-16 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur">
          <Leaf size={30} />
        </div>

        <div className="relative z-10 flex h-full w-full flex-col justify-between p-14 text-white">
          <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1E3A8A]">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">
                Wisma Binangkit
              </p>
              <p className="mt-1 text-xs text-white/70">
                Homestay Pangandaran
              </p>
            </div>
          </div>

          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur">
              <Waves size={16} />
              Tenang, elegan, dan terpercaya
            </div>
            <div>
              <h1 className="text-5xl font-bold leading-tight">
                Kelola homestay dengan alur yang lebih rapi.
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/75">
                Pantau pesanan, verifikasi pembayaran, unit, dan keuangan dalam
                satu panel admin Wisma Binangkit.
              </p>
            </div>
            <div className="grid max-w-lg grid-cols-3 gap-3">
              {[
                ["Reservasi", "Masuk cepat"],
                ["Pembayaran", "Verifikasi manual"],
                ["Keuangan", "Laba bersih"],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur"
                >
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-xs text-white/70">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/60">
            Panel admin khusus pengelola Wisma Binangkit.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-6 sm:p-10 lg:w-1/2">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-6">
            <div className="flex justify-center">
              <WismaBrandMark />
            </div>
            <div className="space-y-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1E3A8A]">
                Panel Admin
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                Selamat Datang
              </h1>
              <p className="text-sm leading-relaxed text-gray-500">
                Masuk ke akun administrator untuk mengelola operasional Wisma
                Binangkit.
              </p>
            </div>

            <div className="rounded-xl border border-[#1E3A8A]/10 bg-[#1E3A8A]/5 p-3">
              <div className="flex items-start gap-2">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-[#1E3A8A]"
                />
                <p className="text-xs leading-relaxed text-gray-600">
                  Gunakan email dan kata sandi admin yang sudah terdaftar.
                  Setelah masuk, Anda akan diarahkan ke Dasbor.
                </p>
              </div>
            </div>

            <Suspense fallback={<div className="h-[360px]" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
