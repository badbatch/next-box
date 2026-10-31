import { clone } from 'remeda';
import { freezeDeep } from '#config/helpers/freezeDeep.ts';

export class ConfigStore<T extends object> {
  private snapshot: Readonly<T>;

  public getSnapshot = (): Readonly<T> => this.snapshot;

  constructor(initial: T) {
    this.snapshot = freezeDeep(clone(initial));
  }
}
