import { Button } from "@/components/ui/button";
import { DisplayRulesComponent } from "../../../components/System/DisplayRules/display_rules_component";
import { useDisplayRulesQuery } from "../../../Composable/Query/displayRules/useDisplayRulesQuery";

export default function DisplayRules() {
    const { rules, isLoading, isError, refetch } = useDisplayRulesQuery();
    return (
        <div className="w-full px-4 py-6 lg:px-6">
            {isLoading ? (
                <div role="status" aria-label="Loading display rules" className="mx-auto flex max-w-[1100px] flex-col gap-4">
                    <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-36 animate-pulse rounded-[14px] border bg-card" />)}
                </div>
            ) : isError ? (
                <div role="alert" className="mx-auto flex min-h-48 max-w-[1100px] flex-col items-center justify-center gap-3 rounded-xl border bg-card px-5 py-8 text-center">
                    <div className="flex flex-col gap-1">
                        <span className="font-medium">Couldn't load the display rules</span>
                        <span className="text-sm text-muted-foreground">Check your connection and try again.</span>
                    </div>
                    <Button variant="outline" size="sm" className="bg-card" onClick={() => void refetch()}>Try again</Button>
                </div>
            ) : (
                <DisplayRulesComponent rules={rules} />
            )}
        </div>
    );
}
