import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { deleteCampaign } from "../../../../http/apis/content/campaignApi";

export const useCampaignDeleteCommand = () => {
    const qc = useQueryClient();

    const campaignDeleteMutation = useMutation({
        mutationKey: ['delete-campaign'],
        mutationFn: async (id: string) => {
            const response = await deleteCampaign(id);
            return response?.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['campaign-list'] });
            toast.success('Campaign deleted successfully.');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete campaign.');
        }
    })

    return {
        deleteCampaignCommand: campaignDeleteMutation.mutateAsync,
        isPending: campaignDeleteMutation.isPending,
        isError: campaignDeleteMutation.isError
    }
}
