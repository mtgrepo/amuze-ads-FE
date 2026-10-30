import { CircleCheck, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
                <CardTitle className="flex flex-row gap-3 items-center">
                    <Target size={20} className="text-primary" /> Objectives
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {picked.map((o) => {
                    const share = o.targetCount > 0 ? Math.min(o.delivered / o.targetCount, 1) : 0;
                    const met = o.delivered >= o.targetCount;
                    return (
                        <div key={o.objectiveType}>
                            <p className="flex items-center gap-1.5 text-sm font-semibold">
                                {OBJECTIVE_LABELS[o.objectiveType]}
                                {met && <CircleCheck className="h-4 w-4 text-green-600" aria-label="Target met" />}
                            </p>
                            <p className="text-sm text-muted-foreground tabular-nums">
                                {o.delivered.toLocaleString()} / {o.targetCount.toLocaleString()}
                            </p>
                            <div className="mt-1.5 h-1 rounded-full bg-muted" role="progressbar"
                                aria-label={`${OBJECTIVE_LABELS[o.objectiveType]} progress`}
                                aria-valuenow={Math.round(share * 100)} aria-valuemin={0} aria-valuemax={100}>
                                <div className={met ? "h-full rounded-full bg-green-600" : "h-full rounded-full bg-primary"} style={{ width: `${share * 100}%` }} />
                            </div>
                            <p className="mt-1.5 text-xs text-muted-foreground">{o.cost.toLocaleString()} pts paid</p>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
