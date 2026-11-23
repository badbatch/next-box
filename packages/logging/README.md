# @next-box/logging

Structured server and browser logging for Next.js applications.

[![npm version](https://badge.fury.io/js/%40next-box%2Flogging.svg)](https://badge.fury.io/js/%40next-box%2Flogging)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Next.js applications can use LogTape to log from both runtimes and send selected browser events through an authenticated route. The server can export structured records over OTLP to an OpenTelemetry Collector or write JSON lines to stdout.

## Installation

```shell
npm add @next-box/logging @next-box/route-handler
```

## Usage

### Configure server logging

Call the server initializer from the application's `instrumentation.ts`. The runtime guard keeps the Node.js OpenTelemetry exporter out of Edge instrumentation.

```ts
export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  const { configureServerLogging } = await import('@next-box/logging/server');
  await configureServerLogging();
};
```

The server routes `application` logs at info level and above to its application sink. Configure the OTLP destination through the server environment.

- `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` sets the full logs URL, such as `http://localhost:4318/v1/logs`.
- `OTEL_EXPORTER_OTLP_ENDPOINT` sets the base OTLP URL when the logs-specific endpoint is unset. The HTTP exporter appends `/v1/logs`.
- `OTEL_SERVICE_NAME` sets the service name and defaults to `application`.

With no endpoint configured, the application sink writes JSON lines to stdout. LogTape's own warnings go to stdout in either setup. The Collector decides where to send OTLP logs.

### Add a request-scoped logger

Register `withLogger` from `@next-box/logging/server` in an existing [route-handler](../route-handler/README.md) middleware chain after the middleware that provides `requestId` and `correlationId`. The route receives a logger in its handler context. Each log record carries both IDs, including records written by child loggers.

```ts
import { withLogger } from '@next-box/logging/server';
import { createHandlerFactory } from '@next-box/route-handler';
import { withCorrelationId, withRequestId } from './requestMiddleware.ts';

export const createHandler = createHandlerFactory({
  middleware: [withRequestId, withCorrelationId, withLogger],
});
```

### Forward browser events

Call the browser initializer from `instrumentation-client.ts`. The default telemetry endpoint is `/api/telemetry/client`. Set `telemetryEndpoint` in the options object to use a different path.

```ts
import { configureBrowserLogging } from '@next-box/logging/browser';

configureBrowserLogging({ telemetryEndpoint: '/api/telemetry/client' });
```

Mount the ingestion handler at that path using the application's authenticated route factory. The factory must provide the logger from `withLogger`.

```ts
import { handleBrowserTelemetry } from '@next-box/logging/server';
import { createApiHandler } from './createApiHandler.ts';

export const POST = createApiHandler({ handler: handleBrowserTelemetry });
```

Browser warnings and higher from the `application.browser` category go to the console. The browser sink also forwards the rendered message, an optional UUID `requestId`, and an optional string `stack` on a best-effort basis. The handler records the reported ID as `browserRequestId`, alongside the telemetry request's own IDs, and keeps `stack` as a separate log attribute.

```ts
import { getLogger } from '@next-box/logging';

const logger = getLogger(['application', 'browser']);
const reportError = (error: Error): void => {
  logger.error('{message}', { message: error.message, stack: error.stack });
};
```

## Changelog

See the [changelog](../../CHANGELOG.md) for features, fixes, and other changes included in each major, minor, and patch release.

## License

`@next-box/logging` is [MIT Licensed](LICENSE).
