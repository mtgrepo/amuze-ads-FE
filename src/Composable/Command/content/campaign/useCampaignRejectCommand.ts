import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { rejectCampaign } from "../../../../http/apis/content/campaignApi";

export const useCampaignRejectCommand = () => {
    const qc = useQueryClient();

    const campaignRejectMutation = useMutation({
        mutationKey: ['reject-campaign'],
        mutationFn: async (id: string) => {
            const response = await rejectCampaign(id);
            return response?.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['campaign-list'] });
            toast.success('Campaign rejected.');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reject campaign.');
        }
    })

    return {
        rejectCampaignCommand: campaignRejectMutation.mutateAsync,
        isPending: campaignRejectMutation.isPending,
        isError: campaignRejectMutation.isError
    }
}
