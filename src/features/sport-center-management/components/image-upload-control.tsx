"use client"

import { ImagePlus, Loader2, RefreshCw, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MediaService } from "@/features/sport-center/api/media-service"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

type UploadItem = {
  id: string
  file: File
  previewUrl: string
  status: "uploading" | "error"
  error?: string
}

type ImageUploadControlProps = {
  value: string[] | string
  onChange: (value: string[] | string) => void
  multiple?: boolean
  maxFiles?: number
  label: string
  accept?: string
  onUploadingChange?: (uploading: boolean) => void
}

function createItemId(file: File) {
  return `${file.name}-${file.lastModified}-${file.size}`
}

export function ImageUploadControl({
  value,
  onChange,
  multiple = false,
  maxFiles,
  label,
  accept = "image/png,image/jpeg,image/jpg,image/webp",
  onUploadingChange,
}: ImageUploadControlProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const itemsRef = useRef<UploadItem[]>([])
  const urlsRef = useRef<string[]>([])
  const [items, setItems] = useState<UploadItem[]>([])
  const urls = Array.isArray(value) ? value : value ? [value] : []

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    urlsRef.current = Array.isArray(value) ? value : value ? [value] : []
  }, [value])

  useEffect(() => {
    onUploadingChange?.(items.some((item) => item.status === "uploading"))
  }, [items, onUploadingChange])

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) URL.revokeObjectURL(item.previewUrl)
    }
  }, [])

  const updateUrls = (nextUrls: string[]) => {
    onChange(multiple ? nextUrls : (nextUrls[0] ?? ""))
  }

  const uploadItem = async (item: UploadItem) => {
    setItems((current) => {
      if (!current.some((candidate) => candidate.id === item.id)) {
        return [...current, { ...item, status: "uploading", error: undefined }]
      }
      return current.map((candidate) =>
        candidate.id === item.id
          ? { ...candidate, status: "uploading", error: undefined }
          : candidate
      )
    })

    try {
      const url = await MediaService.uploadImage(item.file)
      const nextUrls = multiple
        ? [...urlsRef.current.filter((candidate) => candidate !== url), url]
        : [url]
      urlsRef.current = nextUrls
      updateUrls(nextUrls)
      setItems((current) => {
        const completed = current.find((candidate) => candidate.id === item.id)
        if (completed) URL.revokeObjectURL(completed.previewUrl)
        return current.filter((candidate) => candidate.id !== item.id)
      })
    } catch {
      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id
            ? { ...candidate, status: "error", error: "Upload failed" }
            : candidate
        )
      )
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    if (files.length === 0) return

    const currentCount = urls.length + items.length
    const acceptedFiles =
      multiple && maxFiles
        ? files.slice(0, Math.max(0, maxFiles - currentCount))
        : multiple
          ? files
          : files.slice(0, 1)

    if (multiple && maxFiles && files.length > acceptedFiles.length) {
      toast.error(`Maximum ${maxFiles} images allowed.`)
    }

    for (const file of acceptedFiles) {
      const id = createItemId(file)
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name}: unsupported image format.`)
        continue
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name}: image must be 5 MB or smaller.`)
        continue
      }

      const item: UploadItem = {
        id,
        file,
        previewUrl: URL.createObjectURL(file),
        status: "uploading",
      }
      setItems((current) => [...current, item])
      void uploadItem(item)
    }
  }

  const removeUrl = (url: string) => {
    updateUrls(urls.filter((candidate) => candidate !== url))
  }

  const removeItem = (id: string) => {
    setItems((current) => {
      const item = current.find((candidate) => candidate.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return current.filter((candidate) => candidate.id !== id)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {urls.map((url) => (
          <div className="relative" key={url}>
            <img
              src={url}
              alt={label}
              className="size-28 rounded-xl border object-cover"
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute -top-2 -right-2 rounded-full"
              onClick={() => removeUrl(url)}
              aria-label={`Remove ${label}`}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
        {items.map((item) => (
          <div className="relative" key={item.id}>
            <img
              src={item.previewUrl}
              alt={label}
              className="size-28 rounded-xl border object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/70">
              {item.status === "uploading" ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  onClick={() => void uploadItem(item)}
                >
                  <RefreshCw className="size-4" />
                </Button>
              )}
            </div>
            {item.status === "error" ? (
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 rounded-full"
                onClick={() => removeItem(item.id)}
                aria-label="Remove failed upload"
              >
                <X className="size-4" />
              </Button>
            ) : null}
          </div>
        ))}
        <label className="flex size-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-xs text-muted-foreground hover:bg-muted/40">
          <ImagePlus className="size-5" />
          <span>{label}</span>
          <Input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={handleFileChange}
            disabled={items.some((item) => item.status === "uploading")}
          />
        </label>
      </div>
    </div>
  )
}
