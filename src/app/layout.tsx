import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Home, Menu, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { env } from '@/lib/env'

const NAV_ITEMS = [
  { to: '/home', label: 'Home', icon: Home },
  // 도메인별 항목 추가
]

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = (onClick?: () => void) =>
    NAV_ITEMS.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-2 px-2 py-1.5 rounded text-sm',
            isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
          )
        }
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{label}</span>}
      </NavLink>
    ))

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r bg-muted/40 transition-[width] duration-200',
          collapsed ? 'w-14' : 'w-60',
        )}
      >
        <div className="flex items-center justify-between p-3 border-b">
          {!collapsed && <span className="font-semibold text-sm">{env.PROJECT_NAME}</span>}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 ml-auto"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navLinks()}
        </nav>

        <div className="border-t p-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-2 py-1.5 rounded text-sm',
                isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
              )
            }
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-2 border-b bg-muted/40 px-3 py-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-3">
              <SheetHeader className="border-b pb-3 mb-2">
                <SheetTitle className="text-left text-sm">{env.PROJECT_NAME}</SheetTitle>
              </SheetHeader>
              <nav className="space-y-1">
                {navLinks(() => setMobileOpen(false))}
              </nav>
              <div className="border-t mt-4 pt-3">
                <NavLink
                  to="/settings"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded text-sm',
                      isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
                    )
                  }
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>Settings</span>
                </NavLink>
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-semibold text-sm">{env.PROJECT_NAME}</span>
        </div>

        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
