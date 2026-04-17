interface AppEnv {
  BE_URL: string
  WORKSPACE_ID: string
  PROJECT_NAME: string
  USE_MSW: boolean
}

function orDefault(value: string | undefined, fallback: string): string {
  return value && value.length > 0 ? value : fallback
}

export const env: AppEnv = {
  // MSW mode does not make real requests, so a placeholder is fine
  BE_URL: orDefault(import.meta.env.VITE_BE_URL, 'http://localhost:0'),
  WORKSPACE_ID: orDefault(import.meta.env.VITE_WORKSPACE_ID, 'dev-workspace-01'),
  PROJECT_NAME: orDefault(import.meta.env.VITE_PROJECT_NAME, 'my-app'),
  // Explicit VITE_USE_MSW takes precedence; otherwise ON in dev mode
  USE_MSW: import.meta.env.VITE_USE_MSW
    ? import.meta.env.VITE_USE_MSW === 'true'
    : import.meta.env.DEV,
}
