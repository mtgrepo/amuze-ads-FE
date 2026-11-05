import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { saveCampaignObjectives } from "../../../http/apis/campaignObjective/campaignObjectiveApi";
import { refreshAfterAdChange } from "../content/refreshAfterAdChange";
import type { ObjectiveInput } from "../../../dto/response/campaignObjective/campaignObjectiveResponse";

export const useSaveCampaignObjectivesCommand = () => {
    const qc = useQueryClient();
    const mutation = useMutation({
        mutationKey: ["save-campaign-objectives-command"],
        mutationFn: async ({ campaignId, objectives }: { campaignId: string; objectives: ObjectiveInput[] }) => {
            const response = await saveCampaignObjectives(campaignId, objectives);
            return response?.data;
        },
        onSuccess: () => {
            // The total changes with the objectives, so everything showing it refreshes.
            refreshAfterAdChange(qc);
        },
        onError: (error: Error) => toast.error(error.message),
    })
    return {
        saveCampaignObjectivesCommand: mutation.mutateAsync,
        isPending: mutation.isPending,
    }
}
