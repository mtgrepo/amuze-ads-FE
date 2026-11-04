import { useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RootState } from "../../redux/store/store"
import { useDashboardSummaryQuery } from "../../Composable/Query/dashboard/useDashboardSummaryQuery"
import { NeedsYou } from "./admin/needs_you"
import { MetricTiles } from "./admin/metric_tiles"
import { DeliveryCard } from "./admin/delivery_card"
import { LiveNow } from "./admin/live_now"
import { PlacementsCard } from "./admin/placements_card"
import { ActivityPanel } from "./admin/activity_panel"
import { CommandPalette } from "./admin/command_palette"
import { toLocalDateString, type DateRange } from "./admin/dashboard_utils"

type Range = "7d" | "30d" | "90d"

const RANGES: { value: Range; label: string; days: number; title: string; previous: string }[] = [
  { value: "7d", label: "7 days", days: 7, title: "Last 7 days", previous: "vs last week" },
  { value: "30d", label: "30 days", days: 30, title: "Last 30 days", previous: "vs prior 30 days" },
  { value: "90d", label: "90 days", days: 90, title: "Last 90 days", previous: "vs prior 90 days" },
]

/** The last `days` days, ending today. */
function lastDays(days: number): DateRange {
  const from = new Date()
  from.setDate(from.getDate() - (days - 1))
  return { from: toLocalDateString(from), to: toLocalDateString(new Date()) }
}

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default function DashboardComponent() {
  const user = useSelector((state: RootState) => state.auth.user)
  const [rangeKey, setRangeKey] = useState<Range>("7d")
  const selected = RANGES.find((r) => r.value === rangeKey)!
  const range = lastDays(selected.days)

  const monthStart = new Date()
  monthStart.setDate(1)
  const { summary: month } = useDashboardSummaryQuery(toLocalDateString(monthStart), toLocalDateString(new Date()))

  return (
    <div className="flex w-full flex-col gap-7 px-4 py-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-semibold tracking-tight">{greeting()}{user?.name ? `, ${user.name}` : ""}</h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, d MMMM")}
            {month && <> · <span className="font-mono">{month.campaigns.active}</span> ads live · <span className="font-mono">{month.revenue.earned.inRange.toLocaleString()}</span> pts spent this month</>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <CommandPalette />
          <div role="group" aria-label="Date range" className="flex gap-0.5 rounded-[9px] bg-accent p-[3px]">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                aria-pressed={r.value === rangeKey}
                onClick={() => setRangeKey(r.value)}
                className={cn(
                  "h-[30px] rounded-[7px] px-3 text-[13px] font-medium text-muted-foreground",
                  r.value === rangeKey && "bg-card text-foreground shadow-sm ring-1 ring-border"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button asChild>
            <Link to="/ads/create"><Plus /> Create ad</Link>
          </Button>
        </div>
      </header>

      <NeedsYou />

      <MetricTiles range={range} previousLabel={selected.previous} />

      <div className="flex flex-wrap items-stretch gap-4">
        <div className="min-w-0 flex-[2_1_560px]"><DeliveryCard range={range} rangeLabel={selected.title} /></div>
        <div className="min-w-0 flex-[1_1_340px]"><LiveNow /></div>
      </div>

      <div className="flex flex-wrap items-stretch gap-4">
        <div className="min-w-0 flex-[1_1_380px]"><PlacementsCard range={range} /></div>
        <div className="min-w-0 flex-[1_1_380px]"><ActivityPanel /></div>
      </div>
    </div>
  )
}
