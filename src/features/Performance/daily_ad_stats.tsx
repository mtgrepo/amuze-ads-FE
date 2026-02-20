import { useState } from "react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
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
    Eye,
    MousePointer2,
    DollarSign,
    Monitor,
    TrendingUp,
    BarChart3,
    PieChart as PieChartIcon,
    Trophy,
} from "lucide-react";
import {
    useAdminOverviewQuery,
    useAdminTrendQuery,
    usePricingDistributionQuery,
    useTopAdsQuery,
} from "../../Composable/Query/dailyAdStats/useDailyAdStatsQuery";

const PRICING_COLORS: Record<string, string> = {
    CPM: "#3b82f6",
    CPC: "#22c55e",
    CPE: "#f97316",
    Unknown: "#94a3b8",
};

const DAY_OPTIONS = [7, 14, 30] as const;
type TopMetric = "clicks" | "impressions" | "spent" | "engagements";

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

    const { overviewData, isLoading: overviewLoading } = useAdminOverviewQuery();
    const { trendData, isLoading: trendLoading } = useAdminTrendQuery(days);
    const { pricingData } = usePricingDistributionQuery();
    const { topAdsData } = useTopAdsQuery(5, topMetric);

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

    const formattedTopAds = topAdsData.map((ad) => ({
        label: ad.adId.slice(0, 8) + "…",
        value:
            topMetric === "clicks"
                ? ad.totalClicks
                : topMetric === "impressions"
                ? ad.totalImpressions
                : topMetric === "engagements"
                ? ad.totalEngagements
                : ad.totalSpent,
    }));

    const pieFallback = [{ pricingMode: "No Data", count: 1 }];
    const pieData = pricingData.length > 0 ? pricingData : pieFallback;

    return (
        <div className="w-full mx-auto px-5 py-4 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Daily Ad Performance</h1>
                    <p className="text-sm text-muted-foreground">
                        Aggregate stats across all active ads
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground mr-1">Trend range:</span>
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

            {/* KPI Cards */}
            {overviewLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Impressions"
                        value={formatNumber(overviewData?.totalImpressions ?? 0)}
                        sub="Today"
                        icon={Eye}
                        accent="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                    />
                    <StatCard
                        title="Total Clicks"
                        value={formatNumber(overviewData?.totalClicks ?? 0)}
                        sub={`CTR: ${ctr}%`}
                        icon={MousePointer2}
                        accent="bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                    />
                    <StatCard
                        title="Total Spent"
                        value={`$${formatNumber(overviewData?.totalSpent ?? 0)}`}
                        sub={`Budget: $${formatNumber(overviewData?.totalBudget ?? 0)}`}
                        icon={DollarSign}
                        accent="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
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

            {/* Performance Trend - Area Chart */}
            <Card>
                <CardHeader className="px-6">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        Performance Trend — Last {days} Days
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-4">
                    {trendLoading ? (
                        <ChartSkeleton height={280} />
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={formattedTrend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradImpressions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradClicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} width={50} />
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
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Budget vs Spent + Pricing Mode */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Budget vs Spent - Bar Chart (3/5 width) */}
                <Card className="lg:col-span-3">
                    <CardHeader className="px-6">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            Daily Budget vs Spent
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-4">
                        {trendLoading ? (
                            <ChartSkeleton height={240} />
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart
                                    data={formattedTrend}
                                    margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                                    barCategoryGap="30%"
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} width={50} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: "8px", fontSize: "13px" }}
                                        formatter={(value: number | undefined) => `$${formatNumber(value ?? 0)}`}
                                    />
                                    <Legend wrapperStyle={{ fontSize: "13px" }} />
                                    <Bar
                                        dataKey="budget"
                                        fill="#cbd5e1"
                                        radius={[4, 4, 0, 0]}
                                        name="Budget"
                                    />
                                    <Bar
                                        dataKey="spent"
                                        fill="#f97316"
                                        radius={[4, 4, 0, 0]}
                                        name="Spent"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Pricing Mode Donut (2/5 width) */}
                <Card className="lg:col-span-2">
                    <CardHeader className="px-6">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                            Pricing Mode — Today
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-4">
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="count"
                                    nameKey="pricingMode"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={3}
                                >
                                    {pieData.map((entry) => (
                                        <Cell
                                            key={entry.pricingMode}
                                            fill={
                                                PRICING_COLORS[entry.pricingMode] ?? "#94a3b8"
                                            }
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
                                <Legend wrapperStyle={{ fontSize: "13px" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top 5 Ads - Horizontal Bar */}
            <Card>
                <CardHeader className="px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                            Top 5 Ads
                        </CardTitle>
                        <div className="flex gap-2">
                            {(["clicks", "impressions", "engagements", "spent"] as TopMetric[]).map(
                                (m) => (
                                    <Button
                                        key={m}
                                        variant={topMetric === m ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTopMetric(m)}
                                        className="capitalize text-xs"
                                    >
                                        {m}
                                    </Button>
                                )
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-4">
                    {topAdsData.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                            No ad data available for today.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart
                                data={formattedTopAds}
                                layout="vertical"
                                margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 11 }}
                                    tickFormatter={(v) => formatNumber(v)}
                                />
                                <YAxis
                                    dataKey="label"
                                    type="category"
                                    width={80}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: "8px", fontSize: "13px" }}
                                    formatter={(value: number | undefined) => [formatNumber(value ?? 0), topMetric]}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="#3b82f6"
                                    radius={[0, 4, 4, 0]}
                                    name={topMetric}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
