import { Outlet, useMatches } from "react-router-dom"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { ModeToggle } from "./components/Common/Themes/mode-toggle"
import { Separator } from "./components/ui/separator"
import BreadCrumbLayout from "./components/Common/Layout/bread_crumb_layout"
import { AttentionBell } from "./components/Common/Layout/attention_bell"

type MatchType = {
  pathname: string
  data?: unknown
  handle?: {
    crumb: string | string[] | ((data: unknown) => string | string[])
  }
}
function App() {
  const rawMatches = useMatches()

  // Typecast safely
  const matches = rawMatches as MatchType[]
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="min-w-0">
        {/* HEADER */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger />

            <Separator
              orientation="vertical"
              className="h-5 shrink-0"
            />
            {/* Dynamic Breadcrumb */}
            <BreadCrumbLayout matches={matches}/>
          </div>

          <div className="flex items-center gap-1">
            <ModeToggle />
            <AttentionBell />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
