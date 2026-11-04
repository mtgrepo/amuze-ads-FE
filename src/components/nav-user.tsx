import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  ExternalLink,
  LogOut,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useDispatch } from "react-redux"
import { logoutAction } from "../redux/auth/authSlice"
import { goToAmuzeAdmin } from "../lib/amuze"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email?: string | null
    phone?: string | null
    avatar?: string
  }
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const initials = (user?.name || user?.email || "").slice(0, 2).toUpperCase()

  // Admins sign in through AMUZE, so logging out returns them there.
  const handleLogout = () => {
    dispatch(logoutAction())
    goToAmuzeAdmin()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="bg-card shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-card data-[state=open]:shadow-[0_0_0_2px_var(--primary)]"
            >
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-full bg-info-soft text-xs font-semibold text-info-soft-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">Administrator</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-xl p-1.5"
            side={isMobile ? "bottom" : "top"}
            align="start"
            sideOffset={8}
          >
            <DropdownMenuLabel className="px-2.5 py-2 font-normal">
              <div className="grid text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email || user.phone}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/notifications")}>
                <Bell />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`${import.meta.env.VITE_AMUZE_URL}`, "_blank")}>
                <ExternalLink />
                Switch to Amuze portal
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive [&_svg]:!text-destructive">
              <LogOut />
              Log out
              <span className="ml-auto text-xs text-muted-foreground">back to AMUZE</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
