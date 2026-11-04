import * as React from "react"
import {
  ArrowLeftRight,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  Coins,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"

import { NavMain, type NavGroup } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { RootState } from "../redux/store/store"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userData = useSelector((state: RootState) => state.auth.user)

  const groups: NavGroup[] = [
    {
      items: [
        { title: "Dashboard", url: "/", icon: LayoutDashboard },
        { title: "Performance", url: "/daily-ads-status", icon: ChartNoAxesCombined },
      ],
    },
    {
      label: "Ad management",
      items: [
        { title: "Ads", url: "/ads", icon: Megaphone },
        { title: "Calendar", url: "/calendar", icon: CalendarDays },
        { title: "Packages", url: "/packages", icon: Package },
      ],
    },
    {
      label: "Accounts",
      items: [
        { title: "Advertisers", url: "/advertisers", icon: Users },
        { title: "Points", url: "/points", icon: Coins },
        { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
      ],
    },
    {
      label: "Inbox",
      items: [{ title: "Notifications", url: "/notifications", icon: Bell }],
    },
    {
      label: "Settings",
      items: [
        { title: "Admin users", url: "/admin-users", icon: ShieldCheck },
        { title: "System configs", url: "/system-configs", icon: Settings2 },
      ],
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link to="/">
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-[15px] font-bold text-primary-foreground">A</span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">Amuze Ads</span>
                  <span className="truncate text-xs text-muted-foreground">Admin portal</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={groups} />
      </SidebarContent>
      <SidebarFooter>
        {userData && <NavUser user={userData} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
