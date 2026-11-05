import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { updateCampaignBudget } from "../../../../http/apis/content/campaignApi";
import type { CampaignBudgetInput } from "../../../../dto/input/content/campaignBudgetInput";
import { refreshAfterAdChange } from "../refreshAfterAdChange";

export const useUpdateCampaignBudgetCommand = () => {
    const qc = useQueryClient();

    const updateBudgetMutation = useMutation({
        mutationKey: ['update-campaign-budget'],
        mutationFn: async ({ id, data }: { id: string, data: CampaignBudgetInput }) => {
            const response = await updateCampaignBudget(id, data);
            return response?.data;
        },
        onSuccess: () => {
            refreshAfterAdChange(qc);
            toast.success('Package updated.');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update budget.');
        }
    })

    return {
        updateCampaignBudgetCommand: updateBudgetMutation.mutateAsync,
        isPending: updateBudgetMutation.isPending,
    }
}
