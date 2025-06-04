import type MarkdownToJsx from 'markdown-to-jsx';
import { type ComponentProps, type JSX, type ReactNode, createContext } from 'react';
import { type ComponentMapper } from '#types.ts';

export const I18nContext = createContext<
  {
    componentMapper: ComponentMapper;
  } & Omit<ComponentProps<typeof MarkdownToJsx>['options'], 'overrides'>
>({
  componentMapper: {},
});

export type I18nProviderProps = {
  children: ReactNode;
  componentMapper: ComponentMapper;
} & Omit<ComponentProps<typeof MarkdownToJsx>['options'], 'overrides'>;

export const I18nProvider = ({
  children,
  componentMapper,
  ...markdownToJsxOptions
}: I18nProviderProps): JSX.Element => {
  return <I18nContext.Provider value={{ componentMapper, ...markdownToJsxOptions }}>{children}</I18nContext.Provider>;
};
