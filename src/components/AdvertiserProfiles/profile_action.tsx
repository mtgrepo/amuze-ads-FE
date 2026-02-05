import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClipboardPenLine, Info, MoreHorizontal, Trash2 } from "lucide-react";
import React from "react";
import type { ProfileResponse } from "../../dto/response/advertiserProfile/profileResponse";
import { Button } from "../ui/button";
import DrawerFormLayout from "../Common/Layout/drawer_form_layout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useProfileDeleteCommand } from "../../Composable/Command/advertiser-profile/useProfileDeleteCommand";
import ProfileForm from "./profile_form";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function ProfileActions({
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
  photo,
  advertiser: { name },
}: ProfileResponse) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const { deleteProfileCommand } = useProfileDeleteCommand();

  const handleDelete = async () => {
    await deleteProfileCommand(id);
    setDeleteOpen(false);
  };

  /*  Enterprise Info Row  */
  const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <div className="grid grid-cols-3 border-b text-sm">
      <div className="text-muted-foreground px-4 py-2 font-medium">
        {label}
      </div>
      <div className="col-span-2 px-4 py-2 font-semibold">
        {value || "—"}
      </div>
    </div>
  );

  return (
    <>
      {/*  ACTION MENU  */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md hover:bg-muted"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-40 rounded-md border shadow-sm"
        >
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            ACTIONS
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setDetailOpen(true)}>
            <Info className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <ClipboardPenLine className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/*  EDIT DRAWER  */}
      <DrawerFormLayout
        open={editOpen}
        setOpen={setEditOpen}
        title="Edit Profile"
        description="Update business information"
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
              photo,
            }}
            onSuccess={() => setEditOpen(false)}
          />
        }
        cancelButton={<Button variant="outline" className="w-full">Cancel</Button>}
      />

      {/*  DELETE DIALOG  */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-md">
          <DialogHeader>
            <DialogTitle>Delete Business Profile</DialogTitle>
            <DialogDescription>
              This action permanently removes{" "}
              <strong>{business_name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/*  DETAIL DIALOG  */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md rounded-md p-0 overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center gap-3 border-b px-6 py-4 bg-muted/40">
            <Avatar className="h-20 w-20 rounded-md">
              <AvatarImage src={photo ?? ""} />
              <AvatarFallback>
                {business_name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-semibold">{business_name}</p>
              <p className="text-xs text-muted-foreground">
                Business Profile
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="divide-y">
            <InfoRow label="Advertiser" value={name} />
            <InfoRow label="Business No" value={business_no} />
            <InfoRow label="Business Type" value={business_type} />
            <InfoRow label="DICA Number" value={dica_number} />
            <InfoRow label="Website" value={website} />
            <InfoRow label="Address" value={address} />
            <InfoRow label="Country" value={country} />
            <InfoRow label="Timezone" value={timezone} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


