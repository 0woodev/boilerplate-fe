import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './layout'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { env } from '@/lib/env'
import { api } from '@/lib/api'

interface HealthResponse {
  status: string
  timestamp: string
}

function HomePage() {
  const [health, setHealth] = useState<{ data?: HealthResponse; error?: string; loading: boolean }>({
    loading: false,
  })

  const checkHealth = async () => {
    setHealth({ loading: true })
    try {
      const data = await api.get<HealthResponse>('/health')
      setHealth({ data, loading: false })
    } catch (err) {
      setHealth({ error: err instanceof Error ? err.message : 'Unknown error', loading: false })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{env.PROJECT_NAME}</h1>
        <p className="text-muted-foreground mt-1">
          Start building by adding routes and pages.
        </p>
      </div>

      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-base">API Health Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            BE: <code className="text-xs bg-muted px-1 py-0.5 rounded">{env.BE_URL}</code>
          </p>
          <Button onClick={checkHealth} disabled={health.loading} size="sm">
            {health.loading ? 'Checking...' : 'Check Health'}
          </Button>
          {health.data && (
            <div className="text-sm space-y-1">
              <p>Status: <span className="font-medium text-green-600">{health.data.status}</span></p>
              <p className="text-xs text-muted-foreground">{health.data.timestamp}</p>
            </div>
          )}
          {health.error && (
            <p className="text-sm text-red-600">{health.error}</p>
          )}
        </CardContent>
      </Card>
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
