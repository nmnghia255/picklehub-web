"use client"

import {
  AlertCircle,
  CheckCircle2,
  FileVideo,
  ImagePlus,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  Upload,
  X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getStoredLanguage } from "@/i18n/language"

import { SwingAnalysisError } from "../api/swing-analysis-service"
import {
  useAnalyzeSwing,
  useUploadSwingMedia,
} from "../hooks/use-coach-queries"
import type {
  DetectionPriority,
  SwingAnalysisResult,
  SwingAnalysisType,
  SwingDetection,
} from "../types/swing-analysis"

const ANALYSIS_TYPES: SwingAnalysisType[] = [
  "general",
  "serve",
  "drive",
  "dink",
  "volley",
]

const PRIORITY_ORDER: Record<DetectionPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const KNOWN_LABELS = new Set([
  "contact_point",
  "follow_through",
  "stance",
  "paddle_angle",
])

function useCoachSwingTranslation() {
  const { t: baseT } = useTranslation("common")
  return (key: string, options?: Record<string, unknown>) =>
    baseT(
      key.replace("coach.swingAnalysis", "coach.discovery.swingAnalysis"),
      options
    )
}

type SwingTranslator = ReturnType<typeof useCoachSwingTranslation>

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function clampConfidence(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.round(Math.min(1, Math.max(0, value)) * 100)
    : null
}

function readableLabel(label: string, t: SwingTranslator) {
  const key = label.trim().toLowerCase()
  if (KNOWN_LABELS.has(key)) {
    return t(`coach.swingAnalysis.labels.${key}`, { defaultValue: key })
  }
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function priorityVariant(priority: DetectionPriority) {
  return priority === "high"
    ? "destructive"
    : priority === "medium"
      ? "default"
      : "secondary"
}

function priorityText(priority: DetectionPriority, t: SwingTranslator) {
  return t(`coach.swingAnalysis.priority.${priority}`, {
    defaultValue: priority,
  })
}

function SwingMediaPreview({
  file,
  previewUrl,
  onRemove,
  onChoose,
  disabled,
}: {
  file: File
  previewUrl: string
  onRemove: () => void
  onChoose: () => void
  disabled: boolean
}) {
  const t = useCoachSwingTranslation()
  const isVideo = file.type.startsWith("video/")

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border bg-muted/30">
        {isVideo ? (
          <video
            controls
            src={previewUrl}
            className="max-h-72 w-full object-contain"
          />
        ) : (
          <img
            src={previewUrl}
            alt={t("coach.swingAnalysis.previewAlt")}
            className="max-h-72 w-full object-contain"
          />
        )}
      </div>
      <div className="flex items-start gap-3">
        {isVideo ? (
          <FileVideo className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        ) : (
          <ImagePlus className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {file.type || t("coach.swingAnalysis.unknownFileType")} ·{" "}
            {formatBytes(file.size)}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onChoose}
            disabled={disabled}
          >
            {t("coach.swingAnalysis.changeFile")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={disabled}
            aria-label={t("coach.swingAnalysis.removeFile")}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function SwingDetectionCard({ detection }: { detection: SwingDetection }) {
  const t = useCoachSwingTranslation()
  const confidence = clampConfidence(detection.confidence)
  const priority: DetectionPriority = ["high", "medium", "low"].includes(
    detection.details?.priority
  )
    ? detection.details.priority
    : "medium"
  const details = detection.details ?? {
    observation: "",
    correction: "",
    drill: "",
    priority: "medium" as const,
    visibilityNote: "",
  }
  const rows = [
    ["observation", details.observation, t("coach.swingAnalysis.observation")],
    ["correction", details.correction, t("coach.swingAnalysis.correction")],
    ["drill", details.drill, t("coach.swingAnalysis.drill")],
  ] as const

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="gap-3 px-5 pb-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-base">
            {readableLabel(
              detection.label || t("coach.swingAnalysis.unknownFinding"),
              t
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                priorityVariant(priority) as
                  | "default"
                  | "secondary"
                  | "destructive"
              }
            >
              {priorityText(priority, t)}
            </Badge>
            {confidence !== null ? (
              <Badge variant="outline">
                {confidence}% {t("coach.swingAnalysis.confidence")}
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-5">
        {rows.map(([key, value, label]) =>
          value ? (
            <div key={key} className="space-y-1">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {label}
              </p>
              <p className="text-sm leading-6">{value}</p>
            </div>
          ) : null
        )}
        {details.visibilityNote ? (
          <div className="flex gap-2 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{details.visibilityNote}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function SwingAnalysisResultView({ result }: { result: SwingAnalysisResult }) {
  const t = useCoachSwingTranslation()
  const overallConfidence = clampConfidence(result.confidence)
  const detections = Array.isArray(result.detections)
    ? [...result.detections].sort(
        (a, b) =>
          (PRIORITY_ORDER[a.details?.priority] ?? 1) -
          (PRIORITY_ORDER[b.details?.priority] ?? 1)
      )
    : []

  return (
    <div className="space-y-5">
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardHeader className="gap-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="size-5 text-primary" />
              {t("coach.swingAnalysis.overallAssessment")}
            </CardTitle>
            {overallConfidence !== null ? (
              <Badge variant="outline" className="text-sm">
                {overallConfidence}%
              </Badge>
            ) : null}
          </div>
          <CardDescription>
            {t("coach.swingAnalysis.aiSummary")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.description ? (
            <p className="text-sm leading-7">{result.description}</p>
          ) : null}
          {overallConfidence !== null ? (
            <Progress value={overallConfidence} />
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{t("coach.swingAnalysis.findings")}</h3>
        <span className="text-sm text-muted-foreground">
          {t("coach.swingAnalysis.findingCount", { count: detections.length })}
        </span>
      </div>
      {detections.length ? (
        <div className="space-y-4">
          {detections.map((detection, index) => (
            <SwingDetectionCard
              key={`${detection.label || "finding"}-${index}`}
              detection={detection}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t("coach.swingAnalysis.noFindings")}
        </div>
      )}
    </div>
  )
}

export function CoachSwingAnalysisPanel() {
  const t = useCoachSwingTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analysisType, setAnalysisType] = useState<SwingAnalysisType>("general")
  const [prompt, setPrompt] = useState("")
  const [result, setResult] = useState<SwingAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stage, setStage] = useState<
    "idle" | "uploading" | "analyzing" | "done" | "error"
  >("idle")
  const uploadMutation = useUploadSwingMedia()
  const analysisMutation = useAnalyzeSwing()
  const language = getStoredLanguage()

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const chooseFile = () => inputRef.current?.click()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    event.target.value = ""
    if (!selected) return
    if (
      !selected.type.startsWith("image/") &&
      !selected.type.startsWith("video/")
    ) {
      setError(t("coach.swingAnalysis.invalidFile"))
      toast.error(t("coach.swingAnalysis.invalidFile"))
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    setResult(null)
    setError(null)
    setStage("idle")
    uploadMutation.reset()
    analysisMutation.reset()
  }

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    setStage("idle")
    uploadMutation.reset()
    analysisMutation.reset()
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError(t("coach.swingAnalysis.fileRequired"))
      return
    }
    if (prompt.length > 1000) {
      setError(t("coach.swingAnalysis.promptTooLong"))
      return
    }

    setError(null)
    setResult(null)
    try {
      setStage("uploading")
      const imageUrl = await uploadMutation.mutateAsync(file)
      setStage("analyzing")
      const analysis = await analysisMutation.mutateAsync({
        imageUrl,
        analysisType,
        ...(prompt.trim() ? { prompt: prompt.trim() } : {}),
        language,
      })
      setResult(analysis)
      setStage("done")
      toast.success(t("coach.swingAnalysis.completed"))
    } catch (caughtError) {
      setStage("error")
      const status =
        caughtError instanceof SwingAnalysisError
          ? caughtError.status
          : undefined
      const message =
        status === 400
          ? t("coach.swingAnalysis.invalidInput")
          : status === 401
            ? t("coach.swingAnalysis.unauthorized")
            : status === 504
              ? t("coach.swingAnalysis.timeout")
              : caughtError instanceof Error &&
                  caughtError.message !== "Network error"
                ? caughtError.message
                : t("coach.swingAnalysis.genericError")
      setError(message)
      toast.error(message)
    }
  }

  const busy = stage === "uploading" || stage === "analyzing"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("coach.swingAnalysis.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("coach.swingAnalysis.description")}
        </p>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{t("coach.swingAnalysis.inputTitle")}</CardTitle>
            <CardDescription>
              {t("coach.swingAnalysis.inputDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>{t("coach.swingAnalysis.mediaLabel")}</Label>
              {file && previewUrl ? (
                <SwingMediaPreview
                  file={file}
                  previewUrl={previewUrl}
                  onRemove={removeFile}
                  onChoose={chooseFile}
                  disabled={busy}
                />
              ) : (
                <button
                  type="button"
                  onClick={chooseFile}
                  className="flex min-h-44 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/40"
                >
                  <Upload className="size-6" />
                  <span className="font-medium text-foreground">
                    {t("coach.swingAnalysis.chooseFile")}
                  </span>
                  <span>{t("coach.swingAnalysis.fileHint")}</span>
                </button>
              )}
              <Input
                ref={inputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={busy}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="swing-analysis-type">
                {t("coach.swingAnalysis.typeLabel")}
              </Label>
              <Select
                value={analysisType}
                onValueChange={(value) =>
                  setAnalysisType(value as SwingAnalysisType)
                }
                disabled={busy}
              >
                <SelectTrigger id="swing-analysis-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANALYSIS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`coach.swingAnalysis.types.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="swing-analysis-prompt">
                  {t("coach.swingAnalysis.promptLabel")}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {prompt.length}/1000
                </span>
              </div>
              <Textarea
                id="swing-analysis-prompt"
                value={prompt}
                maxLength={1000}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={t("coach.swingAnalysis.promptPlaceholder")}
                disabled={busy}
              />
            </div>

            {stage === "uploading" || stage === "analyzing" ? (
              <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-3 text-sm">
                <Loader2 className="size-4 animate-spin" />
                {stage === "uploading"
                  ? t("coach.swingAnalysis.uploading")
                  : t("coach.swingAnalysis.analyzing")}
              </div>
            ) : null}
            {error ? (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>{t("coach.swingAnalysis.errorTitle")}</AlertTitle>
                <AlertDescription>
                  <p>{error}</p>
                  {error === t("coach.swingAnalysis.timeout") ||
                  stage === "error" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={handleAnalyze}
                      disabled={busy || !file}
                    >
                      <RefreshCw className="size-4" />
                      {t("coach.swingAnalysis.retry")}
                    </Button>
                  ) : null}
                </AlertDescription>
              </Alert>
            ) : null}

            <Button
              type="button"
              className="w-full"
              onClick={handleAnalyze}
              disabled={busy || !file}
            >
              {busy ? <Loader2 className="animate-spin" /> : <Target />}
              {busy
                ? t("coach.swingAnalysis.processing")
                : t("coach.swingAnalysis.analyzeButton")}
            </Button>
          </CardContent>
        </Card>

        <div className="min-w-0">
          {result ? (
            <SwingAnalysisResultView result={result} />
          ) : (
            <Card className="h-full min-h-72 items-center justify-center text-center">
              <CardContent className="max-w-sm space-y-3">
                {stage === "done" ? (
                  <CheckCircle2 className="mx-auto size-10 text-primary" />
                ) : (
                  <Sparkles className="mx-auto size-10 text-muted-foreground/50" />
                )}
                <p className="font-medium">
                  {t("coach.swingAnalysis.emptyTitle")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("coach.swingAnalysis.emptyDescription")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
