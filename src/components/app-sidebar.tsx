"use client"

import * as React from "react"
import {
  BellRing,
  BriefcaseBusiness,
  ChartNoAxesCombinedIcon,
  Layers,
  Newspaper,
  Settings,
  UserCog,
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
import { useSelector } from "react-redux"
import type { RootState } from "../redux/store/store"

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
      logo: Layers,
      plan: "Enterprise",
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
        {
          title: "Advertiser Profiles",
          url: "/advertiser-profiles",
        }
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
      name: "Admin Users",
      url: "/admin-users",
      icon: UserCog,
    },
    {
      name: "System Configs",
      url: "/system-configs",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
      const userData = useSelector((state: RootState) => state.auth.user);

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
          {userData && <NavUser user={userData} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
