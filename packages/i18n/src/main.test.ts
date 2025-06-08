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
  it('should return an instance of the i18n reader', () => {
    expect(createI18n(content)).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      t: expect.any(Function),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      tt: expect.any(Function),
    });
  });
});

describe('tt', () => {
  describe('when a key path does not resolves to a value', () => {
    it('should throw the expected error', () => {
      const { tt } = createI18n(content);
      // @ts-expect-error intentional to test runtime behaviour
      expect(() => tt('zebra')).toThrow('Path "zebra" did not resolve to a value');
    });
  });

  describe('when a key path resolves to a value', () => {
    it('should return the value', () => {
      const { tt } = createI18n(content);
      expect(tt('alpha')).toBe('alpha');
    });
  });

  describe('when a nested key path resolves to a value', () => {
    it('should return the value', () => {
      const { tt } = createI18n(content);
      expect(tt('echo.golf.0.hotel.india')).toBe('india');
    });
  });

  describe('when the value has a template variable and variables are passed in', () => {
    it('should return the value with the variable injected into the value', () => {
      const { tt } = createI18n(content);
      expect(tt('charlie', { adjective: 'good' })).toBe('charlie is a good boy');
    });
  });

  describe('when the value has multiple template variable and variables are passed in', () => {
    it('should return the value with the variable injected into the value', () => {
      const { tt } = createI18n(content);

      expect(tt('echo.golf.0.hotel.julia', { activity: 'gymnast', adjective: 'great' })).toBe(
        'julia is a great gymnast',
      );
    });
  });
});

describe('t', () => {
  describe('when a key path does not resolves to a value', () => {
    it('should return undefined', () => {
      const { t } = createI18n(content);
      expect(t('zebra')).toBeUndefined();
    });
  });

  describe('when a key path resolves to a value', () => {
    it('should return the value', () => {
      const { t } = createI18n(content);
      expect(t('alpha')).toBe('alpha');
    });
  });

  describe('when a nested key path resolves to a value', () => {
    it('should return the value', () => {
      const { t } = createI18n(content);
      expect(t('echo.golf.0.hotel.india')).toBe('india');
    });
  });

  describe('when the value has a template variable and variables are passed in', () => {
    it('should return the value with the variable injected into the value', () => {
      const { t } = createI18n(content);
      expect(t('charlie', { adjective: 'good' })).toBe('charlie is a good boy');
    });
  });

  describe('when the value has multiple template variable and variables are passed in', () => {
    it('should return the value with the variable injected into the value', () => {
      const { t } = createI18n(content);

      expect(t('echo.golf.0.hotel.julia', { activity: 'gymnast', adjective: 'great' })).toBe(
        'julia is a great gymnast',
      );
    });
  });
});
