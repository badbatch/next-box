import { configureSync, getConsoleSink, getTextFormatter } from '@logtape/logtape';

const formatMessage = getTextFormatter({ format: ({ message }) => message, value: 'bare' });

export type ConfigureBrowserLoggingOptions = {
  telemetryEndpoint?: string;
};

export const configureBrowserLogging = ({
  telemetryEndpoint = '/api/telemetry/client',
}: ConfigureBrowserLoggingOptions = {}): void => {
  configureSync({
    loggers: [
      { category: ['application', 'browser'], lowestLevel: 'warning', sinks: ['console', 'telemetry'] },
      { category: ['logtape', 'meta'], lowestLevel: 'warning', sinks: ['console'] },
    ],
    reset: true,
    sinks: {
      console: getConsoleSink(),
      telemetry: (record): void => {
        const { requestId, stack } = record.properties;
        const message = formatMessage(record).trimEnd();

        void fetch(telemetryEndpoint, {
          body: JSON.stringify({ message, requestId, stack: typeof stack === 'string' ? stack : undefined }),
          headers: { 'content-type': 'application/json' },
          keepalive: true,
          method: 'POST',
        }).catch(() => {
          // Browser telemetry delivery is best effort.
        });
      },
    },
  });
};
