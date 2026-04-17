interface AppEnv {
  BE_URL: string
  WORKSPACE_ID: string
  PROJECT_NAME: string
}

function required(key: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required env: ${key}`)
  return value
}

export const env: AppEnv = {
  BE_URL: required('VITE_BE_URL', import.meta.env.VITE_BE_URL),
  WORKSPACE_ID: required('VITE_WORKSPACE_ID', import.meta.env.VITE_WORKSPACE_ID),
  PROJECT_NAME: import.meta.env.VITE_PROJECT_NAME ?? 'hj-adlog',
}
