import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toLocalDateString, type DateRange } from "../Dashboard/admin/dashboard_utils";
import { rangeForDays } from "./performance_types";

const PRESETS = [7, 30, 90];

/** Exact dates plus 7d/30d/90d shortcuts. A preset is highlighted only while the dates still match it. */
export function RangeControl({ range, onChange }: { range: DateRange; onChange: (range: DateRange) => void }) {
    const today = toLocalDateString(new Date());

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Input
                    type="date"
                    aria-label="From"
                    className="h-8 w-36 text-xs"
                    value={range.from}
                    max={range.to}
                    onChange={(e) => e.target.value && onChange({ ...range, from: e.target.value })}
                />
                to
                <Input
                    type="date"
                    aria-label="To"
                    className="h-8 w-36 text-xs"
                    value={range.to}
                    min={range.from}
                    max={today}
                    onChange={(e) => e.target.value && onChange({ ...range, to: e.target.value })}
                />
            </div>
            <div role="group" aria-label="Quick ranges" className="flex rounded-lg border p-0.5">
                {PRESETS.map((days) => {
                    const preset = rangeForDays(days);
                    const active = preset.from === range.from && preset.to === range.to;
                    return (
                        <button
                            key={days}
                            type="button"
                            aria-pressed={active}
                            onClick={() => onChange(preset)}
                            className={cn(
                                "rounded-md px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground",
                                active && "bg-muted text-foreground"
                            )}
                        >
                            {days}d
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
