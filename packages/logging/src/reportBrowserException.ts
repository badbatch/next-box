import { getLogger } from '@logtape/logtape';

const logger = getLogger(['application', 'browser']);
const reportedExceptions = new WeakSet<object>();

export const reportBrowserException = (error: unknown): void => {
  if (typeof error === 'object' && error !== null) {
    if (reportedExceptions.has(error)) {
      return;
    }

    reportedExceptions.add(error);
  }

  if (error instanceof Error) {
    logger.error('{message}', { message: error.message, stack: error.stack });
    return;
  }

  logger.error('{message}', { message: typeof error === 'string' ? error : 'Unknown browser exception' });
};
