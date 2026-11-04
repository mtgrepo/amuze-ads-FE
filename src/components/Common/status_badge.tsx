import { cn } from "@/lib/utils"
import { statusLabel } from "../../lib/status"

const TONE: Record<string, string> = {
    active: "bg-success-soft text-success-soft-foreground",
    pending: "bg-warning-soft text-warning-soft-foreground",
    paused: "bg-warning-soft text-warning-soft-foreground",
    rejected: "bg-destructive-soft text-destructive-soft-foreground",
    draft: "bg-muted text-muted-foreground",
    expired: "bg-muted text-muted-foreground",
}

/** A campaign or ad status as a coloured pill: green live, amber waiting, red rejected, grey otherwise. */
export function StatusBadge({ status, className }: { status: string; className?: string }) {
    return (
        <span className={cn("inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-medium", TONE[status] ?? "bg-muted text-muted-foreground", className)}>
            {status === "active" ? "Live" : statusLabel(status)}
        </span>
    )
}
