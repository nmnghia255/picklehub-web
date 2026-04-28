"use client"

import { Upload } from "lucide-react"
import { useMemo, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  sampleVideoUrl,
  videoNotes,
  videoTags,
} from "@/features/coach/data/mockVideos"

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function CoachVideoAnalysis() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>(["Forehand"])

  const notes = useMemo(
    () =>
      videoNotes.map((item) => ({
        ...item,
        label: formatTime(item.timestamp),
      })),
    []
  )

  const seekTo = (seconds: number) => {
    if (!videoRef.current) return

    videoRef.current.currentTime = seconds
    void videoRef.current.play()
  }

  const handleUpload = (file?: File) => {
    if (!file) return

    setPreviewUrl(URL.createObjectURL(file))
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Upload video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition-colors hover:bg-muted/30">
            <Upload className="size-6 text-muted-foreground" />
            <span className="mt-2 font-medium">Drag & drop hoặc chọn file</span>
            <span className="text-sm text-muted-foreground">
              Hỗ trợ preview mock ngay sau khi tải lên
            </span>
            <Input
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(event) => handleUpload(event.target.files?.[0])}
            />
          </label>

          <div className="aspect-video overflow-hidden rounded-2xl border bg-black">
            <video
              ref={videoRef}
              controls
              className="h-full w-full"
              src={previewUrl ?? sampleVideoUrl}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {videoTags.map((tag) => (
              <Button
                key={tag}
                type="button"
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="rounded-full"
                onClick={() =>
                  setSelectedTags((prev) =>
                    prev.includes(tag)
                      ? prev.filter((item) => item !== tag)
                      : [...prev, tag]
                  )
                }
              >
                {tag}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Ghi chú theo timestamp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notes.map((note) => (
            <button
              key={note.id}
              type="button"
              className="w-full rounded-2xl border p-4 text-left transition-colors hover:bg-muted/30"
              onClick={() => seekTo(note.timestamp)}
            >
              <div className="flex items-center justify-between gap-3">
                <Badge variant="secondary" className="rounded-full">
                  {note.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Click để jump
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{note.note}</p>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
