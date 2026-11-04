import { useState } from "react"
import { Link } from "react-router-dom"
import { Bell, CircleCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useAttentionQuery } from "../../../Composable/Query/dashboard/useAttentionQuery"
import { endsInLabel, waitingLabel } from "../../Dashboard/admin/dashboard_utils"

interface Row {
    key: string
    title: string
    detail: string
    to: string
    /** Needs a decision (review or approve), not just a heads-up. */
    action: boolean
}

/**
 * What needs an admin right now: ads to review and extension requests (counted on the badge),
 * plus campaigns ending soon. Advertisers' own notifications live on the Notifications page.
 */
export function AttentionBell() {
    const [open, setOpen] = useState(false)
    const { attention } = useAttentionQuery()
    const count = (attention?.pendingCount ?? 0) + (attention?.pendingExtensionCount ?? 0)

    const rows: Row[] = attention ? [
        ...attention.pending.map((p) => ({
            key: "p" + p.adId, title: `${p.campaignName} is waiting for review`,
            detail: `${p.advertiserName} · waiting ${waitingLabel(p.waitingSince)}`, to: `/ads/${p.adId}`, action: true,
        })),
        ...attention.pendingExtensions.map((e) => ({
            key: "e" + e.extensionId, title: `Extension request: ${e.campaignName}`,
            detail: `${e.advertiserName} · ${e.days} ${e.days === 1 ? "day" : "days"} · ${e.amount.toLocaleString()} pts`, to: `/ads/${e.adId}`, action: true,
        })),
        ...attention.endingSoon.map((c) => ({
            key: "s" + c.campaignId, title: `${c.campaignName} ends ${endsInLabel(c.endDate).toLowerCase().replace(/^(\d)/, "in $1")}`,
            detail: c.advertiserName, to: `/ads/${c.adId}`, action: false,
        })),
    ].slice(0, 5) : []

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label={count ? `Needs you: ${count} items` : "Needs you"}>
                    <Bell className="size-[18px]" />
                    {count > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-background bg-destructive px-1 font-mono text-[10px] font-semibold text-white">
                            {count}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={8} className="w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-xl p-0">
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                    <span className="font-semibold">Needs you</span>
                    {count > 0 && <span className="text-xs text-muted-foreground">{count} to act on</span>}
                </div>
                {rows.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
                        <CircleCheck className="size-5 text-success" />
                        <span className="text-sm">You're all caught up</span>
                    </div>
                ) : rows.map((r) => (
                    <Link key={r.key} to={r.to} onClick={() => setOpen(false)} className="flex gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-muted/60">
                        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", r.action ? "bg-primary" : "bg-transparent")} />
                        <span className="flex min-w-0 flex-col gap-0.5">
                            <span className={cn("text-sm leading-snug", r.action && "font-semibold")}>{r.title}</span>
                            <span className="truncate text-xs text-muted-foreground">{r.detail}</span>
                        </span>
                    </Link>
                ))}
                <div className="grid grid-cols-2 border-t bg-muted/40 text-center text-[13px] font-medium">
                    <Link to="/" onClick={() => setOpen(false)} className="px-4 py-3 text-primary hover:underline">Open dashboard</Link>
                    <Link to="/notifications" onClick={() => setOpen(false)} className="border-l px-4 py-3 text-primary hover:underline">All notifications</Link>
                </div>
            </PopoverContent>
        </Popover>
    )
}
