import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteAdvertiserProfile } from "../../../http/apis/advertisers/advertiserProfileApi"
import { toast } from "sonner";

export const useProfileDeleteCommand =  () => {
    const qc = useQueryClient();
    const profileDeleteMutation = useMutation({
        mutationKey: ['delete-profile'],
        mutationFn: async (id: string) => {
            const response = await deleteAdvertiserProfile(id)
            return response?.data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['advertiser-profile-list'] });
            toast.success('Profile deleted successfully.');
        },
        onError: (error) => {
            toast.error( error?.message || 'Profile deletion failed.');
        }
    })
    return {
        deleteProfileCommand: profileDeleteMutation.mutateAsync,
        isPending: profileDeleteMutation.isPending,
        isError: profileDeleteMutation.isError
    }
}