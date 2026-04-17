/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BE_URL: string
  readonly VITE_WORKSPACE_ID: string
  readonly VITE_PROJECT_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
