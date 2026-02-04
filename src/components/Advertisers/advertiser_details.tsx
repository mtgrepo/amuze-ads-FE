
import { BadgeCheck, XCircle } from "lucide-react";

import {
  Card,
  CardContent,
} from "../ui/card";


import type { AdvertisersResponse } from "../../dto/response/Advertisers/advertisersResponse";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import ContactForm from "./contact_form";
import BusinessForm from "./business_form";

interface Props {
  data: AdvertisersResponse;
}

export default function AdvertiserDetails({ data }: Props) {

  if (!data) return <p>No data available</p>;
    const joinedDate = data?.createdAt!
        ? new Date(data.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "-";
  return (

        <div className="max-w-7xl w-full mx-auto p-8 space-y-6">

          {/* PROFILE HEADER */}
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-32 h-32 border-4 border-slate-300 dark:border-slate-700 shadow-md">
                  <AvatarImage src={data?.avatar!} alt={data?.name || "Driver"} />
                  <AvatarFallback className="text-3xl font-bold">
                    {data?.name?.slice(0, 2).toUpperCase() || "D"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex flex-row gap-3 items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-2xl font-bold flex items-center gap-1">
                          {data.name}
                          {data?.verified ? (
                            <BadgeCheck size={20} className="text-primary" />
                          ) : (
                            <XCircle size={20} className="text-destructive" />
                          )}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent align="center" side="right">
                        <p>{data?.verified ? "Verified" : "Not Verified"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-muted-foreground font-semibold">
                    Joined Date: {joinedDate}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <ContactForm data={data} />
          <BusinessForm profile={data.profiles?.[0]} />

        </div>

  );
}

