import { useQuery } from "@tanstack/react-query"
import { getAllPackages } from "../../../http/apis/adPackage/adPackageApi";
import type { AdPackageResponse } from "../../../dto/response/adPackage/adPackageResponse";

/** Every package, active or not, for the admin Packages page. */
export const useAllPackagesQuery = () => {
    const query = useQuery({
        queryKey: ["ad-packages", "all"],
        queryFn: async () => {
            const response = await getAllPackages();
            return (response?.data ?? []) as AdPackageResponse[];
        },
    })
    return {
        packages: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
    }
}
