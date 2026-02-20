import { useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Eye,
    MousePointer2,
    Monitor,
    TrendingUp,
    PieChart as PieChartIcon,
    Trophy,
    Zap,
} from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";
import {
    useAdminOverviewQuery,
    useAdminTrendQuery,
    usePricingDistributionQuery,
    useTopAdsQuery,
    useAdvertisersQuery,
} from "../../Composable/Query/dailyAdStats/useDailyAdStatsQuery";

const PRICING_COLORS: Record<string, string> = {
    CPM: "#3b82f6",
    CPC: "#22c55e",
    CPE: "#f97316",
    Unknown: "#94a3b8",
};

const DAY_OPTIONS = [7, 14, 30] as const;
type TopMetric = "clicks" | "impressions" | "engagements";

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

function StatCard({
    title,
    value,
    sub,
    icon: Icon,
    accent,
}: {
    title: string;
    value: string | number;
    sub?: string;
    icon: React.ElementType;
    accent: string;
}) {
    return (
        <Card className="gap-3 py-5">
            <CardHeader className="px-5 pb-0">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{title}</span>
                    <span className={`p-2 rounded-lg ${accent}`}>
                        <Icon className="h-4 w-4" />
                    </span>
                </div>
            </CardHeader>
            <CardContent className="px-5">
                <p className="text-2xl font-bold tracking-tight">{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </CardContent>
        </Card>
    );
}

function ChartSkeleton({ height = 280 }: { height?: number }) {
    return <Skeleton className="w-full rounded-lg" style={{ height }} />;
}

export default function DailyAdStats() {
    const [days, setDays] = useState<7 | 14 | 30>(7);
    const [topMetric, setTopMetric] = useState<TopMetric>("clicks");
    const [advertiserId, setAdvertiserId] = useState<string | undefined>(undefined);

    const { advertisers } = useAdvertisersQuery();
    const { overviewData, isLoading: overviewLoading } = useAdminOverviewQuery(advertiserId);
    const { trendData, isLoading: trendLoading } = useAdminTrendQuery(days, advertiserId);
    const { pricingData } = usePricingDistributionQuery(advertiserId);
    const { topAdsData } = useTopAdsQuery(5, topMetric, advertiserId);

    const ctr =
        overviewData && overviewData.totalImpressions > 0
            ? ((overviewData.totalClicks / overviewData.totalImpressions) * 100).toFixed(2)
            : "0.00";

    const formattedTrend = trendData.map((item) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
    }));

    const pieFallback = [{ pricingMode: "No Data", count: 1 }];
    const pieData = pricingData.length > 0 ? pricingData : pieFallback;

    const selectedAdvertiserName =
        advertiserId ? advertisers.find((a) => a.id === advertiserId)?.name : undefined;

    return (
        <div className="w-full mx-auto px-5 py-4 space-y-5">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Daily Ad Performance</h1>
                    <p className="text-sm text-muted-foreground">
                        {selectedAdvertiserName
                            ? `Showing stats for ${selectedAdvertiserName}`
                            : "Aggregate stats across all advertisers"}
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Advertiser Filter */}
                    <Select
                        value={advertiserId ?? "all"}
                        onValueChange={(v) => setAdvertiserId(v === "all" ? undefined : v)}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="All Advertisers" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Advertisers</SelectItem>
                            {advertisers.map((adv) => (
                                <SelectItem key={adv.id} value={adv.id}>
                                    {adv.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Day Range */}
                    <div className="flex items-center gap-1">
                        {DAY_OPTIONS.map((d) => (
                            <Button
                                key={d}
                                variant={days === d ? "default" : "outline"}
                                size="sm"
                                onClick={() => setDays(d)}
                            >
                                {d}D
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            {overviewLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Impressions"
                        value={formatNumber(overviewData?.totalImpressions ?? 0)}
                        sub="Today"
                        icon={Eye}
                        accent="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                    />
                    <StatCard
                        title="Clicks"
                        value={formatNumber(overviewData?.totalClicks ?? 0)}
                        sub={`CTR: ${ctr}%`}
                        icon={MousePointer2}
                        accent="bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                    />
                    <StatCard
                        title="Engagements"
                        value={formatNumber(overviewData?.totalEngagements ?? 0)}
                        sub="Today"
                        icon={Zap}
                        accent="bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400"
                    />
                    <StatCard
                        title="Active Ads"
                        value={overviewData?.activeAds ?? 0}
                        sub="Running today"
                        icon={Monitor}
                        accent="bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
                    />
                </div>
            )}

            {/* Split Panel: Trend Chart (left) + Sidebar (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-5">
                {/* Performance Trend - Area Chart (4/7) */}
                <Card className="lg:col-span-4">
                    <CardHeader className="px-6">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            Performance Trend — Last {days} Days
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-4">
                        {trendLoading ? (
                            <ChartSkeleton height={300} />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart
                                    data={formattedTrend}
                                    margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="gradImpressions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradClicks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradEngagements" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} width={50} tickFormatter={(v) => formatNumber(v)} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: "8px", fontSize: "13px" }}
                                        formatter={(value: number | undefined) => formatNumber(value ?? 0)}
                                    />
                                    <Legend wrapperStyle={{ fontSize: "13px" }} />
                                    <Area
                                        type="monotone"
                                        dataKey="impressions"
                                        stroke="#3b82f6"
                                        fill="url(#gradImpressions)"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="clicks"
                                        stroke="#22c55e"
                                        fill="url(#gradClicks)"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="engagements"
                                        stroke="#f59e0b"
                                        fill="url(#gradEngagements)"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Right Sidebar (3/7): Pricing Donut + Budget Utilization */}
                <div className="lg:col-span-3 flex flex-col gap-5">
                    {/* Pricing Mode Donut */}
                    <Card className="flex-1">
                        <CardHeader className="px-6">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                                Pricing Mode — Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-4">
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="count"
                                        nameKey="pricingMode"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={75}
                                        paddingAngle={3}
                                    >
                                        {pieData.map((entry) => (
                                            <Cell
                                                key={entry.pricingMode}
                                                fill={PRICING_COLORS[entry.pricingMode] ?? "#94a3b8"}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: "8px", fontSize: "13px" }}
                                        formatter={(value: number | undefined, name: string | undefined) => [
                                            `${value ?? 0} ad${(value ?? 0) !== 1 ? "s" : ""}`,
                                            name ?? "",
                                        ]}
                                    />
                                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                </div>
            </div>

            {/* Top 5 Ads — Table */}
            <Card>
                <CardHeader className="px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                            Top 5 Ads
                        </CardTitle>
                        <div className="flex gap-2">
                            {(["clicks", "impressions", "engagements"] as TopMetric[]).map((m) => (
                                <Button
                                    key={m}
                                    variant={topMetric === m ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTopMetric(m)}
                                    className="capitalize text-xs"
                                >
                                    {m}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-4">
                    {topAdsData.length === 0 ? (
                        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                            No ad data available.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-muted-foreground">
                                        <th className="text-left py-2 pr-4 font-medium w-8">#</th>
                                        <th className="text-left py-2 pr-4 font-medium">Campaign</th>
                                        <th className="text-right py-2 pr-4 font-medium">Clicks</th>
                                        <th className="text-right py-2 pr-4 font-medium">Impressions</th>
                                        <th className="text-right py-2 font-medium">Engagements</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topAdsData.map((ad, index) => (
                                        <tr
                                            key={index}
                                            className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                                        >
                                            <td className="py-3 pr-4 text-muted-foreground font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="py-3 pr-4 font-medium">
                                                {ad.campaignName}
                                            </td>
                                            <td className="py-3 pr-4 text-right tabular-nums">
                                                {formatNumber(ad.totalClicks)}
                                            </td>
                                            <td className="py-3 pr-4 text-right tabular-nums">
                                                {formatNumber(ad.totalImpressions)}
                                            </td>
                                            <td className="py-3 text-right tabular-nums">
                                                {formatNumber(ad.totalEngagements)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
