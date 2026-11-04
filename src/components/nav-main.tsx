import { type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  /** A count shown at the end of the row, e.g. unread notifications. Hidden when 0. */
  badge?: number
}

export interface NavGroup {
  /** Section heading; the first group has none. */
  label?: string
  items: NavItem[]
}

const isActive = (path: string, url: string) => (url === "/" ? path === "/" : path === url || path.startsWith(url + "/"))

/** The sidebar's sections. Flat lists: every page is one click away. */
export function NavMain({ groups }: { groups: NavGroup[] }) {
  const { pathname } = useLocation()

  return (
    <>
      {groups.map((group, i) => (
        <SidebarGroup key={group.label ?? i} className="py-1">
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive(pathname, item.url)}
                  className="data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:shadow-[0_0_0_1px_var(--sidebar-border)]"
                >
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {!!item.badge && (
                  <SidebarMenuBadge className="rounded-full bg-primary px-1.5 text-primary-foreground tabular-nums peer-data-[active=true]/menu-button:text-primary-foreground">
                    {item.badge}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
