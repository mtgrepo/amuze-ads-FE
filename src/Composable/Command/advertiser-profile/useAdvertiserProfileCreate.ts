import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createAdvertiserProfile } from "../../../http/apis/advertisers/advertiserProfileApi"
import { toast } from "sonner";

export const useAdvertiserProfileCreateCommand = () => {
    const qc = useQueryClient();
    const advertiserProfileCreateMutaion = useMutation({
        mutationKey: ['create-advertiser-profile'],
        mutationFn: async (data: FormData) => {
            const response = await createAdvertiserProfile(data)
            return response?.data
        },
        onSuccess: () => {
            toast.success("Advertiser profile created successfully!");
            qc.invalidateQueries({ queryKey: ["advertiser-details"] });
        }
    })
    return {
        createAdvertiserProfileCommand: advertiserProfileCreateMutaion.mutateAsync,
        isPending: advertiserProfileCreateMutaion.isPending,
        isError: advertiserProfileCreateMutaion.isError
    }
}