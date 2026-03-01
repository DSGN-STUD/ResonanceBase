'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from '@/components/ui/sidebar'
import { LayoutDashboard, Search, Users, MessageSquare, UserCircle, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Find Matches', href: '/search', icon: Search },
  { title: 'Connections', href: '/connections', icon: Users },
  { title: 'Messages', href: '/messages', icon: MessageSquare },
  { title: 'My Profile', href: '/profile/me', icon: UserCircle },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard">
          <span className="text-lg font-semibold text-sidebar-foreground">Resonate</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link 
                        href={item.href}
                        className={`transition-colors duration-150 ${
                          isActive 
                            ? 'bg-primary text-primary-foreground rounded-lg' 
                            : 'text-muted-foreground hover:bg-sidebar-accent'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
