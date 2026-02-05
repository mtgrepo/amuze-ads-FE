import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClipboardPenLine, MoreHorizontal, Trash2 } from "lucide-react";
import React, { useState } from "react";
import type { ProfileResponse } from "../../dto/response/advertiserProfile/profileResponse";
import { Button } from "../ui/button";
import DrawerFormLayout from "../Common/Layout/drawer_form_layout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useProfileDeleteCommand } from "../../Composable/Command/advertiser-profile/useProfileDeleteCommand";
import ProfileForm from "./profile_form";


export default function ProfileActions({ id, advertiser_id, business_name, business_no, business_type, dica_number, website, address, country, timezone, photo }: ProfileResponse) {
    const [editOpen, setEditOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);

    const [_formData, setFormData] = useState({ id, advertiser_id, business_name, business_no, business_type, dica_number, website, address, country, timezone, photo });

    const handleEditClick = () => {
        setEditOpen(true);
        setFormData({ id, advertiser_id, business_name, business_no, business_type, dica_number, website, address, country, timezone, photo });
    }

    const { deleteProfileCommand } = useProfileDeleteCommand();
    const handleDelete = async (id: string) => {
        await deleteProfileCommand(id);
        setDeleteOpen(false)
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
                    <DropdownMenuItem onClick={handleEditClick}>
                        <ClipboardPenLine /> Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                        <Trash2 /> Delete Profile
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Drawer */}
            <DrawerFormLayout
                open={editOpen}
                setOpen={setEditOpen}
                title="Edit Profile"
                description="Update profile below."
                formContent={
                    <ProfileForm
                        mode="edit"
                        defaultValues={{
                            id,
                            advertiser_id,
                            business_name,
                            business_no,
                            business_type,
                            dica_number,
                            website,
                            address,
                            country,
                            timezone,
                            photo
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
                        <DialogTitle>Delete Business Profile</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{business_name}</strong>?
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
