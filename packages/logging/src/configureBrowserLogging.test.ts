/** @jest-environment node */
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { getLogger, resetSync } from '@logtape/logtape';
import { configureBrowserLogging } from './browser.ts';

afterEach(() => {
  resetSync();
  jest.restoreAllMocks();
});

describe('configureBrowserLogging', () => {
  it('When a browser warning has a message and request ID, then it forwards them to the configured endpoint', () => {
    // Arrange
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(undefined, { status: 204 }));
    const warn = jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    const logger = getLogger(['application', 'browser', 'records']);
    const requestId = crypto.randomUUID();
    configureBrowserLogging({ telemetryEndpoint: '/custom/telemetry' });

    // Act
    logger.warn('Could not load {resource}', { requestId, resource: 'records', search: 'private' });

    // Assert
    expect(warn).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch).toHaveBeenCalledWith('/custom/telemetry', {
      body: JSON.stringify({ message: 'Could not load records', requestId }),
      headers: { 'content-type': 'application/json' },
      keepalive: true,
      method: 'POST',
    });
  });

  it('When browser logs include a warning without a request ID and an info record, then only the warning is forwarded', () => {
    // Arrange
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(undefined, { status: 204 }));
    const warn = jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    const logger = getLogger(['application', 'browser']);
    configureBrowserLogging();

    // Act
    logger.warn('Local warning');
    logger.info('Ignored info');

    // Assert
    expect(warn).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch).toHaveBeenCalledWith(
      '/api/telemetry/client',
      expect.objectContaining({ body: JSON.stringify({ message: 'Local warning' }) }),
    );
  });
});
