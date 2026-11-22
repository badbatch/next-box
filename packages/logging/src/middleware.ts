import { type Logger, getLogger } from '@logtape/logtape';
import { type Middleware } from '@next-box/route-handler';

const applicationLogger = getLogger(['application']);

export const withLogger: Middleware<
  Record<string, string>,
  { correlationId: string; requestId: string },
  { logger: Logger }
> = async (_request, _routeContext, { correlationId, requestId }, next) => {
  const logger = applicationLogger.with({ correlationId, requestId });
  return next({ context: { logger } });
};
