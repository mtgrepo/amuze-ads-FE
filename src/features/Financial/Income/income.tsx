import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useIncomeQuery } from "../../../Composable/Query/dashboard/useIncomeQuery";
import { RangeControl, type RangeKey } from "../../../components/Performance/range_control";
import { rangeForDays } from "../../../components/Performance/performance_types";
import type { DateRange } from "../../../components/Dashboard/admin/dashboard_utils";
import { IncomeComponent, IncomeLoading } from "../../../components/Financial/Income/income_component";
import { downloadIncomeReport } from "../../../components/Financial/Income/income_export";

export default function IncomePage() {
    const [rangeKey, setRangeKey] = useState<RangeKey>("7d");
    const [range, setRange] = useState<DateRange>(() => rangeForDays(7));
    const { income, isLoading, isError, refetch } = useIncomeQuery(range.from, range.to);

    return (
        <div className="flex w-full min-w-0 flex-col gap-5 px-4 py-6 lg:px-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-[26px] font-semibold tracking-tight">Income</h1>
                    <p className="text-muted-foreground">Money customers paid for points, and what ads earned. 1 point = 1 MMK.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <RangeControl value={rangeKey} range={range} onChange={(key, r) => { setRangeKey(key); setRange(r); }} />
                    <Button variant="outline" className="bg-card" disabled={!income} onClick={() => income && void downloadIncomeReport(income)}>
                        Export Excel
                    </Button>
                </div>
            </header>

            {isLoading ? (
                <IncomeLoading />
            ) : isError || !income ? (
                <div role="alert" className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border bg-card px-5 py-8 text-center">
                    <div className="flex flex-col gap-1">
                        <span className="font-medium">Couldn't load income</span>
                        <span className="text-sm text-muted-foreground">Check your connection and try again.</span>
                    </div>
                    <Button variant="outline" size="sm" className="bg-card" onClick={() => void refetch()}>Try again</Button>
                </div>
            ) : (
                <IncomeComponent income={income} />
            )}
        </div>
    );
}
