import { type ZodType, type output } from 'zod';

export class ConfigValidator<T extends ZodType> {
  private readonly schema: T;

  constructor(schema: T) {
    this.schema = schema;
  }

  validate(value: unknown): output<T> {
    return this.schema.parse(value);
  }
}
