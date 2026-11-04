import { describe, expect, it } from '@jest/globals';
import { isEnvsMessage } from './isEnvsMessage.ts';

describe('isEnvsMessage', () => {
  it('When data has the envs message type, then it returns true', () => {
    // Arrange
    const data: unknown = { payload: { NEXT_PUBLIC_LANGUAGE_CODE: 'en' }, type: 'envs' };

    // Act
    const isMessage = isEnvsMessage(data);

    // Assert
    expect(isMessage).toBe(true);
  });

  it('When data is null, primitive, or has another message type, then it returns false', () => {
    // Arrange
    // Required for test scenario
    // eslint-disable-next-line unicorn/no-null
    const values: unknown[] = [null, undefined, 'envs', 42, {}, { type: 'other' }];

    // Act
    const results = values.map(value => isEnvsMessage(value));

    // Assert
    expect(results).toEqual([false, false, false, false, false, false]);
  });
});
