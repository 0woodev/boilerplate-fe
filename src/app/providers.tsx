import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'
import { createQueryClient } from '@/lib/queryClient'
import { AuthProvider } from './AuthProvider'
import { Toaster } from '@/components/ui/toaster'

interface Props {
  children: ReactNode
}

export function Providers({ children }: Props) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
