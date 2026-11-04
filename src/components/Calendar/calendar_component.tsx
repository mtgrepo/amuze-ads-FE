import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDays, addMonths, differenceInCalendarDays, endOfMonth, format, getDaysInMonth, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAdListQuery } from "../../Composable/Query/content/useAdListQuery";
import type { AdResponse } from "../../dto/response/content/adResponse";
import { runsOn, sameDay, shortName, toCampaigns, type CalendarCampaign } from "./calendar_events";

type View = "month" | "timeline";

const VIEWS: { key: View; label: string }[] = [
    { key: "month", label: "Month" },
    { key: "timeline", label: "Timeline" },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SEG = "h-[30px] rounded-[7px] px-3 text-[13px] font-medium text-foreground/80 transition-colors hover:text-foreground";
const SEG_ON = "bg-card text-foreground shadow-[0_1px_2px_rgba(24,24,27,.08)] ring-1 ring-border";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function CalendarComponent() {
    const [today] = useState(() => new Date());
    const [month, setMonth] = useState(() => startOfMonth(today));
    const [selected, setSelected] = useState(today);
    const [view, setView] = useState<View>("month");

    const { adListData, isLoading } = useAdListQuery();
    const campaigns = useMemo(() => toCampaigns((adListData ?? []) as AdResponse[]), [adListData]);

    // Moving to another month selects today if it's in that month, otherwise the 1st.
    const goTo = (target: Date) => {
        const first = startOfMonth(target);
        setMonth(first);
        setSelected(sameDay(startOfMonth(today), first) ? today : first);
    };

    return (
        <div className="flex w-full min-w-0 flex-col gap-[18px]">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-[26px] font-semibold tracking-tight">{format(month, "MMMM yyyy")}</h1>
                    <Button variant="outline" size="icon" className="bg-card" aria-label="Previous month" onClick={() => goTo(addMonths(month, -1))}><ChevronLeft /></Button>
                    <Button variant="outline" size="icon" className="bg-card" aria-label="Next month" onClick={() => goTo(addMonths(month, 1))}><ChevronRight /></Button>
                    <Button variant="outline" className="bg-card" onClick={() => goTo(today)}>Today</Button>
                </div>
                <div role="group" aria-label="View" className="flex gap-0.5 rounded-[9px] bg-muted p-[3px]">
                    {VIEWS.map((v) => (
                        <button key={v.key} type="button" aria-pressed={view === v.key} onClick={() => setView(v.key)} className={cn(SEG, view === v.key && SEG_ON)}>
                            {v.label}
                        </button>
                    ))}
                </div>
            </header>

            {isLoading ? (
                <div role="status" aria-label="Loading calendar" className="h-[560px] animate-pulse rounded-[14px] border bg-muted/60" />
            ) : view === "month" ? (
                <MonthView month={month} today={today} selected={selected} onSelect={setSelected} campaigns={campaigns} />
            ) : (
                <TimelineView month={month} today={today} campaigns={campaigns} />
            )}
        </div>
    );
}

function MonthView({ month, today, selected, onSelect, campaigns }: {
    month: Date;
    today: Date;
    selected: Date;
    onSelect: (day: Date) => void;
    campaigns: CalendarCampaign[];
}) {
    const offset = (month.getDay() + 6) % 7; // Monday first
    const cellCount = Math.ceil((offset + getDaysInMonth(month)) / 7) * 7;
    const cells = Array.from({ length: cellCount }, (_, i) => addDays(month, i - offset));
    const onDay = campaigns.filter((c) => runsOn(c, selected));

    return (
        <div className="flex flex-wrap items-start gap-4">
            <section aria-label="Month" className="min-w-0 flex-[3_1_640px] overflow-hidden rounded-[14px] border bg-card">
                <div className="grid grid-cols-7 border-b">
                    {WEEKDAYS.map((w) => <span key={w} className="p-2 text-xs font-medium text-muted-foreground">{w}</span>)}
                </div>
                <div className="grid grid-cols-7">
                    {cells.map((date) => {
                        const inMonth = date.getMonth() === month.getMonth();
                        const running = campaigns.filter((c) => runsOn(c, date));
                        const chips = campaigns.flatMap((c) => [
                            ...(sameDay(c.start, date) ? [{ c, kind: "start" as const }] : []),
                            ...(sameDay(c.end, date) ? [{ c, kind: "end" as const }] : []),
                        ]).slice(0, 2);
                        const isToday = sameDay(date, today);
                        const isSelected = inMonth && sameDay(date, selected);
                        return (
                            <button
                                key={date.toISOString()}
                                type="button"
                                onClick={() => inMonth && onSelect(date)}
                                aria-label={`${format(date, "EEEE d MMMM yyyy")}, ${plural(running.length, "campaign")} running`}
                                aria-pressed={isSelected}
                                className={cn(
                                    "flex min-h-[104px] min-w-0 flex-col items-stretch gap-1 border-b border-r border-border/60 bg-card p-2 text-left transition-colors hover:bg-muted/50",
                                    !inMonth && "bg-muted/40 text-muted-foreground",
                                    isSelected && "shadow-[inset_0_0_0_2px_var(--primary)]",
                                )}
                            >
                                <span className={cn("font-mono text-[13px] tabular-nums", isToday && inMonth && "self-start rounded-[10px] bg-primary px-[7px] py-px text-primary-foreground")}>
                                    {date.getDate()}
                                </span>
                                {chips.map(({ c, kind }) => kind === "start" ? (
                                    <span key={`${c.id}-s`} className="block truncate rounded-[5px] px-1.5 py-0.5 text-[11px] text-white" style={{ background: c.color, opacity: c.live ? 1 : 0.55 }}>
                                        Starts · {shortName(c.name)}
                                    </span>
                                ) : (
                                    <span key={`${c.id}-e`} className="block truncate rounded-[5px] border px-1.5 py-px text-[11px]" style={{ color: c.color, borderColor: c.color }}>
                                        Ends · {shortName(c.name)}
                                    </span>
                                ))}
                                {inMonth && running.length > 0 && <span className="mt-auto text-xs text-muted-foreground">{running.length} running</span>}
                            </button>
                        );
                    })}
                </div>
            </section>

            <aside aria-label="Selected day" className="flex min-w-0 flex-[1_1_280px] flex-col gap-3 rounded-[14px] border bg-card p-[18px]">
                <h2 className="text-[15px] font-semibold">{format(selected, "EEEE d MMMM")}</h2>
                <span className="text-xs text-muted-foreground">{plural(onDay.length, "campaign")} running</span>
                {onDay.map((c) => (
                    <Link key={c.id} to={`/ads/${c.id}`} className="flex items-start gap-2.5 border-t border-border/60 py-2.5 text-foreground hover:text-primary">
                        <span aria-hidden="true" className="mt-[5px] size-2.5 flex-none rounded-[3px]" style={{ background: c.color }} />
                        <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="font-medium">{c.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {sameDay(c.end, selected) ? "Last day" : `Until ${format(c.end, "d MMM")}`}{c.live ? "" : " · not live yet"}
                            </span>
                        </span>
                    </Link>
                ))}
            </aside>
        </div>
    );
}

function TimelineView({ month, today, campaigns }: { month: Date; today: Date; campaigns: CalendarCampaign[] }) {
    const last = endOfMonth(month);
    const days = getDaysInMonth(month);
    const rows = campaigns.filter((c) => c.start <= last && c.end >= month);
    const todayIndex = differenceInCalendarDays(today, month);
    const showToday = todayIndex >= 0 && todayIndex < days;
    const ticks = [format(month, "d MMM"), "8", "15", "22", format(last, "d MMM")];

    return (
        <section aria-label="Timeline" className="overflow-x-auto rounded-[14px] border bg-card px-[18px] py-4">
            <div className="flex min-w-[900px] flex-col gap-2.5">
                <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-3">
                    <span className="text-xs text-muted-foreground">Campaign</span>
                    <div className="flex justify-between text-xs text-muted-foreground">{ticks.map((t) => <span key={t}>{t}</span>)}</div>
                </div>
                {rows.length === 0 ? (
                    <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">No campaigns run this month</div>
                ) : rows.map((c) => {
                    const s = Math.max(0, differenceInCalendarDays(c.start, month));
                    const e = Math.min(days - 1, differenceInCalendarDays(c.end, month));
                    return (
                        <div key={c.id} className="grid grid-cols-[220px_minmax(0,1fr)] items-center gap-3">
                            <Link to={`/ads/${c.id}`} className="truncate text-[13px] hover:text-primary hover:underline">{c.name}</Link>
                            <div className="relative h-[26px] rounded-md bg-background">
                                <div
                                    className="absolute inset-y-[3px] flex items-center overflow-hidden whitespace-nowrap rounded-[5px] px-2 text-[11px] text-white"
                                    style={{ background: c.color, opacity: c.live ? 1 : 0.5, left: `${(s / days) * 100}%`, width: `${((e - s + 1) / days) * 100}%` }}
                                    title={`${c.name} · ${format(c.start, "d MMM")} – ${format(c.end, "d MMM yyyy")}`}
                                >
                                    {c.start < month ? `← since ${format(c.start, "d MMM")}` : ""}
                                </div>
                                {showToday && (
                                    <div aria-hidden="true" className="absolute -inset-y-1 w-0.5 bg-foreground" style={{ left: `${((todayIndex + 0.5) / days) * 100}%` }} />
                                )}
                            </div>
                        </div>
                    );
                })}
                <span className="text-xs text-muted-foreground">The black line is today. Faded bars are not paid or not approved yet.</span>
            </div>
        </section>
    );
}
