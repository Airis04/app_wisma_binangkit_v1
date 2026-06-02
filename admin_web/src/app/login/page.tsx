"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Building2, ArrowRight, Loader2 } from "lucide-react";

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
                  <Input
                    type="email"
                    placeholder="admin@wismabinangkit.com"
                    autoComplete="email"
                    {...field}
                  />
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
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan kata sandi Anda"
                      autoComplete="current-password"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
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
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full bg-[#1E3A8A] hover:bg-[#162d6e] text-white flex items-center justify-center py-6 text-base"
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
    <div className="flex h-screen w-full bg-white">
      <div className="hidden lg:flex w-1/2 bg-gray-200 relative">
        <img
          src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop"
          alt="Pemandangan Pantai Pangandaran"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center sm:text-left space-y-2">
            <div className="flex items-center justify-center sm:justify-start space-x-2 text-[#1E3A8A] mb-6">
              <Building2 size={24} />
              <span className="text-lg font-bold">Wisma Binangkit</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Selamat Datang</h1>
            <p className="text-sm text-gray-500">
              Silakan masuk ke akun administrator Anda untuk mengelola operasional homestay.
            </p>
          </div>

          <Suspense fallback={<div className="h-[400px]" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
