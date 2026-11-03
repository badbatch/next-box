import { describe, expect, it } from '@jest/globals';
import { z } from 'zod';
import { ConfigValidator } from './ConfigValidator.ts';

describe('ConfigValidator', () => {
  it('When a value matches the schema, then it returns the parsed value', () => {
    // Arrange
    const schema = z.object({ Api: z.object({ Timeout: z.number() }) });
    const validator = new ConfigValidator(schema);
    const value = { Api: { Timeout: 5000 } };

    // Act
    const result = validator.validate(value);

    // Assert
    expect(result).toEqual(value);
  });

  it('When a value does not match the schema, then it throws the schema validation error', () => {
    // Arrange
    const validator = new ConfigValidator(z.object({ Api: z.object({ Timeout: z.number() }) }));

    // Act
    const validateInvalidValue = () => validator.validate({ Api: { Timeout: 'slow' } });

    // Assert
    expect(validateInvalidValue).toThrow();
  });
});
