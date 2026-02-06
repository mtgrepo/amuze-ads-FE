import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Binary, BriefcaseBusiness, Building2Icon, ClipboardPenLine, Clock, Earth, Globe, Info, MapPin, MoreHorizontal, Phone, Trash2 } from "lucide-react";
import React from "react";
import type { ProfileResponse } from "../../dto/response/advertiserProfile/profileResponse";
import { Button } from "../ui/button";
import DrawerFormLayout from "../Common/Layout/drawer_form_layout";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
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

  /*  CLEAN INFO CARD ROW  */
  const InfoRow = ({
    label,
    value,
    icon,
    type,
  }: {
    label: string;
    value?: string;
    icon?: React.ReactNode;
    type?: string;
  }) => (
    <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-4">
      <div className="text-muted-foreground mt-0.5">{icon}</div>

      <div className="flex flex-col text-sm">
        <span className="text-xs text-muted-foreground">{label}</span>

        {type === "link" && value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline wrap-break-word"
          >
            {value}
          </a>
        ) : (
          <span className="font-medium wrap-break-word">{value || "—"}</span>
        )}
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
        <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden shadow-xl">

          {/* HEADER */}
          <div className="flex items-center gap-5 px-6 py-6 bg-muted/30 border-b">
            <Avatar className="h-20 w-20 rounded-2xl shadow-sm">
              <AvatarImage src={photo ?? ""} />
              <AvatarFallback>
                {business_name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{business_name}</h2>

              <p className="w-fit capitalize">
                {business_type}
              </p>
            </div>
          </div>

          {/* BODY */}
          <div className="px-6 py-1 space-y-4">

            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              Business Information
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Advertiser" value={name} icon={<BriefcaseBusiness className="w-4 h-4" />} />
              <InfoRow label="DICA Number" value={dica_number} icon={<Phone className="w-4 h-4" />} />
              <InfoRow label="Business No" value={business_no} icon={<Binary className="w-4 h-4" />} />
              <InfoRow label="Business Type" value={business_type} icon={<Building2Icon className="w-4 h-4" />} />
              <InfoRow label="Country" value={country} icon={<Earth className="w-4 h-4" />} />
              <InfoRow label="Timezone" value={timezone} icon={<Clock className="w-4 h-4" />} />
            </div>
            <InfoRow label="Website" value={website} icon={<Globe className="w-4 h-4" />} type="link" />
            <InfoRow label="Address" value={address} icon={<MapPin className="w-4 h-4" />} />
            <DialogClose asChild>
              <Button variant="outline" className="w-full rounded-xl mt-2 mb-5">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
}


