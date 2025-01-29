import { castArray } from 'lodash-es';
import {
  type BreadcrumbEntry,
  type LabelMapperEntry,
  type LabelMapperEntryOptions,
  type Transforms,
} from '../types.ts';
import { removeExcludedQueryParams } from './removeExcludedQueryParams.ts';
import { transformCaptureGroupData } from './transformCaptureGroupData.ts';

export const createBreadcrumbs = async (
  history: string[],
  labelMapper: Record<string, LabelMapperEntry>,
  excludeQueryParams: string[],
  availableTransforms: Transforms = {},
) => {
  const breadcrumbs: BreadcrumbEntry[] = [];

  for (const entry of history) {
    const match = Object.entries(labelMapper).find(([regex]) => new RegExp(regex).test(entry));

    if (!match) {
      console.error(
        `Breadcrumb: No matching label was found for history entry "${entry}". This has been omitted from the breadcrumbs.`,
      );

      continue;
    }

    const [regex, labelAndOptions] = match;
    // Need to refactor surrounding code to make this change
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const [label, options = {}] = castArray(labelAndOptions) as [string, LabelMapperEntryOptions];

    if (!/{{.+}}/.test(label)) {
      const index = breadcrumbs.findIndex(breadcrumb => breadcrumb.label === label);

      if (index !== -1) {
        breadcrumbs.splice(index, 1);
      }

      breadcrumbs.push({
        href: removeExcludedQueryParams(entry, [...excludeQueryParams, ...(options.excludeQueryParams ?? [])]),
        label,
      });

      continue;
    }

    // We already know the regex returns a match based on
    // the condition above so assertion is okay.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = new RegExp(regex).exec(entry)!;
    const { groups } = result;

    if (!groups) {
      console.error(
        `Breadcrumb: No named capture groups were found with regex "${regex}". These are required if the label is a string template.
          Label is "${label}". Entry "${entry}" has been omitted from the breadcrumbs.`,
      );

      continue;
    }

    const { transforms } = options;
    const templateArgs = transforms ? await transformCaptureGroupData(groups, transforms, availableTransforms) : groups;
    let populatedLabel = label;

    for (const [key, value] of Object.entries(templateArgs)) {
      if (populatedLabel.includes(`{{${key}}}`) || populatedLabel.includes(`{{ ${key} }}`)) {
        populatedLabel = populatedLabel.replace(new RegExp(`{{${key}}}|{{ ${key} }}`), value);
      }
    }

    const index = breadcrumbs.findIndex(breadcrumb => breadcrumb.label === populatedLabel);

    if (index !== -1) {
      breadcrumbs.splice(index, 1);
    }

    breadcrumbs.push({
      href: removeExcludedQueryParams(entry, [...excludeQueryParams, ...(options.excludeQueryParams ?? [])]),
      label: populatedLabel,
    });
  }

  return breadcrumbs;
};
