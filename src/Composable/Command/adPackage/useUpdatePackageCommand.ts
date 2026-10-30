import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { updatePackage } from "../../../http/apis/adPackage/adPackageApi";
import type { AdPackageInput } from "../../../dto/input/adPackage/adPackageInput";

export const useUpdatePackageCommand = () => {
    const qc = useQueryClient();
    const mutation = useMutation({
        mutationKey: ["update-package-command"],
        mutationFn: async ({ id, data }: { id: string; data: AdPackageInput }) => {
            const response = await updatePackage(id, data);
            return response?.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["ad-packages"] });
            toast.success("Package updated");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    })
    return {
        updatePackageCommand: mutation.mutateAsync,
        isPending: mutation.isPending,
    }
}
