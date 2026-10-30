import { PackageTable } from "../../components/AdPackages/package_table";
import { useAllPackagesQuery } from "../../Composable/Query/adPackage/useAllPackagesQuery";

export default function AdPackagesPage() {
    const { packages, isLoading } = useAllPackagesQuery();
    return (
        <div className="w-full mx-auto px-5">
            {isLoading ? <div className="h-48 animate-pulse rounded-2xl bg-muted" /> : <PackageTable packages={packages} />}
        </div>
    );
}
