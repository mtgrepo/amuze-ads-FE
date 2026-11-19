import { format } from "date-fns";
import type { ActivityLog } from "../dto/response/activity/activityResponse";
import { parseLocalDate } from "../components/Dashboard/admin/dashboard_utils";
import { statusLabel } from "./status";

/** Shared formatting for activity log rows (ad history, advertiser activity, the Activity log page). */

const EMPTY = "—";

/** Shown where a history list has no rows; nothing was recorded before the log existed. */
export const ACTIVITY_EMPTY = "No history yet. Actions are recorded from now on.";

const toDate = (value: string) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? parseLocalDate(value) : new Date(value));

/** "3 Nov 2026, 14:20" in local time. */
export const activityWhen = (iso: string) => format(new Date(iso), "d MMM yyyy, HH:mm");

/** "3 Nov" for either a date ("2026-11-03") or a timestamp. */
export const shortDate = (value: string) => format(toDate(value), "d MMM");

/** Who acted: their name at the time, or "System" for automatic actions. */
export function activityWho(log: ActivityLog): string {
    if (log.actorType === "system") return "System";
    return log.actorName || (log.actorType === "admin" ? "Admin" : "Advertiser");
}

/** "by Min Khant", or "System" on its own. */
export const activityBy = (log: ActivityLog) => (log.actorType === "system" ? "System" : `by ${activityWho(log)}`);

const isEmpty = (v: unknown) => v === null || v === undefined || v === "";
const num = (v: unknown) => Number(v).toLocaleString("en-US");
const pts = (v: unknown) => `${num(v)} pts`;
const day = (v: unknown) => format(toDate(String(v).slice(0, 10)), "d MMM yyyy");
const GENDER: Record<string, string> = { male: "Men", female: "Women", all: "Everyone" };

function shortJson(v: unknown): string {
    const text = typeof v === "string" ? v : JSON.stringify(v);
    return text.length > 60 ? `${text.slice(0, 57)}…` : text;
}

type Field = { label: string; show?: (v: unknown) => string };

const FIELDS: Record<string, Field> = {
    name: { label: "Name" },
    packageName: { label: "Package" },
    packageQuantity: { label: "Quantity", show: num },
    startDate: { label: "Starts", show: day },
    endDate: { label: "Ends", show: day },
    planCost: { label: "Package cost", show: pts },
    objectiveCost: { label: "Objectives cost", show: pts },
    totalBudget: { label: "Total", show: pts },
    click: { label: "Clicks target", show: num },
    impression: { label: "Impressions target", show: num },
    watch: { label: "Watches target", show: num },
    ageMin: { label: "Age from" },
    ageMax: { label: "Age to" },
    gender: { label: "Audience", show: (v) => GENDER[String(v)] ?? String(v) },
    status: { label: "Status", show: (v) => statusLabel(String(v)) },
    email: { label: "Email" },
    phone: { label: "Phone" },
    verified: { label: "Verified", show: (v) => (v === true || v === "true" ? "Yes" : "No") },
    durationDays: { label: "Days", show: num },
    price: { label: "Price", show: pts },
    description: { label: "Description" },
    sortOrder: { label: "List order" },
    configValue: { label: "Value", show: shortJson },
    category: { label: "Category" },
    configKey: { label: "Key" },
    enabled: { label: "Shown", show: (v) => (v === true || v === "true" ? "On" : "Off") },
    everyMin: { label: "Every (from)", show: num },
    everyMax: { label: "Every (to)", show: num },
    cooldownMinutes: { label: "Wait after closing", show: (v) => `${num(v)} min` },
    videoPosition: { label: "Where in the video", show: (v) => ({ start: "Start", middle: "Middle", either: "Start or middle" }[String(v)] ?? String(v)) },
    modules: { label: "Modules", show: (v) => (Array.isArray(v) ? (v.length ? v.join(", ") : "none") : String(v)) },
};

/** "packageQuantity" / "package_quantity" → "Package quantity". */
function humanise(key: string): string {
    const words = key.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
}

function showValue(key: string, v: unknown): string {
    if (isEmpty(v)) return EMPTY;
    const show = FIELDS[key]?.show;
    if (show) return show(v);
    return typeof v === "object" ? shortJson(v) : String(v);
}

/** One line per changed field: "Package cost: 1,000 pts → 1,500 pts". */
export function activityChanges(log: ActivityLog): string[] {
    return Object.entries(log.changes ?? {}).map(([key, c]) =>
        `${FIELDS[key]?.label ?? humanise(key)}: ${showValue(key, c?.from)} → ${showValue(key, c?.to)}`);
}

/** Extra facts from meta (refunds, points, new end date). The reason is separate: see activityReason. */
export function activityNotes(log: ActivityLog): string[] {
    const m = log.meta ?? {};
    const notes: string[] = [];
    if (!isEmpty(m.refundedPoints)) notes.push(`Refunded ${pts(m.refundedPoints)}`);
    if (!isEmpty(m.points)) notes.push(pts(m.points));
    if (m.passwordChanged) notes.push("Password changed");
    if (!isEmpty(m.newEndDate)) notes.push(`Ends ${day(m.newEndDate)}`);
    return notes;
}

/** The reason given (rejections), or null. */
export function activityReason(log: ActivityLog): string | null {
    const reason = log.meta?.reason;
    return isEmpty(reason) ? null : String(reason);
}

/** Changes and notes together, for one text cell (Excel). */
export const activityDetailText = (log: ActivityLog) => [...activityChanges(log), ...activityNotes(log)].join("; ");

const GOOD = ["approved", "activated", "verified", "reactivated", "added", "purchased"];
const BAD = ["rejected", "deleted", "deactivated"];
const WAITING = ["requested", "paid"];

/** Dot colour: green for good news, red for removals and rejections, amber for waiting, grey for automatic, indigo otherwise. */
export function activityDot(log: ActivityLog): string {
    const verb = log.action.split(".").pop() ?? "";
    if (GOOD.includes(verb)) return "bg-success";
    if (BAD.includes(verb)) return "bg-destructive";
    if (WAITING.includes(verb)) return "bg-warning";
    if (verb === "expired" || log.actorType === "system") return "bg-muted-foreground/50";
    return "bg-primary";
}

/** Type filters for the Activity log page; value is the entityType list sent to the API. */
export const ACTIVITY_TYPES: { key: string; label: string; value?: string }[] = [
    { key: "all", label: "All" },
    { key: "ads", label: "Ads", value: "campaign,ad,ad_set,extension" },
    { key: "advertisers", label: "Advertisers", value: "advertiser" },
    { key: "points", label: "Points", value: "points" },
    { key: "packages", label: "Packages", value: "package" },
    { key: "settings", label: "Settings", value: "system_config,ad_display_rule" },
];
