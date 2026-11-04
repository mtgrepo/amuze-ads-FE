import { X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
    value?: File | string | null
    onChange: (file: File | null) => void
    label?: string
    accept?: string
    size?: "small" | "large"
    /** Shown under "Drop a file here", e.g. "Banner 1200 × 628 · JPG, PNG or MP4 up to 20 MB". */
    hint?: string
}

const isVideo = (value: File | string) =>
  typeof value === "string" ? /\.(mp4|webm|mov|m4v)(\?|$)/i.test(value) : value.type.startsWith("video/")

/** A dashed drop zone; once a file is chosen it shows the image or video with a button to remove it. */
export default function ImageUpload({
  value,
  onChange,
  label,
  accept = "image/*",
  size = "small",
  hint,
}: ImageUploadProps) {
  const [dragging, setDragging] = useState(false)
  const preview = useMemo(() => (!value ? null : typeof value === "string" ? value : URL.createObjectURL(value)), [value])

  // Free the object URL made for a picked file once it's replaced or removed.
  useEffect(() => () => {
    if (preview && value instanceof File) URL.revokeObjectURL(preview)
  }, [preview, value])

  const pick = (file?: File | null) => { if (file) onChange(file) }

  const sizeClasses = size === "large" ? "h-40 w-40" : "h-[170px] w-full"

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium">{label}</span>}

      {preview && value ? (
        <div className={cn("relative", sizeClasses)}>
          {isVideo(value)
            ? <video src={preview} controls muted className="h-full w-full rounded-[14px] border bg-black object-contain" />
            : <img src={preview} alt={label ?? "Uploaded file"} className="h-full w-full rounded-[14px] border object-cover" />}
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove file"
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1.5 text-white"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0]) }}
          className={cn(
            sizeClasses,
            "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-input bg-muted/40 p-4 text-center transition-colors hover:bg-muted/70",
            dragging && "border-primary bg-primary/5"
          )}
        >
          <span className="font-medium">Drop a file here, or choose one</span>
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
          <span className="mt-1.5 inline-flex h-8 items-center rounded-[9px] border bg-card px-3.5 text-sm font-medium">Choose file</span>
          <input type="file" className="sr-only" accept={accept} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = "" }} />
        </label>
      )}
    </div>
  )
}
