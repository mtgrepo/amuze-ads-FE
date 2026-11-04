import { useState } from "react"
import { useSelector } from "react-redux"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { RootState } from "../../redux/store/store"
import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NeedsYou } from "./admin/needs_you"
import { MetricTiles } from "./admin/metric_tiles"
import { ActivityPanel } from "./admin/activity_panel"
import { useDashboardSummaryQuery } from "../../Composable/Query/dashboard/useDashboardSummaryQuery"
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
  const { summary } = useDashboardSummaryQuery(range.from, range.to)
  const campaigns = summary?.campaigns

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{greeting()}{user?.name ? `, ${user.name}` : ""}</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, d MMMM")}
            {campaigns && <> · <span className="font-mono">{campaigns.active}</span> live · <span className="font-mono">{campaigns.pending}</span> waiting for review · <span className="font-mono">{campaigns.drafts}</span> unpaid drafts</>}
          </p>
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
          <div role="tablist" aria-label="Date range" className="flex rounded-lg bg-accent p-0.5">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                role="tab"
                aria-selected={preset === p.value}
                onClick={() => setPreset(p.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                  preset === p.value && "bg-card text-foreground shadow-sm ring-1 ring-border"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button asChild>
            <Link to="/ads/create"><Plus /> Create ad</Link>
          </Button>
        </div>
      </div>

      <NeedsYou />

      <MetricTiles range={range} />

      <DeliveryChart range={range} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <PlacementPanel range={range} />
        <PointsPanel range={range} rangeLabel={RANGE_LABELS[preset]} />
        <ActivityPanel />
      </div>

      <TopCampaigns range={range} />
    </div>
  )
}
