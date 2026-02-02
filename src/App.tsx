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

type MatchType = {
  pathname: string
  data?: any
  handle?: {
    crumb: string | string[] | ((data: any) => string | string[])
  }
}
function App() {
  const rawMatches = useMatches()

  // Typecast safely
  const matches = rawMatches as MatchType[]
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* HEADER */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />

            <Separator
              orientation="vertical"
              className="h-5 shrink-0"
            />
            {/* Dynamic Breadcrumb */}
            <BreadCrumbLayout matches={matches}/>
          </div>

          <ModeToggle />
        </header>

        {/* PAGE CONTENT */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
