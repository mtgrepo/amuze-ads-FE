"use client"

import * as React from "react"
import {
  AudioWaveform,
  BellRing,
  BriefcaseBusiness,
  ChartNoAxesCombinedIcon,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  Newspaper,
  PieChart,
  Wallet,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Advertisers",
      url: "#",
      icon: BriefcaseBusiness,
      isActive: true,
      items: [
        {
          title: "Advertisers",
          url: "/advertisers",
        },
      ],
    },
    {
        title: "Financial",
        url: "#",
        icon: Wallet,
        items: [
            {
                title: "Transactions",
                url: "/transactions",
            }
        ]
    },
    {
      title: "Content",
      url: "#",
      icon: Newspaper,
      items: [
        {
          title: "Ads",
          url: "/ads",
        },        
        {
          title: "Ad Sets",
          url: "/ad-sets",
        },
        {
          title: "Campaigns",
          url: "/campaigns",
        },
      ],
    },
    {
      title: "Performance",
      url: "#",
      icon: ChartNoAxesCombinedIcon,
      items: [
        {
          title: "Daily ads status",
          url: "/daily-ads-status",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
    {
        title: "Notifications",
        url: "#",
        icon: BellRing,
        items: [
            {
                title: "Notifications",
                url: "/notifications",
            }
        ]
    }
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
