import { capitalize, isPlainObject } from 'remeda';
import { type SettingsSource } from '../types/Source.types.ts';

export interface EnvironmentSourceOptions {
  envs: Record<string, string | undefined>;
  name?: string;
  prefix?: string;
}

export class EnvironmentSource implements SettingsSource {
  private readonly envs: Record<string, string | undefined>;
  private readonly prefix: string;

  private normalizeSegment = (value: string): string =>
    value
      .toLowerCase()
      .split('_')
      .filter(Boolean)
      .map(part => capitalize(part))
      .join('');

  public readonly name: string;

  public constructor(options: EnvironmentSourceOptions) {
    this.envs = options.envs;
    this.prefix = options.prefix ?? 'APP_';
    this.name = options.name ?? `environment:${this.prefix}`;
  }

  private parseEnvironmentValue(value: string): unknown {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    if (value.trim() !== '' && Number.isFinite(Number(value))) {
      return Number(value);
    }

    return value;
  }

  load(): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(this.envs)) {
      if (value === undefined || !key.startsWith(this.prefix)) {
        continue;
      }

      const path = key
        .slice(this.prefix.length)
        .split('__')
        .filter(Boolean)
        .map(part => this.normalizeSegment(part));

      const leaf = path.pop();

      if (!leaf) {
        continue;
      }

      let current = result;

      for (const part of path) {
        const next = current[part];

        if (!isPlainObject(next)) {
          current[part] = {};
        }

        const currentPart = current[part];

        if (isPlainObject(currentPart)) {
          current = currentPart;
        }
      }

      current[leaf] = this.parseEnvironmentValue(value);
    }

    return Promise.resolve(result);
  }
}
