/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { type ReactNode } from 'react';
import { I18nProvider } from '#components/I18nProvider.tsx';
import { type ComponentMapper } from '#types.js';
import { Md } from './Md.tsx';

type ComponentProps = {
  children: ReactNode;
};

const componentMapper: ComponentMapper = {
  CustomComponent: ({ children }: ComponentProps) => <div data-display-name="CustomComponent">{children}</div>,
  p: ({ children }: ComponentProps) => <p data-disaplay-name="p">{children}</p>,
};

describe('MarkdownToJsx', () => {
  it('should render the expected components', () => {
    const Wrapper = ({ children }: ComponentProps) => (
      <I18nProvider componentMapper={componentMapper}>{children}</I18nProvider>
    );

    const { container } = render(<Md>{'<CustomComponent><p>content</p></CustomComponent>'}</Md>, { wrapper: Wrapper });

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          data-display-name="CustomComponent"
        >
          <p
            data-disaplay-name="p"
          >
            content
          </p>
        </div>
      </div>
    `);
  });

  describe('when the markdown as template variables', () => {
    it('should render the expected components with template variables injected', () => {
      const Wrapper = ({ children }: ComponentProps) => (
        <I18nProvider componentMapper={componentMapper}>{children}</I18nProvider>
      );

      const { container } = render(
        <Md variables={{ adjective: 'great' }}>
          {"<CustomComponent><p>{'Have a {{adjective}} day'}</p></CustomComponent>"}
        </Md>,
        {
          wrapper: Wrapper,
        },
      );

      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            data-display-name="CustomComponent"
          >
            <p
              data-disaplay-name="p"
            >
              {'Have a great day'}
            </p>
          </div>
        </div>
      `);
    });
  });
});
