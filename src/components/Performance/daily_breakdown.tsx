import { useState } from "react";
import { format } from "date-fns";
import { compactNumber, parseLocalDate, rate } from "../Dashboard/admin/dashboard_utils";
import type { DayTotals } from "./performance_types";

const COLLAPSED_DAYS = 7;

/** One row per day, newest first, with every count and rate. */
export function DailyBreakdown({ days }: { days: DayTotals[] }) {
    const [expanded, setExpanded] = useState(false);
    const newestFirst = [...days].reverse();
    const visible = expanded ? newestFirst : newestFirst.slice(0, COLLAPSED_DAYS);
    const hidden = newestFirst.length - visible.length;

    return (
        <section className="rounded-xl border bg-card p-5">
            <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-sm font-medium">Daily breakdown</h2>
                <span className="text-xs text-muted-foreground">Newest first</span>
            </div>
            <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-muted-foreground">
                            <th className="pb-2 text-left font-normal">Date</th>
                            <th className="pb-2 pl-4 text-right font-normal">Impr.</th>
                            <th className="pb-2 pl-4 text-right font-normal">Clicks</th>
                            <th className="pb-2 pl-4 text-right font-normal">CTR</th>
                            <th className="pb-2 pl-4 text-right font-normal">Watches</th>
                            <th className="pb-2 pl-4 text-right font-normal">View rate</th>
                            <th className="pb-2 pl-4 text-right font-normal">Eng.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((day) => {
                            const empty = !day.impressions && !day.clicks && !day.watches && !day.engagements;
                            return (
                                <tr key={day.date} className={`border-t ${empty ? "text-muted-foreground" : ""}`}>
                                    <td className="whitespace-nowrap py-2.5">{format(parseLocalDate(day.date), "EEE, d MMM")}</td>
                                    <td className="py-2.5 pl-4 text-right tabular-nums">{compactNumber(day.impressions)}</td>
                                    <td className="py-2.5 pl-4 text-right tabular-nums">{day.clicks.toLocaleString()}</td>
                                    <td className="py-2.5 pl-4 text-right tabular-nums">{rate(day.clicks, day.impressions)}</td>
                                    <td className="py-2.5 pl-4 text-right tabular-nums">{day.watches.toLocaleString()}</td>
                                    <td className="py-2.5 pl-4 text-right tabular-nums">{rate(day.watches, day.impressions)}</td>
                                    <td className="py-2.5 pl-4 text-right tabular-nums">{day.engagements.toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {hidden > 0 || expanded ? (
                <button
                    type="button"
                    onClick={() => setExpanded((e) => !e)}
                    className="mt-2 text-xs text-primary hover:underline"
                >
                    {expanded ? "Show fewer days" : `Show ${hidden} more ${hidden === 1 ? "day" : "days"}`}
                </button>
            ) : null}
        </section>
    );
}
