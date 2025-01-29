import { type Transforms } from '../types.ts';

const isTransformedDataIncomplete = (
  result: Record<string, string | undefined>,
): result is Record<string, string | undefined> => Object.values(result).includes(undefined);

export const transformCaptureGroupData = async (
  groups: Record<string, string>,
  transforms: string[],
  availableTransforms: Transforms,
) => {
  let transformedData: Record<string, string> = groups;

  for (const transformName of transforms) {
    const transform = availableTransforms[transformName];

    if (!transform) {
      console.error(
        `Breadcrumb: Transform ${transformName} is not one of the available transforms: ${Object.keys(
          availableTransforms,
        ).join(
          ', ',
        )}. To fix this, add pass ${transformName} into the BreadcrumbProvider as part of the transforms object.`,
      );

      continue;
    }

    const result = await Promise.resolve(transform(transformedData));

    if (isTransformedDataIncomplete(result)) {
      console.error(
        `Breadcrumb: Transform ${transformName} returned an undefined value: ${JSON.stringify(
          result,
        )}. To fix this, check the transform implementation and refactor accordingly.`,
      );

      continue;
    }

    transformedData = result;
  }

  return transformedData;
};
