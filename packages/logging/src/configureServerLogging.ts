import { type Sink, configure, jsonLinesFormatter } from '@logtape/logtape';
import { getOpenTelemetrySink } from '@logtape/otel';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';

const writeJsonToStdout: Sink = record => {
  process.stdout.write(jsonLinesFormatter(record));
};

const getCollectorSink = (serviceName: string): Sink => {
  const exporter = new OTLPLogExporter();

  const loggerProvider = new LoggerProvider({
    processors: [new SimpleLogRecordProcessor(exporter)],
    resource: resourceFromAttributes({ 'service.name': serviceName }),
  });

  return getOpenTelemetrySink({ loggerProvider });
};

export const configureServerLogging = async (): Promise<void> => {
  const { OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_EXPORTER_OTLP_LOGS_ENDPOINT, OTEL_SERVICE_NAME } = process.env;

  const hasCollector =
    Boolean(OTEL_EXPORTER_OTLP_LOGS_ENDPOINT?.trim()) || Boolean(OTEL_EXPORTER_OTLP_ENDPOINT?.trim());

  const applicationSink = hasCollector ? getCollectorSink(OTEL_SERVICE_NAME ?? 'application') : writeJsonToStdout;

  await configure({
    loggers: [
      { category: ['application'], lowestLevel: 'info', sinks: ['application'] },
      { category: ['logtape', 'meta'], lowestLevel: 'warning', sinks: ['stdout'] },
    ],
    reset: true,
    sinks: {
      application: applicationSink,
      stdout: writeJsonToStdout,
    },
  });
};
