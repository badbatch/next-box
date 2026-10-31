import { isObjectType, isPlainObject, prop, stringToPath } from 'remeda';
import { type SettingsSource } from '#types/Source.types.ts';

export interface RemoteSourceOptions {
  fetch: typeof globalThis.fetch;
  name?: string;
  responsePath?: string;
  url: string;
}

export class RemoteSource implements SettingsSource {
  private fetch: typeof globalThis.fetch;
  private responsePath?: string;
  private url: string;
  public name: string;

  public constructor(options: RemoteSourceOptions) {
    this.fetch = options.fetch;
    this.url = options.url;
    this.name = options.name ?? `remote:${this.url}`;
    this.responsePath = options.responsePath;
  }

  async load(): Promise<Record<string, unknown>> {
    if (typeof this.fetch !== 'function') {
      throw new TypeError('RemoteSource requires fetch, which is unavailable in this runtime.');
    }

    const response = await this.fetch(this.url);

    if (!response.ok) {
      throw new Error(`Failed to load settings from "${this.url}": ${String(response.status)} ${response.statusText}`);
    }

    let value: unknown = await response.json();

    if (this.responsePath && !isObjectType(value)) {
      throw new Error(`Fetched value must be an object type if response path is provided, but was ${typeof value}.`);
    }

    // @ts-expect-error Unable to statically type string literal
    value = this.responsePath ? prop(value, ...stringToPath(this.responsePath)) : value;

    if (!isPlainObject(value)) {
      throw new Error(`JSON settings from "${this.url}" must contain an object at the root.`);
    }

    return value;
  }
}
