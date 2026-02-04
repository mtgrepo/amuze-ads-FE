import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createAdvertiser } from "../../../http/apis/advertisers/advertisersApi"
import type { AdvertiserInput } from "../../../dto/input/advertiser/advertiserInput"
import { toast } from "sonner";

export const useAdvertiserCreateCommand = () => {
    const qc = useQueryClient();
    const createAdvertiserCommand = useMutation({
        mutationKey: ["create-advertiser-command"],
        mutationFn: async (data: AdvertiserInput) => {
            const response = await createAdvertiser(data)
            return response?.data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["advertisers"] });
            toast.success("Advertiser created successfully!");
        }
    })
    return {
        createAdvertiserCommand: createAdvertiserCommand.mutateAsync,
        isPending: createAdvertiserCommand.isPending,
        isError: createAdvertiserCommand.isError,
    }
}   