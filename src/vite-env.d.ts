/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  // Add your VITE_* env vars here for type safety
  // Example: readonly VITE_WEATHER_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
