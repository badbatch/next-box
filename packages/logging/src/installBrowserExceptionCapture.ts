import { reportBrowserException } from './reportBrowserException.ts';

export type BrowserExceptionCaptureOptions = {
  shouldReport?: (error: unknown) => boolean;
};

export const installBrowserExceptionCapture = ({ shouldReport }: BrowserExceptionCaptureOptions = {}): (() => void) => {
  const report = (error: unknown): void => {
    if (shouldReport?.(error) !== false) {
      reportBrowserException(error);
    }
  };

  const handleError = (event: ErrorEvent): void => {
    if (!(event instanceof ErrorEvent)) {
      return;
    }

    const error: unknown = event.error;
    report(error ?? event.message);
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const reason: unknown = event.reason;
    report(reason);
  };

  addEventListener('error', handleError);
  addEventListener('unhandledrejection', handleUnhandledRejection);

  return (): void => {
    removeEventListener('error', handleError);
    removeEventListener('unhandledrejection', handleUnhandledRejection);
  };
};
