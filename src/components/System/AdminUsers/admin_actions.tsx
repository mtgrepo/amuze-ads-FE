import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClipboardPenLine,  MoreHorizontal, Trash2 } from "lucide-react";
import React, { useState } from "react";
import type { AdminUserResponse } from "../../../dto/response/System/adminUserResponse";
import { Button } from "../../ui/button";
import DrawerFormLayout from "../../Common/Layout/drawer_form_layout";
import AdminUserForm from "./admin_user_form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { useAdminUserDeleteCommand } from "../../../Composable/Command/system/useAdminUserDeleteCommand";

export default function AdminActions({ id, name, email, password }: AdminUserResponse) {
    const [editOpen, setEditOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);

    const [_formData, setFormData] = useState({ id, name, email, password });

    const handleEditClick = () => {
        setEditOpen(true);
        setFormData({ id, name, email, password });
    }

    // const navigate = useNavigate();
    // const handleViewDetails = () => {
    //     navigate(`/advertisers/${id}`);
    // };

    const { deleteAdminUserCommand } = useAdminUserDeleteCommand();
    const handleDelete = async (id: string) => {
        await deleteAdminUserCommand(id);
        setDeleteOpen(false)
        // qc.invalidateQueries({ queryKey: ['advertisers'] })
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
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {/* <DropdownMenuItem onClick={handleViewDetails}>
                        <InfoIcon /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator /> */}
                    <DropdownMenuItem onClick={handleEditClick}>
                        <ClipboardPenLine /> Edit Advertiser
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                        <Trash2 /> Delete Advertiser
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Drawer */}
            <DrawerFormLayout
                open={editOpen}
                setOpen={setEditOpen}
                title="Edit Advertiser"
                description="Update advertiser information below."
                formContent={
                    <AdminUserForm
                        mode="edit"
                        defaultValues={{
                            id,
                            name,
                            email,
                        }}

                        onSuccess={() => setEditOpen(false)}
                    />
                }
                cancelButton={
                    <Button variant="outline" className="w-full my-3">
                        Cancel
                    </Button>
                }
            />

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-100">
                    <DialogHeader>
                        <DialogTitle>Delete Demand Schedule</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{name}</strong>?
                            <br />
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={() => {
                                handleDelete(id)
                                setDeleteOpen(false)
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
