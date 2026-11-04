import type { NotificationsResponse } from "../../dto/response/notifications/notificationsResponse";

export type Kind = "campaign" | "extension" | "points" | "account" | "general";

/** Notifications carry no type, so it's read from the title the backend writes. */
export function kindOf(n: Pick<NotificationsResponse, "title">): Kind {
    const t = n.title.toLowerCase();
    if (/extension|extended/.test(t)) return "extension";
    if (/payment|points?|top.?up/.test(t)) return "points";
    if (/campaign/.test(t)) return "campaign";
    if (/account/.test(t)) return "account";
    return "general";
}

export const KINDS: Record<Kind, { label: string; className: string }> = {
    campaign: { label: "Campaign", className: "bg-warning-soft text-warning-soft-foreground" },
    extension: { label: "Extension", className: "bg-primary/10 text-primary" },
    points: { label: "Points", className: "bg-success-soft text-success-soft-foreground" },
    account: { label: "Account", className: "bg-info-soft text-info-soft-foreground" },
    general: { label: "General", className: "bg-muted text-foreground/80" },
};

/** "10 min ago", "3 hours ago", then "Sun, 1 Nov" once it's older than a day. */
export function relativeTime(iso: string, now: number): string {
    const then = new Date(iso).getTime();
    const mins = Math.floor((now - then) / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export const fullDate = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
