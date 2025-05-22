/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_API_BASE_URL: string | undefined;
    readonly PROD: boolean;
    [key: string]: string | boolean | undefined;
  };
} 