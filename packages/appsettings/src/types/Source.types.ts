export interface SettingsSource {
  load(): Promise<Record<string, unknown>>;
  readonly name: string;
}
