import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { createPackage } from "../../../http/apis/adPackage/adPackageApi";
import type { AdPackageInput } from "../../../dto/input/adPackage/adPackageInput";

export const useCreatePackageCommand = () => {
    const qc = useQueryClient();
    const mutation = useMutation({
        mutationKey: ["create-package-command"],
        mutationFn: async (data: AdPackageInput) => {
            const response = await createPackage(data);
            return response?.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["ad-packages"] });
            toast.success("Package created");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    })
    return {
        createPackageCommand: mutation.mutateAsync,
        isPending: mutation.isPending,
    }
}
