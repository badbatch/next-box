export interface ValidationIssue {
  message: string;
  path: (string | number)[];
}

export class ValidationError extends Error {
  public readonly name = 'ValidationError';
  public issues: ValidationIssue[];

  constructor(issues: ValidationIssue[], message = 'Request validation failed') {
    super(message);
    this.issues = issues;
  }
}

const isValidationIssue = (value: unknown): value is ValidationIssue => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('message' in value) || !('path' in value)) {
    return false;
  }

  return (
    typeof value.message === 'string' &&
    Array.isArray(value.path) &&
    value.path.every((part: unknown) => typeof part === 'string' || typeof part === 'number')
  );
};

const isUnknownArray = (value: unknown): value is unknown[] => Array.isArray(value);

export const createValidationError = (error: unknown): ValidationError => {
  if (error instanceof ValidationError) {
    return error;
  }

  if (typeof error === 'object' && error !== null && 'issues' in error) {
    const rawIssues: unknown = error.issues;

    if (isUnknownArray(rawIssues)) {
      const issues: ValidationIssue[] = [];

      for (const issue of rawIssues) {
        if (isValidationIssue(issue)) {
          issues.push(issue);
        }
      }

      if (issues.length > 0) {
        return new ValidationError(issues);
      }
    }
  }

  return new ValidationError([
    {
      message: error instanceof Error ? error.message : String(error),
      path: [],
    },
  ]);
};
