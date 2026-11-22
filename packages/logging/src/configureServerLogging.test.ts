/** @jest-environment node */
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { getLogger, reset } from '@logtape/logtape';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { InMemoryLogRecordExporter } from '@opentelemetry/sdk-logs';
import { configureServerLogging } from './configureServerLogging.ts';

afterEach(async () => {
  await reset();
  jest.restoreAllMocks();
});

describe('configureServerLogging', () => {
  it('When neither OTLP endpoint is set, then application records are written as JSON lines to stdout', async () => {
    // Arrange
    jest.replaceProperty(process, 'env', {
      ...process.env,
      OTEL_EXPORTER_OTLP_ENDPOINT: undefined,
      OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: undefined,
    });

    const write = jest.spyOn(process.stdout, 'write').mockReturnValue(true);
    const logger = getLogger(['application']);

    // Act
    await configureServerLogging();
    logger.info('Record written', { requestId: 'request-1' });

    // Assert
    expect(write).toHaveBeenCalledTimes(1);
    const line = String(write.mock.calls[0]?.[0]);
    expect(line.endsWith('\n')).toBe(true);

    expect(JSON.parse(line)).toMatchObject({
      level: 'INFO',
      properties: { requestId: 'request-1' },
    });
  });

  it.each(['OTEL_EXPORTER_OTLP_ENDPOINT', 'OTEL_EXPORTER_OTLP_LOGS_ENDPOINT'])(
    'When %s is set, then the OTLP exporter receives application records with the configured service name',
    async endpoint => {
      // Arrange
      jest.replaceProperty(process, 'env', {
        ...process.env,
        OTEL_EXPORTER_OTLP_ENDPOINT: undefined,
        OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: undefined,
        OTEL_SERVICE_NAME: 'test-service',
        [endpoint]: 'http://localhost:4318',
      });

      const exporter = new InMemoryLogRecordExporter();

      jest.spyOn(OTLPLogExporter.prototype, 'export').mockImplementation((records, callback) => {
        exporter.export(records, callback);
      });

      const logger = getLogger(['application']);

      // Act
      await configureServerLogging();
      logger.info('Record exported', { requestId: 'request-2' });

      // Assert
      const records = exporter.getFinishedLogRecords();
      expect(records).toHaveLength(1);
      const [record] = records;
      expect(record?.resource.attributes).toMatchObject({ 'service.name': 'test-service' });
      expect(record?.attributes).toMatchObject({ requestId: 'request-2' });
    },
  );
});
