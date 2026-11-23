/** @jest-environment node */
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { getLogger } from '@logtape/logtape';
import { handleBrowserTelemetry } from './handleBrowserTelemetry.ts';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('handleBrowserTelemetry', () => {
  it.each([
    ['with a stack', 'Error: Records could not be loaded\n    at loadRecords'],
    ['without a stack', undefined],
  ])(
    'When a browser message arrives %s, then the handler logs its fields and preserves the reported request ID',
    async (_scenario, stack) => {
      // Arrange
      const logger = getLogger(['application']);
      const warn = jest.spyOn(logger.getChild('browser'), 'warn');
      const browserRequestId = crypto.randomUUID();

      const request = new Request('http://localhost/api/telemetry/client', {
        body: JSON.stringify({ message: 'Records could not be loaded', requestId: browserRequestId, stack }),
        headers: { 'content-type': 'application/json; charset=utf-8' },
        method: 'POST',
      });

      // Act
      const response = await handleBrowserTelemetry(request, {}, { logger });

      // Assert
      expect(response.status).toBe(204);

      expect(warn.mock.calls).toEqual([
        ['{message}', { browserRequestId, message: 'Records could not be loaded', source: 'browser', stack }],
      ]);
    },
  );

  it.each([
    ['the media type is unsupported', 'text/plain', '{"message":"Browser warning"}', 415],
    ['the body is malformed JSON', 'application/json', '{', 400],
    ['the message is missing', 'application/json', '{}', 400],
    ['the message is not a string', 'application/json', '{"message":42}', 400],
    ['the request ID is invalid', 'application/json', '{"message":"Browser warning","requestId":"bad-id"}', 400],
    ['the stack is not a string', 'application/json', '{"message":"Browser warning","stack":42}', 400],
    ['the payload contains extra fields', 'application/json', '{"message":"Browser warning","extra":true}', 400],
  ])('When %s, then the handler rejects the request without logging it', async (_scenario, mediaType, body, status) => {
    // Arrange
    const logger = getLogger(['application']);
    const childLogger = jest.spyOn(logger, 'getChild');

    const request = new Request('http://localhost/api/telemetry/client', {
      body,
      headers: { 'content-type': mediaType },
      method: 'POST',
    });

    // Act
    const response = await handleBrowserTelemetry(request, {}, { logger });

    // Assert
    expect(response.status).toBe(status);
    expect(childLogger).not.toHaveBeenCalled();
  });
});
