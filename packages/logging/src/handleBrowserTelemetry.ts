import { type Logger } from '@logtape/logtape';
import { z } from 'zod';

const payloadSchema = z.strictObject({
  message: z.string(),
  requestId: z.uuid().optional(),
});

export const handleBrowserTelemetry = async (
  request: Request,
  _routeContext: unknown,
  { logger }: { logger: Logger },
): Promise<Response> => {
  if (request.headers.get('content-type')?.split(';', 1)[0]?.trim() !== 'application/json') {
    return new Response(undefined, { status: 415 });
  }

  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return new Response(undefined, { status: 400 });
  }

  const payload = payloadSchema.safeParse(input);

  if (!payload.success) {
    return new Response(undefined, { status: 400 });
  }

  // The browser may be reporting a different request from this telemetry POST.
  const { message, requestId: browserRequestId } = payload.data;

  logger.getChild('browser').warn('{message}', {
    browserRequestId,
    message,
    source: 'browser',
  });

  return new Response(undefined, { status: 204 });
};
