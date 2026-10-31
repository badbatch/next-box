import { isPlainObject } from 'remeda';
import { type Get } from 'type-fest';
import { type Path, type Scope, type ConfigReader as ZcbConfigReader, createConfigReader } from 'zcb';

export class ConfigReader<T extends object> {
  private reader: ZcbConfigReader<T>;
  private readonly config: T;

  constructor(config: T) {
    this.config = config;
    this.reader = createConfigReader(config);
  }

  private getAt(path: string): unknown {
    return path.split('.').reduce<unknown>((current, key) => {
      if (!isPlainObject(current)) {
        return;
      }

      return current[key];
    }, this.config);
  }

  public get<P extends Path<T>>(path: P): Get<T, P> {
    return this.reader.read(path);
  }

  public getSection<P extends Scope<T>>(path: P): Get<T, P> {
    // Required as underlying getAt needs to be kept permissive
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.getAt(path) as Get<T, P>;
  }

  public has(path: string): boolean {
    return this.getAt(path) !== undefined;
  }

  public read(path: string): unknown {
    return this.getAt(path);
  }

  public scope<P extends Scope<T>>(path: P): ZcbConfigReader<Get<T, P>> {
    return this.reader.scope(path);
  }
}
