import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Home, LogOut, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from './AuthProvider'

const APP_NAME = 'App'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()

  // Shared nav used by the mobile drawer. Labels always visible here.
  const navContent = (
    <>
      <NavLink
        to="/"
        end
        onClick={() => setMobileOpen(false)}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-2 px-2 py-1.5 rounded text-sm',
            isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
          )
        }
      >
        <Home className="h-4 w-4 shrink-0" />
        <span>Home</span>
      </NavLink>
      {/* TODO: add nav items */}
    </>
  )

  return (
    <div className="flex min-h-[100dvh] bg-background">
      {/* Desktop sidebar (sticky to viewport) */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r bg-muted/40 transition-[width] duration-200 sticky top-0 h-[100dvh] shrink-0',
          collapsed ? 'w-14' : 'w-60',
        )}
      >
        <div className="border-b">
          <div className="flex items-center justify-between p-3">
            {!collapsed && <span className="font-semibold text-sm">{APP_NAME}</span>}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 ml-auto"
              onClick={() => setCollapsed(c => !c)}
              aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-2 py-1.5 rounded text-sm',
                isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
              )
            }
          >
            <Home className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Home</span>}
          </NavLink>
          {/* TODO: add nav items */}
        </nav>

        <div className="border-t p-2 space-y-1">
          {user && !collapsed && (
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs text-muted-foreground truncate">
                {user.username}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={logout}
                aria-label="로그아웃"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-10 flex items-center gap-2 border-b bg-muted/40 px-3 py-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="메뉴 열기">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-3">
              <SheetHeader className="border-b pb-3 mb-2">
                <SheetTitle className="text-left text-sm">{APP_NAME}</SheetTitle>
              </SheetHeader>
              <nav className="space-y-1">
                {navContent}
              </nav>
              <div className="border-t mt-4 pt-3 space-y-1">
                {user && (
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-xs text-muted-foreground truncate">
                      {user.username}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => { logout(); setMobileOpen(false) }}
                      aria-label="로그아웃"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-semibold text-sm">{APP_NAME}</span>
        </div>

        <main className="flex-1 md:overflow-auto">
          <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
