import { describe, expect, it } from '@jest/globals';
import { createI18n } from './main.ts';

const content = {
  alpha: 'alpha',
  bravo: 'bravo',
  charlie: 'charlie is a {{adjective}} boy',
  delta: 'delta',
  echo: {
    foxtrot: 'foxtrot',
    golf: [
      {
        hotel: {
          india: 'india',
          julia: 'julia is a {{adjective}} {{activity}}',
        },
      },
    ],
  },
} as const;

describe('createI18n', () => {
  it('When content is provided, then it returns typed and untyped resolver functions', () => {
    // Arrange

    // Act
    const result = createI18n(content);

    // Assert
    expect(result).toEqual({ t: expect.any(Function), tt: expect.any(Function) });
  });
});

describe('tt', () => {
  it('When a path does not resolve to a value, then it throws an error containing the path', () => {
    // Arrange
    const { tt } = createI18n(content);

    // Act
    // @ts-expect-error Intentionally pass an invalid path to test runtime behavior.
    const resolveInvalidPath = () => tt('zebra');

    // Assert
    expect(resolveInvalidPath).toThrow('Path "zebra" did not resolve to a value');
  });

  it('When a path resolves to a top-level value, then it returns that value', () => {
    // Arrange
    const { tt } = createI18n(content);

    // Act
    const result = tt('alpha');

    // Assert
    expect(result).toBe('alpha');
  });

  it('When a path resolves through nested objects and arrays, then it returns the nested value', () => {
    // Arrange
    const { tt } = createI18n(content);

    // Act
    const result = tt('echo.golf.0.hotel.india');

    // Assert
    expect(result).toBe('india');
  });

  it('When variables are provided for a template, then it returns the interpolated value', () => {
    // Arrange
    const { tt } = createI18n(content);

    // Act
    const result = tt('charlie', { adjective: 'good' });

    // Assert
    expect(result).toBe('charlie is a good boy');
  });

  it('When multiple variables are provided, then it interpolates each variable', () => {
    // Arrange
    const { tt } = createI18n(content);

    // Act
    const result = tt('echo.golf.0.hotel.julia', { activity: 'gymnast', adjective: 'great' });

    // Assert
    expect(result).toBe('julia is a great gymnast');
  });
});

describe('t', () => {
  it('When a path does not resolve to a value, then it returns undefined', () => {
    // Arrange
    const { t } = createI18n(content);

    // Act
    const result = t('zebra');

    // Assert
    expect(result).toBeUndefined();
  });

  it('When a path resolves to a top-level value, then it returns that value', () => {
    // Arrange
    const { t } = createI18n(content);

    // Act
    const result = t('alpha');

    // Assert
    expect(result).toBe('alpha');
  });

  it('When a path resolves through nested objects and arrays, then it returns the nested value', () => {
    // Arrange
    const { t } = createI18n(content);

    // Act
    const result = t('echo.golf.0.hotel.india');

    // Assert
    expect(result).toBe('india');
  });

  it('When variables are provided for a template, then it returns the interpolated value', () => {
    // Arrange
    const { t } = createI18n(content);

    // Act
    const result = t('charlie', { adjective: 'good' });

    // Assert
    expect(result).toBe('charlie is a good boy');
  });

  it('When multiple variables are provided, then it interpolates each variable', () => {
    // Arrange
    const { t } = createI18n(content);

    // Act
    const result = t('echo.golf.0.hotel.julia', { activity: 'gymnast', adjective: 'great' });

    // Assert
    expect(result).toBe('julia is a great gymnast');
  });
});
