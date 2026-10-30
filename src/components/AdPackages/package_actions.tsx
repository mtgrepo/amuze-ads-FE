import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ban, ClipboardPenLine, MoreHorizontal, Power } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import DrawerFormLayout from "../Common/Layout/drawer_form_layout";
import PackageForm from "./package_form";
import { useSetPackageActiveCommand } from "../../Composable/Command/adPackage/useSetPackageActiveCommand";
import type { AdPackageResponse } from "../../dto/response/adPackage/adPackageResponse";

// Packages are never deleted: campaigns keep a reference to the package they were bought with.
export default function PackageActions(adPackage: AdPackageResponse) {
    const { id, name, isActive } = adPackage;
    const [editOpen, setEditOpen] = React.useState(false);
    const [statusOpen, setStatusOpen] = React.useState(false);

    const { setPackageActiveCommand, isPending } = useSetPackageActiveCommand();

    const handleStatusChange = async () => {
        try {
            await setPackageActiveCommand({ id, isActive: !isActive });
            setStatusOpen(false);
        } catch {
            // The command already shows why.
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel>Package Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setEditOpen(true)}
                        className="cursor-pointer"
                    >
                        <ClipboardPenLine /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setStatusOpen(true)}
                        className="cursor-pointer"
                    >
                        {isActive ? <Ban /> : <Power />}
                        {isActive ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Drawer */}
            <DrawerFormLayout
                open={editOpen}
                setOpen={setEditOpen}
                title="Edit Package"
                description="Changes apply to new purchases only; ads already bought keep their price."
                formContent={
                    <PackageForm
                        mode="edit"
                        pkg={adPackage}
                        onSuccess={() => setEditOpen(false)}
                    />
                }
                cancelButton={
                    <Button variant="outline" className="w-full my-3">
                        Cancel
                    </Button>
                }
            />

            {/* Status Dialog */}
            <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{isActive ? "Deactivate" : "Activate"} package?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {isActive ? "deactivate" : "activate"}{" "}
                            <span className="font-medium text-foreground">
                                {name}
                            </span>
                            ?{" "}
                            {isActive
                                ? "Customers can no longer pick it for new ads. Ads already bought with it keep running and can still be extended."
                                : "Customers can pick it again for new ads."}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setStatusOpen(false)} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button
                            variant={isActive ? "destructive" : "default"}
                            onClick={handleStatusChange}
                            disabled={isPending}
                        >
                            {isActive ? "Deactivate" : "Activate"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
