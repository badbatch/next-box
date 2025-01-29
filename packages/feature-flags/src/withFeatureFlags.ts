import { cookies } from 'next/headers.js';
import { type NextRequest, type NextResponse } from 'next/server.js';
import { type Promisable } from 'type-fest';
import { createHasFeature } from '#hasFeature.ts';
import { getFeatureFlagsOnServer } from '#helpers/getFeatureFlagsOnServer.ts';

export type FeatureFlagsContext = {
  hasFeature: (name: string) => boolean;
};

export type RouteHandler<Params extends object, Body> = (
  req: NextRequest,
  options: { params: Params },
  context: FeatureFlagsContext,
) => Promisable<NextResponse<Body>>;

export const withFeatureFlags =
  <Params extends object, Body = unknown>(routeHandler: RouteHandler<Params, Body>, devMode: boolean) =>
  async (req: NextRequest, options: { params: Params }) => {
    const flags = getFeatureFlagsOnServer({
      cookie: name => cookies().get(name)?.value,
      devMode,
    });

    return routeHandler(req, options, { hasFeature: createHasFeature(flags) });
  };
