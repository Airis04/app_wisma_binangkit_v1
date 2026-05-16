"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Building2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-screen w-full bg-white">
      {/* SISI KIRI: Gambar Latar (50%) */}
      <div className="hidden lg:flex w-1/2 bg-gray-200 relative">
        <img
          src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop"
          alt="Pemandangan Homestay"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay gelap opsional agar gambar tidak terlalu terang */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* SISI KANAN: Form Login (50%) */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo & Judul */}
          <div className="text-center sm:text-left space-y-2">
            <div className="flex items-center justify-center sm:justify-start space-x-2 text-[#0A2351] mb-6">
              <Building2 size={24} />
              <span className="text-lg font-bold">Wisma Binangkit</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Selamat Datang</h1>
            <p className="text-sm text-gray-500">
              Silakan masuk ke akun administrator Anda untuk mengelola operasional.
            </p>
          </div>

          {/* Form Login */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              {/* Input Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@wismabinangkit.com"
                  className="w-full"
                  required
                />
              </div>

              {/* Input Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="password">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi Anda"
                    className="w-full pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
              >
                Ingat Saya
              </label>
            </div>

            {/* Tombol Submit */}
            <Button
              type="submit"
              className="w-full bg-[#0A2351] hover:bg-[#081b40] text-white flex items-center justify-center py-6 text-base"
            >
              Masuk ke Dasbor
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}