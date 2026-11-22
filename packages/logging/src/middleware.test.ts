/** @jest-environment node */
import { afterEach, describe, expect, it } from '@jest/globals';
import { type LogRecord, configureSync, resetSync } from '@logtape/logtape';
import { NextRequest } from 'next/server.js';
import { withLogger } from './middleware.ts';

afterEach(resetSync);

describe('withLogger', () => {
  it('When requests overlap, then their child loggers retain the corresponding request and correlation IDs', async () => {
    // Arrange
    const records: LogRecord[] = [];

    configureSync({
      loggers: [
        { category: ['application'], lowestLevel: 'info', sinks: ['test'] },
        { category: ['logtape', 'meta'], lowestLevel: 'warning', sinks: ['test'] },
      ],
      sinks: {
        test: record => {
          records.push(record);
        },
      },
    });

    const contexts = [
      { correlationId: 'correlation-1', requestId: 'request-1' },
      { correlationId: 'correlation-2', requestId: 'request-2' },
    ];

    const request = new NextRequest('http://localhost/api/records');
    const release = Promise.withResolvers<undefined>();

    // Act
    const pendingResponses = contexts.map(context =>
      Promise.resolve(
        withLogger(request, {}, context, async options => {
          await release.promise;
          options?.context?.logger.getChild('records').info('Records loaded');

          return new Response(undefined, { status: 204 });
        }),
      ),
    );

    release.resolve(undefined);
    const responses = await Promise.all(pendingResponses);

    // Assert
    expect(responses.map(response => response.status)).toEqual([204, 204]);

    expect(records.map(record => record.category)).toEqual([
      ['application', 'records'],
      ['application', 'records'],
    ]);

    expect(records.map(record => record.properties)).toEqual(contexts);
  });
});
