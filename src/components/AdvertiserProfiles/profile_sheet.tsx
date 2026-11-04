import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../ui/sheet";
import ProfileForm from "./profile_form";

export interface ProfileValues {
    id?: string;
    advertiser_id: string;
    business_name: string;
    business_no: string;
    business_type: string;
    dica_number: string | null;
    website: string;
    address: string;
    country: string;
    timezone: string;
    photo: string;
}

interface Props {
    /** A saved profile to edit; leave out to add one. */
    profile?: ProfileValues;
    /** Pre-picks the owner when adding from an advertiser's page. */
    advertiserId?: string;
    onClose: () => void;
}

/** Side panel around the business profile form. Mount it only while open. */
export function ProfileSheet({ profile, advertiserId, onClose }: Props) {
    const qc = useQueryClient();
    const preset: ProfileValues | undefined = profile ?? (advertiserId ? {
        advertiser_id: advertiserId, business_name: "", business_no: "", business_type: "", dica_number: "",
        website: "", address: "", country: "", timezone: "", photo: "",
    } : undefined);

    return (
        <Sheet open onOpenChange={(o) => { if (!o) onClose(); }}>
            <SheetContent side="right" className="flex w-full flex-col gap-0 bg-card p-0 sm:max-w-[460px]">
                <div className="flex flex-col gap-1 border-b px-[22px] py-5 pr-12">
                    <SheetTitle className="text-[19px] font-semibold">{profile ? `Edit ${profile.business_name}` : "Add business profile"}</SheetTitle>
                    <SheetDescription className="text-xs">Complete profiles are quicker to verify.</SheetDescription>
                </div>
                <div className="flex-1 overflow-y-auto p-[22px]">
                    <ProfileForm
                        mode={profile ? "edit" : "add"}
                        defaultValues={preset}
                        onSuccess={() => {
                            qc.invalidateQueries({ queryKey: ["advertiser-details"] });
                            onClose();
                        }}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
