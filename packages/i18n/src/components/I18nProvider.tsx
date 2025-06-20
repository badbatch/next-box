import { type MarkdownToJSX } from 'markdown-to-jsx';
import { type JSX, type ReactNode, createContext } from 'react';

export const I18nContext = createContext<
  {
    componentMapper: MarkdownToJSX.Overrides;
  } & Omit<MarkdownToJSX.Options, 'overrides'>
>({
  componentMapper: {},
});

export type I18nProviderProps = {
  children: ReactNode;
  componentMapper: MarkdownToJSX.Overrides;
} & Omit<MarkdownToJSX.Options, 'overrides'>;

export const I18nProvider = ({
  children,
  componentMapper,
  ...markdownToJsxOptions
}: I18nProviderProps): JSX.Element => {
  return <I18nContext.Provider value={{ componentMapper, ...markdownToJsxOptions }}>{children}</I18nContext.Provider>;
};
