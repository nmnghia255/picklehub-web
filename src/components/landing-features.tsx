"use client"

import {
  Package,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react"

import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Trophy,
    title: "Quản Lý Giải Đấu",
    description: "Tạo, quản lý và theo dõi giải đấu với bracket thông minh",
  },
  {
    icon: Users,
    title: "Tương Tác Cộng Đồng",
    description:
      "Kết nối người chơi, huấn luyện viên, nhà kinh doanh và tổ chức giải đấu",
  },
  {
    icon: TrendingUp,
    title: "Phân Tích Hiệu Suất",
    description:
      "Phân tích chi tiết dữ liệu trận đấu, thống kê cá nhân, và xu hướng hiệu suất",
  },
  {
    icon: Sparkles,
    title: "Trợ Lý AI",
    description:
      "Nhận lời khuyên chiến lược, phân tích nâng cao và hỗ trợ quản lý từ AI",
  },
  {
    icon: Package,
    title: "Quản Lý Thiết Bị",
    description:
      "Quản lý, kinh doanh và chia sẻ thông tin thiết bị thể thao chuyên dụng",
  },
  {
    icon: Target,
    title: "Nhóm Chuyên Biệt",
    description:
      "Tạo nhóm riêng cho huấn luyện, kinh tế, và tổ chức giải đấu phù hợp nhu cầu",
  },
]

export function LandingFeatures() {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Tính Năng Chính</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Dịch vụ toàn diện hỗ trợ mọi đối tượng trong cộng đồng pickleball
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="flex flex-col gap-4 p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
