import { CheckCircle2, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "../../../lib/utils";
import { useCampaignObjectivesQuery } from "../../../Composable/Query/campaignObjective/useCampaignObjectivesQuery";
import { OBJECTIVE_LABELS } from "../../../dto/response/campaignObjective/campaignObjectiveResponse";

/** The objectives a campaign bought and how far each has got. Nothing when it bought none. */
export function ObjectiveProgressCard({ campaignId }: { campaignId: string }) {
    const { objectives } = useCampaignObjectivesQuery(campaignId);
    const picked = objectives.filter((o) => o.selected);
    if (picked.length === 0) return null;

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader>
                <CardTitle className="flex flex-row items-center gap-3">
                    <Target size={20} className="text-primary" /> Objectives
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                {picked.map((o) => {
                    const share = o.targetCount > 0 ? Math.min(o.delivered / o.targetCount, 1) : 0;
                    const met = o.delivered >= o.targetCount;
                    return (
                        <div key={o.objectiveType} className="space-y-1.5">
                            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                                <span className="font-medium">{OBJECTIVE_LABELS[o.objectiveType]}</span>
                                <span className="tabular-nums">
                                    {met && <CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-600" />}
                                    <span className="font-semibold">{o.delivered.toLocaleString()}</span>
                                    <span className="text-muted-foreground"> / {o.targetCount.toLocaleString()}</span>
                                    {met && <span className="ml-1 text-emerald-700 dark:text-emerald-400">Met</span>}
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar"
                                aria-label={`${OBJECTIVE_LABELS[o.objectiveType]} progress`}
                                aria-valuenow={Math.round(share * 100)} aria-valuemin={0} aria-valuemax={100}>
                                <div className={cn("h-full rounded-full", met ? "bg-emerald-500" : "bg-primary")} style={{ width: `${share * 100}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground">{o.cost.toLocaleString()} pts paid</p>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
