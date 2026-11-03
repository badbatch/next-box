/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';
import { type MarkdownToJSX } from 'markdown-to-jsx';
import { type ReactNode } from 'react';
import { I18nProvider } from '#components/I18nProvider.tsx';
import { Md } from './Md.tsx';

type ComponentProps = {
  children: ReactNode;
};

const componentMapper: MarkdownToJSX.Overrides = {
  CustomComponent: {
    component: ({ children }: ComponentProps) => <div data-display-name="CustomComponent">{children}</div>,
  },
  p: ({ children }: ComponentProps) => <p data-disaplay-name="p">{children}</p>,
};

describe('Md', () => {
  it('When markdown contains mapped components, then it renders the mapped React components', () => {
    // Arrange
    const wrapper = ({ children }: ComponentProps) => (
      <I18nProvider componentMapper={componentMapper}>{children}</I18nProvider>
    );

    // Act
    const { container } = render(<Md>{'<CustomComponent><p>content</p></CustomComponent>'}</Md>, { wrapper });

    // Assert
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

  it('When markdown contains template variables, then it injects them before rendering mapped components', () => {
    // Arrange
    const wrapper = ({ children }: ComponentProps) => (
      <I18nProvider componentMapper={componentMapper}>{children}</I18nProvider>
    );

    // Act
    const { container } = render(
      <Md variables={{ adjective: 'great' }}>
        {"<CustomComponent><p>{'Have a {{adjective}} day'}</p></CustomComponent>"}
      </Md>,
      { wrapper },
    );

    // Assert
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
