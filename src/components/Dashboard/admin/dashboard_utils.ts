export type RangePreset = "today" | "7d" | "30d" | "custom";

export interface DateRange {
    from: string;
    to: string;
}

export function toLocalDateString(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

/** Parses YYYY-MM-DD as a local date (new Date("2026-10-01") would be UTC midnight). */
export function parseLocalDate(value: string): Date {
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
}

export function presetRange(preset: Exclude<RangePreset, "custom">): DateRange {
    const to = new Date();
    const from = new Date();
    if (preset === "7d") from.setDate(from.getDate() - 6);
    if (preset === "30d") from.setDate(from.getDate() - 29);
    return { from: toLocalDateString(from), to: toLocalDateString(to) };
}

export function daysInRange(range: DateRange): number {
    const ms = parseLocalDate(range.to).getTime() - parseLocalDate(range.from).getTime();
    return Math.round(ms / 86_400_000) + 1;
}

/** The same number of days immediately before the range, for "vs prior period". */
export function priorRange(range: DateRange): DateRange {
    const days = daysInRange(range);
    const to = parseLocalDate(range.from);
    to.setDate(to.getDate() - 1);
    const from = new Date(to);
    from.setDate(from.getDate() - (days - 1));
    return { from: toLocalDateString(from), to: toLocalDateString(to) };
}

/** Every date in the range, so days without stats still show as zero. */
export function eachDay(range: DateRange): string[] {
    const days: string[] = [];
    const cursor = parseLocalDate(range.from);
    const end = parseLocalDate(range.to);
    while (cursor <= end) {
        days.push(toLocalDateString(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }
    return days;
}

export function compactNumber(n: number): string {
    // Number() drops trailing zeros: 2.00 → 2, 1.50 → 1.5.
    if (n >= 1_000_000) return `${Number((n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2))}M`;
    if (n >= 10_000) return `${Math.round(n / 1_000)}k`;
    return n.toLocaleString();
}

export function percentChange(current: number, previous: number): number | null {
    if (!previous) return null;
    return Math.round(((current - previous) / previous) * 100);
}

export function placementLabel(key: string): string {
    const label = key.replace(/_/g, " ");
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export function daysUntil(dateString: string): number {
    const today = parseLocalDate(toLocalDateString(new Date()));
    return Math.round((parseLocalDate(dateString).getTime() - today.getTime()) / 86_400_000);
}

export function endsInLabel(dateString: string): string {
    const days = daysUntil(dateString);
    if (days < 0) return "Ended";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `${days} days`;
}

export function waitingLabel(timestamp: string): string {
    const hours = Math.floor((Date.now() - new Date(timestamp).getTime()) / 3_600_000);
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "1 day" : `${days} days`;
}
