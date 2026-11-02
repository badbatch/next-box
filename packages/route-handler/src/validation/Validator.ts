import { type NextRequest } from 'next/server.js';
import { type ValidationError } from '#errors/ValidationError.ts';
import { type RouteContext } from '#types.ts';

export type ValidateResult = [success: boolean, error?: ValidationError];

export interface Validator {
  // Need to keep as permissive as possible for internal type alignment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(request: NextRequest, routeContext: RouteContext<any>): Promise<ValidateResult | undefined>;
}
