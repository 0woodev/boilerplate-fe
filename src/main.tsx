import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { env } from '@/lib/env'

async function prepare() {
  if (env.USE_MSW) {
    const { worker } = await import('./test/msw/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }
}

prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
