import MarkdownToJsx from 'markdown-to-jsx';
import { type ComponentProps, type JSX, useContext } from 'react';
import { I18nContext } from '#components/I18nProvider.tsx';
import { injectVariables } from '#helpers/injectVariables.ts';
import { type ComponentMapper } from '#types.ts';

export type MdProps = {
  // The markdown to convert into JSX.
  children: string;
  // An object of key/value pairs, with the key being the
  // name of the html tag that maps to supported markdown or
  // the name of a React component, and the value being a
  // React component. This prop is designed as an override
  // for the componentMapper passed into the I18nProvider.
  componentMapper?: ComponentMapper;
  // An object of key/value pairs for content with template variables.
  variables?: Record<string, string | number>;
} & Omit<ComponentProps<typeof MarkdownToJsx>['options'], 'overrides'>;

export const Md = ({
  children,
  componentMapper: componentMapperOverrides,
  variables,
  ...markdownToJsxOptionOverrides
}: MdProps): JSX.Element => {
  const { componentMapper, ...markdownToJsxOptions } = useContext(I18nContext);

  return (
    <MarkdownToJsx
      options={{
        overrides: { ...componentMapper, ...componentMapperOverrides },
        ...markdownToJsxOptions,
        ...markdownToJsxOptionOverrides,
      }}
    >
      {injectVariables(children, variables)}
    </MarkdownToJsx>
  );
};
