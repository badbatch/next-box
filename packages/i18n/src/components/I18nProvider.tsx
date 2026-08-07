import { type MarkdownToJSX } from 'markdown-to-jsx';
import { type FC, type ReactNode, createContext } from 'react';

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

export const I18nProvider: FC<I18nProviderProps> = ({ children, componentMapper, ...markdownToJsxOptions }) => {
  return <I18nContext value={{ componentMapper, ...markdownToJsxOptions }}>{children}</I18nContext>;
};
