/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BE_URL?: string
  readonly VITE_PROJECT_NAME?: string
  readonly VITE_USE_MSW?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
