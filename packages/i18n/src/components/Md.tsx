import MarkdownToJsx, { type MarkdownToJSX } from 'markdown-to-jsx';
import { type FC, use } from 'react';
import { I18nContext } from '#components/I18nProvider.tsx';
import { injectVariables } from '#helpers/injectVariables.ts';

export type MdProps = {
  // The markdown to convert into JSX.
  children: string;
  // An object of key/value pairs, with the key being the
  // name of the html tag that maps to supported markdown or
  // the name of a React component, and the value being a
  // React component. This prop is designed as an override
  // for the componentMapper passed into the I18nProvider.
  componentMapper?: MarkdownToJSX.Overrides;
  // An object of key/value pairs for content with template variables.
  variables?: Record<string, string | number>;
} & Omit<MarkdownToJSX.Options, 'overrides'>;

export const Md: FC<MdProps> = ({
  children,
  componentMapper: componentMapperOverrides,
  variables,
  ...markdownToJsxOptionOverrides
}) => {
  const { componentMapper, ...markdownToJsxOptions } = use(I18nContext);

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
