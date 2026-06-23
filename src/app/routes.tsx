import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { PatchNotesPage } from '@/features/patch-notes/PatchNotesPage'
import { AuthGuard, LoginGuard } from './AuthGuard'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <LoginGuard>
        <LoginPage />
      </LoginGuard>
    ),
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'patch-notes', element: <PatchNotesPage /> },
      // TODO: add protected routes
    ],
  },
])
