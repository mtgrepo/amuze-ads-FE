import { PackagesComponent } from "../../components/AdPackages/packages_component";
import { TableSkeleton } from "../../components/Common/Skeleton/table_skeleton";
import { useAllPackagesQuery } from "../../Composable/Query/adPackage/useAllPackagesQuery";

export default function AdPackagesPage() {
    const { packages, isLoading } = useAllPackagesQuery();
    return (
        <div className="w-full mx-auto px-5 ">
            {isLoading ? <TableSkeleton filters={2} /> : <PackagesComponent data={packages} />}
        </div>
    );
}
