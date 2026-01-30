import * as React from "react"
import {
  IconChefHat,
  IconDashboard,
  IconFileDescription,
  IconLeaf,
  IconSettings,
  IconToolsKitchen2,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "react-router"

interface AppSidebarUser {
  id: string
  name: string
  email: string
  image?: string | null
}

const data = {
  navMain: [
    {
      title: "Home",
      url: "/admin/",
      icon: IconDashboard,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
    },
    {
      title: "Recipes",
      url: "/admin/recipes",
      icon: IconChefHat,
    },
    {
      title: "Ingredients",
      url: "/admin/ingredients",
      icon: IconLeaf,
    },
    {
      title: "Docs",
      url: "/admin/docs",
      icon: IconFileDescription,
    },
    {
      title: "Kitchen Sink",
      url: "/admin/kitchen-sink",
      icon: IconSettings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/admin/">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
