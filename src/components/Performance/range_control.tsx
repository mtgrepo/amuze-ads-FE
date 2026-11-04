import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toLocalDateString, type DateRange } from "../Dashboard/admin/dashboard_utils";
import { rangeForDays } from "./performance_types";

export type RangeKey = "7d" | "30d" | "90d" | "custom";

const PRESETS: { key: Exclude<RangeKey, "custom">; days: number; label: string }[] = [
    { key: "7d", days: 7, label: "7 days" },
    { key: "30d", days: 30, label: "30 days" },
    { key: "90d", days: 90, label: "90 days" },
];

const SEG = "h-[30px] rounded-[7px] px-3 text-[13px] font-medium text-foreground/80 transition-colors hover:text-foreground";
const SEG_ON = "bg-card text-foreground shadow-[0_1px_2px_rgba(24,24,27,.08)] ring-1 ring-border";

/** 7 / 30 / 90 days, or exact dates from "Custom…". */
export function RangeControl({ value, range, onChange }: {
    value: RangeKey;
    range: DateRange;
    onChange: (key: RangeKey, range: DateRange) => void;
}) {
    const [today] = useState(() => toLocalDateString(new Date()));
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<DateRange>(range);

    return (
        <div role="group" aria-label="Date range" className="flex gap-0.5 rounded-[9px] bg-muted p-[3px]">
            {PRESETS.map((p) => (
                <button
                    key={p.key}
                    type="button"
                    aria-pressed={value === p.key}
                    onClick={() => onChange(p.key, rangeForDays(p.days))}
                    className={cn(SEG, value === p.key && SEG_ON)}
                >
                    {p.label}
                </button>
            ))}
            <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(range); }}>
                <PopoverTrigger asChild>
                    <button type="button" aria-pressed={value === "custom"} className={cn(SEG, value === "custom" && SEG_ON)}>
                        Custom…
                    </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="flex w-72 flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                            From
                            <Input type="date" value={draft.from} max={draft.to} onChange={(e) => e.target.value && setDraft({ ...draft, from: e.target.value })} />
                        </label>
                        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                            To
                            <Input type="date" value={draft.to} min={draft.from} max={today} onChange={(e) => e.target.value && setDraft({ ...draft, to: e.target.value })} />
                        </label>
                    </div>
                    <Button
                        size="sm"
                        disabled={draft.from > draft.to}
                        onClick={() => { onChange("custom", draft); setOpen(false); }}
                    >
                        Apply
                    </Button>
                </PopoverContent>
            </Popover>
        </div>
    );
}
