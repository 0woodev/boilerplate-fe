import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './layout'

function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome</h1>
      <p className="text-muted-foreground">
        This is a boilerplate app. Start building by adding routes and pages.
      </p>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: 'home', element: <HomePage /> },
      { path: 'settings', element: <h1 className="text-2xl font-semibold">Settings (TODO)</h1> },
    ],
  },
])
