import { type Promisable } from 'type-fest';

export type BreadcrumbEntry = {
  href: string;
  label: string;
};

export type LabelMapperEntryOptions = {
  /**
   * Name of query params to exclude from href
   * used in the link of these breadcrumb.
   */
  excludeQueryParams?: string[];
  transforms?: string[];
};

export type LabelMapperEntry = string | [string, LabelMapperEntryOptions];

export type TransformCallback = (value: Record<string, unknown>) => Promisable<Record<string, string | undefined>>;

export type Transforms = Record<string, TransformCallback>;
