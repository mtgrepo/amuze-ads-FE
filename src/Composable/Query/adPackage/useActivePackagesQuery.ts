import { useQuery } from "@tanstack/react-query"
import { getActivePackages } from "../../../http/apis/adPackage/adPackageApi";
import type { AdPackageResponse } from "../../../dto/response/adPackage/adPackageResponse";

/** Packages that can be bought now, for the ad create and draft budget forms. */
export const useActivePackagesQuery = () => {
    const query = useQuery({
        queryKey: ["ad-packages", "active"],
        queryFn: async () => {
            const response = await getActivePackages();
            return (response?.data ?? []) as AdPackageResponse[];
        },
    })
    return {
        packages: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
    }
}
