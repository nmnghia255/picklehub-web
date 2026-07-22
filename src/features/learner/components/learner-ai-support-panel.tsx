"use client"

import {
  AlertCircle,
  Award,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  Flame,
  HelpCircle,
  RefreshCw,
  Sparkles,
  Trophy,
} from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { usePersonalizedRecommendations } from "@/features/ai/hooks/use-ai-queries"

export function LearnerAiSupportPanel() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === "vi"

  const [limit, setLimit] = useState(5)

  const { data, isLoading, error, refetch, isFetching } =
    usePersonalizedRecommendations("training", limit)

  const handleRefresh = async () => {
    try {
      await refetch()
      toast.success(
        isVi
          ? "Đã cập nhật lộ trình huấn luyện mới!"
          : "Training roadmap updated successfully!"
      )
    } catch (err) {
      toast.error(
        isVi ? "Không thể làm mới lộ trình." : "Failed to refresh roadmap."
      )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Banner Skeleton */}
        <Card className="relative overflow-hidden border-none bg-muted">
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-3">
              <Skeleton className="h-8 w-64 bg-background/20" />
              <Skeleton className="h-4 w-full max-w-xl bg-background/20" />
              <Skeleton className="h-4 w-3/4 max-w-md bg-background/20" />
            </div>
          </CardContent>
        </Card>

        {/* Roadmap Title Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
            </CardContent>
          </Card>
        </div>

        {/* Skills Grid Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5 dark:bg-destructive/10">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="size-12 animate-bounce text-destructive" />
          <h3 className="mt-4 text-lg font-semibold text-destructive">
            {isVi
              ? "Không thể tải lộ trình huấn luyện"
              : "Failed to load training roadmap"}
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : isVi
                ? "Đã xảy ra lỗi khi kết nối với AI."
                : "An error occurred while connecting to AI."}
          </p>
          <Button
            variant="outline"
            className="mt-6 border-destructive/30 hover:bg-destructive/10"
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-2 size-4" />
            {isVi ? "Thử lại" : "Try Again"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const recommendation = data?.data
  const skills = recommendation?.skills ?? []

  if (!recommendation || skills.length === 0) {
    return (
      <div className="space-y-6">
        {/* Banner with Premium Gradient */}
        <Card className="relative overflow-hidden border-none bg-linear-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-lg">
          <div className="pointer-events-none absolute top-0 right-0 translate-x-12 translate-y-[-12px] opacity-10 blur-sm select-none">
            <Bot className="size-64" />
          </div>
          <CardContent className="relative z-10 p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <Sparkles className="size-3.5 animate-pulse fill-current text-amber-300" />
                  <span>{isVi ? "TÍNH NĂNG AI" : "AI POWERED"}</span>
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  {isVi
                    ? "Lộ trình Huấn luyện Cá nhân hóa"
                    : "Personalized AI Roadmap"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-white/80">
                  {isVi
                    ? "Dựa trên hồ sơ của bạn (tay thuận, điểm DUPR, lịch sử trận đấu) để thiết kế lộ trình tập luyện tốt nhất."
                    : "Tailored to your playing hand, DUPR rating, match performance history, and customized coach rules."}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 self-start sm:self-center">
                <div className="flex items-center justify-between gap-3 rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs">
                  <span className="font-medium whitespace-nowrap text-white/85">
                    {isVi ? "Số lượng kỹ năng (1-20):" : "Skills limit (1-20):"}
                  </span>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="h-7 w-14 rounded border border-white/10 bg-white/15 px-1.5 text-xs text-white outline-hidden focus:ring-1 focus:ring-white/30 [&_option]:bg-background [&_option]:text-foreground"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white font-medium text-indigo-600 shadow-sm hover:bg-white/90"
                  onClick={handleRefresh}
                  disabled={isFetching}
                >
                  <RefreshCw
                    className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
                  />
                  {isVi ? "Tạo lộ trình" : "Generate Plan"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State Card */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-indigo-50 p-4 dark:bg-indigo-950/50">
              <Bot className="size-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              {isVi
                ? "Chưa có lộ trình huấn luyện"
                : "No training roadmap available yet"}
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {isVi
                ? "Chúng tôi cần thêm dữ liệu để thiết kế kế hoạch của bạn. Hãy đảm bảo bạn đã điền các thông tin trong hồ sơ cá nhân hoặc bấm nút dưới đây để tạo lộ trình."
                : "We need dynamic details from your profile. Ensure your DUPR, hand choice, or match data is set, or click below to trigger AI generation."}
            </p>
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {isVi
                    ? "Số lượng kỹ năng cần tạo (1-20):"
                    : "Skills to generate (1-20):"}
                </span>
                <div className="w-20">
                  <Select
                    value={String(limit)}
                    onValueChange={(val) => setLimit(Number(val))}
                  >
                    <SelectTrigger size="sm" className="h-8 w-20">
                      <SelectValue placeholder="5" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(
                        (val) => (
                          <SelectItem key={val} value={String(val)}>
                            {val}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="mt-6 bg-indigo-600 hover:bg-indigo-700"
                size="lg"
                onClick={handleRefresh}
                disabled={isFetching}
              >
                <Sparkles className="mr-2 size-4" />
                {isVi ? "Tạo ngay" : "Generate Now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-in space-y-8 duration-500 fade-in">
      {/* Banner */}
      <Card className="relative overflow-hidden border-none bg-linear-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="pointer-events-none absolute top-0 right-0 translate-x-12 translate-y-[-12px] opacity-10 blur-sm select-none">
          <Bot className="size-64" />
        </div>
        <CardContent className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Sparkles className="size-3.5 fill-current text-yellow-300" />
                <span>
                  {isVi ? "TỐI ƯU HÓA BỞI AI" : "AI OPTIMIZED ROADMAP"}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {isVi
                  ? "Kế hoạch Tập luyện Cá nhân"
                  : "Personalized Training Roadmap"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-white/80">
                {isVi
                  ? "Lộ trình thiết kế riêng dựa trên thông tin DUPR, tay thuận và kỹ năng của bạn từ hệ thống RAG Huấn luyện."
                  : "Custom training roadmap generated dynamically based on your DUPR rating, stats, and professional coach RAG knowledge base."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap description card */}
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xl font-bold tracking-tight">
              {isVi
                ? "Lộ trình Phát triển tổng thể"
                : "Overall Development Path"}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start rounded-lg bg-muted/40 p-1.5 sm:self-center dark:bg-muted/10">
            <div className="flex items-center gap-1.5 px-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {isVi ? "Số kỹ năng (1-20):" : "Skills count (1-20):"}
              </span>
              <div className="w-16">
                <Select
                  value={String(limit)}
                  onValueChange={(val) => setLimit(Number(val))}
                >
                  <SelectTrigger size="sm" className="h-6 w-16 text-xs">
                    <SelectValue placeholder="5" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((val) => (
                      <SelectItem key={val} value={String(val)}>
                        {val}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="h-7 shrink-0 border border-border bg-background text-xs font-semibold text-indigo-600 shadow-xs hover:bg-muted dark:text-indigo-400"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-1.5 size-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
              {isVi ? "Lộ trình từ AI" : "AI Plan"}
            </Button>
          </div>
        </div>
        <Card className="border border-indigo-100 bg-indigo-50/10 shadow-sm backdrop-blur-sm dark:border-indigo-950/50 dark:bg-indigo-950/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900">
                <Flame className="size-5 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-200">
                  {isVi ? "Kế hoạch Hành động của Bạn" : "Your Focus & Pathway"}
                </h4>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {recommendation.trainingPath}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills detail */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xl font-bold tracking-tight">
            {isVi
              ? "Các Kỹ năng & Bài tập cần tập trung"
              : "Recommended Skills & Drills"}
          </h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {skills.map((skill, index) => (
            <Card
              key={index}
              className="flex flex-col overflow-hidden rounded-xl border border-border/80 shadow-md transition-all duration-300 hover:border-indigo-200 hover:shadow-xl dark:hover:border-indigo-900"
            >
              <div className="h-1.5 bg-linear-to-r from-violet-500 to-indigo-500" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="border-indigo-500/30 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400"
                  >
                    {isVi ? `Kỹ năng ${index + 1}` : `Skill #${index + 1}`}
                  </Badge>
                  <Award className="size-4.5 text-amber-500" />
                </div>
                <CardTitle className="mt-2 text-lg font-bold tracking-tight text-foreground">
                  {skill.tacticName}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-6 pt-0">
                <div className="space-y-4">
                  {/* Concept */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      {isVi ? "Khái niệm Cốt lõi" : "Core Concept"}
                    </span>
                    <p className="text-sm text-foreground/90">
                      {skill.coreConcept}
                    </p>
                  </div>

                  {/* Why helpful */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      {isVi ? "Tại sao nó quan trọng?" : "Why It Helps"}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {skill.whyHelpful}
                    </p>
                  </div>

                  {/* Steps */}
                  <div className="space-y-2">
                    <span className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      {isVi ? "Hướng dẫn Thực hiện" : "Execution Steps"}
                    </span>
                    <ol className="space-y-2 pl-1 text-sm text-foreground/80">
                      {skill.executionSteps.map((step, stepIdx) => (
                        <li key={stepIdx} className="flex items-start gap-2">
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-medium text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                            {stepIdx + 1}
                          </span>
                          <span className="leading-snug">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Pro tip callout */}
                {skill.proTip && (
                  <div className="rounded-lg border border-amber-200/50 bg-amber-50/30 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0 rounded bg-amber-100 p-1 dark:bg-amber-900/50">
                        <Sparkles className="size-3.5 fill-amber-600 text-amber-600 dark:fill-amber-400 dark:text-amber-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold tracking-wider text-amber-800 uppercase dark:text-amber-400">
                          {isVi
                            ? "Mẹo từ HLV chuyên nghiệp"
                            : "COACH'S PRO TIP"}
                        </span>
                        <p className="mt-1 text-xs leading-relaxed font-medium text-amber-900/80 dark:text-amber-300/90">
                          {skill.proTip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
