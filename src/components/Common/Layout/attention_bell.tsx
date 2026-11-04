import { useState } from "react"
import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useAttentionQuery } from "../../../Composable/Query/dashboard/useAttentionQuery"
import { endsInLabel } from "../../Dashboard/admin/dashboard_utils"

const SEEN_KEY = "amuze-ads-seen-alerts"

function readSeen(): string[] {
    try { return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]") } catch { return [] }
}

interface Row {
    key: string
    title: string
    when: string
    to: string
}

/**
 * The top-bar bell. Admins are alerted to what needs them (ads to review, extension requests, campaigns
 * ending soon); "Mark all read" is remembered in this browser, and the badge counts only new items.
 */
export function AttentionBell() {
    const [open, setOpen] = useState(false)
    const [seen, setSeen] = useState<string[]>(readSeen)
    const { attention } = useAttentionQuery()

    const rows: Row[] = attention ? [
        ...attention.pending.map((p) => ({
            key: "p:" + p.adId, title: `${p.campaignName} is waiting for review`,
            when: formatDistanceToNow(new Date(p.waitingSince), { addSuffix: true }), to: `/ads/${p.adId}`,
        })),
        ...attention.pendingExtensions.map((e) => ({
            key: "e:" + e.extensionId, title: `Extension request: ${e.campaignName}`,
            when: formatDistanceToNow(new Date(e.waitingSince), { addSuffix: true }), to: `/ads/${e.adId}`,
        })),
        ...attention.endingSoon.map((c) => ({
            key: `s:${c.campaignId}:${c.endDate}`, title: `${c.campaignName} ends ${endsInLabel(c.endDate).toLowerCase().replace(/^(\d)/, "in $1")}`,
            when: c.advertiserName, to: `/ads/${c.adId}`,
        })),
    ] : []
    const unread = rows.filter((r) => !seen.includes(r.key))

    const markAllRead = () => {
        const next = rows.map((r) => r.key)
        try { localStorage.setItem(SEEN_KEY, JSON.stringify(next)) } catch { /* not remembered, still cleared for now */ }
        setSeen(next)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label={unread.length ? `Notifications, ${unread.length} unread` : "Notifications"}>
                    <Bell className="size-[18px]" />
                    {unread.length > 0 && (
                        <span className="absolute right-0 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-background bg-destructive px-1 font-mono text-[10px] font-semibold text-white">
                            {unread.length}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={8} className="w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-[14px] p-0">
                <div className="flex items-center justify-between gap-2.5 border-b px-4 py-3.5">
                    <span className="font-semibold">Notifications</span>
                    <button type="button" onClick={markAllRead} className="text-[13px] font-medium text-primary hover:underline">Mark all read</button>
                </div>
                {rows.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">You're all caught up</div>
                ) : rows.slice(0, 4).map((r) => {
                    const isUnread = !seen.includes(r.key)
                    return (
                        <Link key={r.key} to={r.to} onClick={() => setOpen(false)} className="flex gap-3 border-b px-4 py-3 text-foreground hover:bg-muted/60">
                            <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", isUnread ? "bg-primary" : "bg-transparent")} aria-hidden="true" />
                            <span className="flex min-w-0 flex-col gap-[3px]">
                                <span className={cn("text-sm leading-snug", isUnread && "font-semibold")}>{r.title}</span>
                                <span className="text-xs text-muted-foreground">{r.when}</span>
                            </span>
                        </Link>
                    )
                })}
                <Link to="/notifications" onClick={() => setOpen(false)} className="block bg-muted/50 px-4 py-3 text-center text-[13px] font-medium text-primary hover:underline">
                    See all notifications
                </Link>
            </PopoverContent>
        </Popover>
    )
}
