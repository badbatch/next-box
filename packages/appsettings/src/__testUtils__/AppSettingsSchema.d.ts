declare module '../index.ts' {
  interface AppSettingsSchema {
    Api: { Missing?: string; Timeout: number };
    Features: { DarkMode: boolean };
    Missing: { Value: string };
  }
}

export {};
