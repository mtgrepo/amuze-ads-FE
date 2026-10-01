import { useState } from "react"
import { useSelector } from "react-redux"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { RootState } from "../../redux/store/store"
import { AttentionPanel } from "./admin/attention_panel"
import { HeadlinePanel } from "./admin/headline_panel"
import { DeliveryChart } from "./admin/delivery_chart"
import { PointsPanel } from "./admin/points_panel"
import { PlacementPanel } from "./admin/placement_panel"
import { TopCampaigns } from "./admin/top_campaigns"
import { presetRange, toLocalDateString, type DateRange, type RangePreset } from "./admin/dashboard_utils"

const PRESETS: { value: RangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "custom", label: "Custom" },
]

const RANGE_LABELS: Record<RangePreset, string> = {
  today: "today",
  "7d": "last 7 days",
  "30d": "last 30 days",
  custom: "selected period",
}

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default function DashboardComponent() {
  const user = useSelector((state: RootState) => state.auth.user)
  const [preset, setPreset] = useState<RangePreset>("7d")
  const [customRange, setCustomRange] = useState<DateRange>(() => presetRange("30d"))

  const range = preset === "custom" ? customRange : presetRange(preset)
  const today = toLocalDateString(new Date())

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 lg:px-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground">{format(new Date(), "EEEE, d MMMM")}</div>
          <h1 className="text-xl font-medium">{greeting()}{user?.name ? `, ${user.name}` : ""}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {preset === "custom" && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Input
                type="date"
                className="h-8 w-36 text-xs"
                value={customRange.from}
                max={customRange.to}
                onChange={(e) => e.target.value && setCustomRange((r) => ({ ...r, from: e.target.value }))}
              />
              to
              <Input
                type="date"
                className="h-8 w-36 text-xs"
                value={customRange.to}
                min={customRange.from}
                max={today}
                onChange={(e) => e.target.value && setCustomRange((r) => ({ ...r, to: e.target.value }))}
              />
            </div>
          )}
          <div role="tablist" aria-label="Date range" className="flex rounded-lg border p-0.5">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                role="tab"
                aria-selected={preset === p.value}
                onClick={() => setPreset(p.value)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground",
                  preset === p.value && "bg-muted text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.15fr_1fr]">
        <AttentionPanel />
        <HeadlinePanel range={range} rangeLabel={RANGE_LABELS[preset]} />
      </div>

      <DeliveryChart range={range} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <PointsPanel range={range} rangeLabel={RANGE_LABELS[preset]} />
        <PlacementPanel range={range} />
      </div>

      <TopCampaigns range={range} />
    </div>
  )
}
