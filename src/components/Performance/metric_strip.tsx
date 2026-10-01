import { cn } from "@/lib/utils";
import { compactNumber, percentChange, rate } from "../Dashboard/admin/dashboard_utils";
import { METRIC_LABELS, TOTAL_KEY, type Metric, type PeriodTotals } from "./performance_types";

function Change({ value }: { value: number | null }) {
    if (value === null) return null;
    return (
        <span className={value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
            {value >= 0 ? "+" : ""}{value}%
        </span>
    );
}

const RATE_LABEL: Partial<Record<Metric, string>> = { clicks: "CTR", watches: "view", engagements: "eng." };

/** The four actions plus active ads. Each action cell also picks what the chart shows. */
export function MetricStrip({ current, previous, selected, onSelect, activeAdsNote, isLoading }: {
    current?: PeriodTotals;
    previous?: PeriodTotals;
    selected: Metric;
    onSelect: (metric: Metric) => void;
    activeAdsNote: string;
    isLoading: boolean;
}) {
    const metrics: Metric[] = ["impressions", "clicks", "watches", "engagements"];
    const impressions = current?.totalImpressions ?? 0;

    return (
        <div className="grid grid-cols-2 border-b sm:grid-cols-3 lg:grid-cols-5">
            {metrics.map((metric) => {
                const value = current?.[TOTAL_KEY[metric]] ?? 0;
                const change = percentChange(value, previous?.[TOTAL_KEY[metric]] ?? 0);
                const rateLabel = RATE_LABEL[metric];
                return (
                    <button
                        key={metric}
                        type="button"
                        aria-pressed={selected === metric}
                        onClick={() => onSelect(metric)}
                        className={cn(
                            "relative border-r px-4 py-3.5 text-left transition-colors hover:bg-muted/50",
                            selected === metric && "after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-primary"
                        )}
                    >
                        <div className="text-xs text-muted-foreground">{METRIC_LABELS[metric]}</div>
                        <div className="mt-0.5 text-2xl font-medium tracking-tight tabular-nums">
                            {isLoading ? <span className="text-muted-foreground">…</span> : compactNumber(value)}
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                            {rateLabel ? (
                                <>{rate(value, impressions)} {rateLabel}{change !== null && <> · <Change value={change} /></>}</>
                            ) : change !== null ? (
                                <><Change value={change} /> vs previous</>
                            ) : (
                                "vs previous —"
                            )}
                        </div>
                    </button>
                );
            })}
            <div className="px-4 py-3.5">
                <div className="text-xs text-muted-foreground">Active ads</div>
                <div className="mt-0.5 text-2xl font-medium tracking-tight tabular-nums">{current?.activeAds ?? 0}</div>
                <div className="text-xs text-muted-foreground">{activeAdsNote}</div>
            </div>
        </div>
    );
}
