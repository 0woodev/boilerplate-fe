interface AppEnv {
  BE_URL: string
  PROJECT_NAME: string
  USE_MSW: boolean
}

function orDefault(value: string | undefined, fallback: string): string {
  return value && value.length > 0 ? value : fallback
}

export const env: AppEnv = {
  // MSW 모드에서는 실제 호출이 안 나가므로 placeholder면 충분
  BE_URL: orDefault(import.meta.env.VITE_BE_URL, 'http://localhost:0'),
  PROJECT_NAME: orDefault(import.meta.env.VITE_PROJECT_NAME, 'boilerplate-app'),
  // VITE_USE_MSW 명시 설정 우선, 미설정 시 DEV 모드면 ON
  USE_MSW: import.meta.env.VITE_USE_MSW
    ? import.meta.env.VITE_USE_MSW === 'true'
    : import.meta.env.DEV,
}
