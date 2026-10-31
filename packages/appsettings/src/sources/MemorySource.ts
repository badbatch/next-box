import { clone } from 'remeda';
import { type SettingsSource } from '../types/Source.types.ts';

export interface MemorySourceOptions {
  name?: string;
  values: Record<string, unknown>;
}

export class MemorySource implements SettingsSource {
  private readonly values: Record<string, unknown>;
  public readonly name: string;

  public constructor(options: MemorySourceOptions) {
    this.name = options.name ?? 'memory';
    this.values = options.values;
  }

  load(): Promise<Record<string, unknown>> {
    return Promise.resolve(clone(this.values));
  }
}
