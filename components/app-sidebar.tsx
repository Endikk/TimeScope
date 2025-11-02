"use client"

import * as React from "react"
import {
  Home,
  Settings,
  Calendar,
  Contact,
  BarChart3,
  Sparkles
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CURRENT_USER } from "@/lib/config/user"
import Link from "next/link"
import { useRouter } from "next/router"

// Navigation items
const data = {
  navMain: [
    {
      title: "Accueil",
      url: "/home",
      icon: Home,
    },
    {
      title: "Contact", 
      url: "/contact",
      icon: Contact,
    },
    {
      title: "Admin",
      url: "/admin",
      icon: Settings,
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { state } = useSidebar()
  
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-gray-900">TimeScope</span>
            <span className="truncate text-xs text-gray-500">Gestion du temps</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Section User */}
        <SidebarGroup>
          <div className="flex items-center gap-3 px-2 py-2 bg-gray-50 rounded-lg mx-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={CURRENT_USER.avatar} alt={CURRENT_USER.name} />
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {CURRENT_USER.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-gray-900">
                  {CURRENT_USER.name}
                </span>
                {state === "expanded" && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    {CURRENT_USER.status}
                  </Badge>
                )}
              </div>
              {state === "expanded" && (
                <p className="truncate text-xs text-gray-500">{CURRENT_USER.email}</p>
              )}
            </div>
          </div>
        </SidebarGroup>

        {/* Section Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={router.pathname === item.url}
                    className="w-full"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section Status/Stats */}
        <SidebarGroup>
          <SidebarGroupLabel>Suivi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full">
                  <BarChart3 className="h-4 w-4" />
                  <span>Statistiques</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full">
                  <Calendar className="h-4 w-4" />
                  <span>Planning</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-2 py-2">
          {state === "expanded" && (
            <div className="text-xs text-gray-500 text-center">
              v1.0.0 • TimeScope
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}