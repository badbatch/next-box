/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { type LogRecord } from '@logtape/logtape';
import { TextEncoder } from 'node:util';

// The jsdom test environment needs the encoder used by LogTape's formatters.
Reflect.set(globalThis, 'TextEncoder', TextEncoder);

const { configureSync, resetSync } = await import('@logtape/logtape');
const { installBrowserExceptionCapture, reportBrowserException } = await import('./browser.ts');

describe('browser exception capture', () => {
  let records: LogRecord[];
  let removeListeners: (() => void) | undefined;

  beforeEach(() => {
    records = [];

    configureSync({
      loggers: [
        { category: ['application', 'browser'], lowestLevel: 'error', sinks: ['test'] },
        { category: ['logtape', 'meta'], lowestLevel: 'warning', sinks: ['test'] },
      ],
      sinks: {
        test: record => {
          records.push(record);
        },
      },
    });
  });

  afterEach(() => {
    removeListeners?.();
    removeListeners = undefined;
    resetSync();
  });

  it('When a window listener and a boundary see the same Error, then one error record includes its stack', () => {
    // Arrange
    const error = new Error('Render failed');
    removeListeners = installBrowserExceptionCapture();

    // Act
    dispatchEvent(new ErrorEvent('error', { error }));
    reportBrowserException(error);

    // Assert
    expect(records).toHaveLength(1);

    expect(records[0]).toMatchObject({
      category: ['application', 'browser'],
      level: 'error',
      properties: { message: 'Render failed', stack: error.stack },
    });
  });

  it('When an unhandled promise rejects with a string, then that string is reported', () => {
    // Arrange
    removeListeners = installBrowserExceptionCapture();
    const rejection = Object.assign(new Event('unhandledrejection'), { reason: 'Connection failed' });

    // Act
    dispatchEvent(rejection);

    // Assert
    expect(records.map(record => record.properties)).toEqual([{ message: 'Connection failed' }]);
  });

  it('When a rejection contains a non-error object, then the report omits its contents', () => {
    // Arrange
    const error = { privateData: 'private' };

    // Act
    reportBrowserException(error);

    // Assert
    expect(records.map(record => record.properties)).toEqual([{ message: 'Unknown browser exception' }]);
  });

  it('When an error is filtered out or listeners have been removed, then no record is emitted', () => {
    // Arrange
    const serverError = new Error('Server failure');
    const remove = installBrowserExceptionCapture({ shouldReport: error => error !== serverError });

    // Act
    dispatchEvent(Object.assign(new Event('unhandledrejection'), { reason: serverError }));
    remove();
    dispatchEvent(Object.assign(new Event('unhandledrejection'), { reason: new Error('After cleanup') }));

    // Assert
    expect(records).toHaveLength(0);
  });
});
