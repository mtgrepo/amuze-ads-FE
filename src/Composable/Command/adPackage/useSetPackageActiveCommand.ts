import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { setPackageActive } from "../../../http/apis/adPackage/adPackageApi";

export const useSetPackageActiveCommand = () => {
    const qc = useQueryClient();
    const mutation = useMutation({
        mutationKey: ["set-package-active-command"],
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            const response = await setPackageActive(id, isActive);
            return response?.data;
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ["ad-packages"] });
            toast.success(variables.isActive ? "Package activated" : "Package deactivated");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    })
    return {
        setPackageActiveCommand: mutation.mutateAsync,
        isPending: mutation.isPending,
    }
}
