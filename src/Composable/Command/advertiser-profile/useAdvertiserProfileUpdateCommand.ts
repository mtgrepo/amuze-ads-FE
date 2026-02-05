import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateAdvertiserProfile } from "../../../http/apis/advertisers/advertiserProfileApi"
import { toast } from "sonner"

export const useAdvertiserProfileUpdateCommand = () => {
    const qc = useQueryClient();
    const advertiserProfileUpdate = useMutation({
        mutationKey: ['update-advertiser-profile'],
        mutationFn: async ({ id, data }: { id: string, data: FormData }) => {
            const response = await updateAdvertiserProfile(id, data)
            return response?.data
        },
        onSuccess: () => {
            toast.success("Advertiser profile updated successfully!");
            qc.invalidateQueries({ queryKey: ["advertiser-profile-list"] });
        }
    })
    return {
        updateAdvertiserProfileCommand: advertiserProfileUpdate.mutateAsync,
        isPending: advertiserProfileUpdate.isPending,
        isError: advertiserProfileUpdate.isError
    }
}