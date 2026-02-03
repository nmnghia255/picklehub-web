"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-md">
        {/* Title */}
        <h1 className="mb-8 text-center text-4xl font-extrabold text-gray-900">
          Đăng nhập
        </h1>

        {/* Email */}
        <div className="mb-6">
          <label className="mb-1 block text-base font-medium text-gray-900">
            Email
          </label>
          <input
            type="email"
            placeholder="email@example.com"
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-gray-800 focus:outline-none"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="mb-1 block text-base font-medium text-gray-900">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-md border border-gray-300 px-4 py-2 pr-10 text-gray-900 focus:ring-2 focus:ring-gray-800 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="mb-8 flex items-center justify-between text-base text-gray-900">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border" />
            Lưu đăng nhập
          </label>
          <a href="#" className="underline">
            Quên mật khẩu?
          </a>
        </div>

        {/* Login button */}
        <Button className="w-full rounded-md bg-gray-900 p-4 text-base font-medium text-gray-100 transition duration-200 hover:bg-gray-800">
          Đăng nhập
        </Button>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="px-3 text-base text-gray-500">hoặc</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        {/* Google */}
        <button className="mb-3 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 py-2 text-base text-gray-900 hover:bg-gray-50">
          <Image src="/google.svg" alt="Google" width={20} height={20} />
          Tiếp tục với Google
        </button>

        {/* Facebook */}
        <button className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 py-2 text-base text-gray-900 hover:bg-gray-50">
          <Image src="/facebook.svg" alt="Facebook" width={20} height={20} />
          Tiếp tục với Facebook
        </button>

        {/* Register */}
        <p className="mt-8 text-center text-base text-gray-900">
          Chưa có tài khoản?{" "}
          <a href="#" className="font-medium text-gray-900 underline">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}
