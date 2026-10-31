import { resolve } from 'node:path';
import { ConfigMerger } from '#config/ConfigMerger.ts';
import { loadJson } from '#sources/helpers/loadJson.ts';
import { type SettingsSource } from '../types/Source.types.ts';

export interface AppSettingsSourceOptions {
  directory?: string;
  environment?: string;
  name?: string;
}

export class AppSettingsSource implements SettingsSource {
  private directory: string;
  private environment: string;
  public name: string;

  public constructor(options: AppSettingsSourceOptions) {
    this.directory = options.directory ?? process.cwd();
    this.environment = options.environment ?? process.env.NODE_ENV ?? 'development';
    this.name = options.name ?? `appsettings:${this.environment}`;
  }

  async load(): Promise<Record<string, unknown>> {
    const basePath = resolve(this.directory, 'appsettings.json');
    const environmentPath = resolve(this.directory, `appsettings.${this.environment}.json`);
    const base = await loadJson(basePath, false);
    const override = (await loadJson(environmentPath, true)) ?? {};
    return new ConfigMerger().merge(base, override);
  }
}
