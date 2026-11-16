import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { rejectCampaign } from "../../../../http/apis/content/campaignApi";
import { refreshAfterAdChange } from "../refreshAfterAdChange";

export const useCampaignRejectCommand = () => {
    const qc = useQueryClient();

    const campaignRejectMutation = useMutation({
        mutationKey: ['reject-campaign'],
        mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
            const response = await rejectCampaign(id, reason);
            return response?.data;
        },
        onSuccess: () => {
            refreshAfterAdChange(qc);
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
