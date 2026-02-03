"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg rounded-xl bg-card p-8 text-card-foreground shadow-md">
        {/* Title */}
        <h1 className="mb-8 text-center text-4xl font-extrabold">Đăng nhập</h1>

        {/* Email */}
        <div className="mb-8">
          <Label htmlFor="email" className="mb-1 block text-lg">
            Email
          </Label>
          <Input id="email" type="email" placeholder="email@example.com" />
        </div>

        {/* Password */}
        <div className="mb-8">
          <Label htmlFor="password" className="mb-1 block text-lg">
            Mật khẩu
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-base">
              Lưu đăng nhập
            </Label>
          </div>
          <a href="#" className="text-base underline">
            Quên mật khẩu?
          </a>
        </div>

        {/* Login button */}
        <Button size="lg" className="w-full text-lg font-medium">
          Đăng nhập
        </Button>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-border" />
          <span className="px-3 text-base">hoặc</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google */}
        <Button
          variant="outline"
          size="lg"
          className="mb-4 w-full gap-2 text-lg"
        >
          <Image src="/google.svg" alt="Google" width={20} height={20} />
          Tiếp tục với Google
        </Button>

        {/* Facebook */}
        <Button
          variant="outline"
          size="lg"
          className="mb-4 w-full gap-2 text-lg"
        >
          <Image src="/facebook.svg" alt="Facebook" width={22} height={22} />
          Tiếp tục với Facebook
        </Button>

        {/* Register */}
        <p className="mt-8 text-center text-base">
          Chưa có tài khoản?{" "}
          <a href="#" className="text-lg font-medium underline">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}
