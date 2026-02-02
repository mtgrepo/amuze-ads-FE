import { LayoutDashboard, ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "../lib/utils"
import { Link, useLocation } from "react-router-dom"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const location = useLocation();
  const currentPath = location?.pathname;
  const { state } = useSidebar();

  return (
    <>
      <SidebarGroup>
        <SidebarMenu>
          {/* Dashboard */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={state === "collapsed" ? "Dashboard" : undefined}
              className={cn(
                currentPath === "/"
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : ""
              )}
            >
              <Link to={"/"}>
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Navigation Items with Dropdowns */}
          {items.map((item) => {
            const isAnySubItemActive = item.items?.some(subItem =>
              currentPath.startsWith(subItem.url)
            );

            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isAnySubItemActive || item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={state === "collapsed" ? item.title : undefined}
                      className={cn(
                        "group/menu-button",
                        isAnySubItemActive ? "bg-primary/10" : ""
                      )}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={cn(
                              currentPath.startsWith(subItem.url)
                                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                                : "hover:bg-slate-200 dark:hover:bg-slate-800"
                            )}
                          >
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}
