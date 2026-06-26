/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ORDER_WEBHOOK_URL?: string;
  readonly VITE_ORDER_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
