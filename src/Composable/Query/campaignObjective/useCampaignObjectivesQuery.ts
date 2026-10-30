import { useQuery } from "@tanstack/react-query"
import { getCampaignObjectives } from "../../../http/apis/campaignObjective/campaignObjectiveApi";
import type { ObjectiveProgress } from "../../../dto/response/campaignObjective/campaignObjectiveResponse";

/** A campaign's objectives (all three types) with what has been delivered so far. */
export const useCampaignObjectivesQuery = (campaignId: string | undefined) => {
    const query = useQuery({
        queryKey: ["campaign-objectives", campaignId],
        queryFn: async () => {
            const response = await getCampaignObjectives(campaignId!);
            return (response?.data ?? []) as ObjectiveProgress[];
        },
        enabled: !!campaignId,
    })
    return {
        objectives: query.data ?? [],
        isLoading: query.isLoading,
    }
}
