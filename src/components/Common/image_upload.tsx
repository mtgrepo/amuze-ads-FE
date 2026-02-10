import { Upload, X } from "lucide-react"
import { useEffect, useState } from "react"

interface ImageUploadProps {
    value?: File | string | null
    onChange: (file: File | null) => void
    label?: string
    accept?: string
    size?: "small" | "large"
}

export default function ImageUpload({
  value,
  onChange,
  label,
  accept = "image/*",
  size = "small",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!value) return setPreview(null)

    if (typeof value === "string") {
      setPreview(value)
    } else {
      setPreview(URL.createObjectURL(value))
    }
  }, [value])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onChange(file)
  }

  const handleRemove = () => onChange(null)

  const sizeClasses = size === "large" ? "h-40 w-40" : "h-54 w-full"

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>

      {preview ? (
        <div className={`relative ${sizeClasses}`}>
          <img
            src={preview}
            alt={label}
            className="h-full w-full rounded-lg object-cover border border-border"
          />

          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label
          className={`${sizeClasses} cursor-pointer flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:bg-accent transition`}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="mt-2 text-xs text-muted-foreground">Click to upload</span>

          <input type="file" hidden accept={accept} onChange={handleFileChange} />
        </label>
      )}
    </div>
  )
}

