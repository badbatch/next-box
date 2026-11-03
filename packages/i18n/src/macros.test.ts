import { describe, expect, it, jest } from '@jest/globals';

jest.unstable_mockModule('#helpers/loadConfig.ts', () => ({
  loadConfig: jest.fn().mockReturnValue({ markdownDir: './packages/i18n/src' }),
}));

const { md } = await import('#macros.ts');

describe('md', () => {
  it('When a valid markdown path is provided, then it returns the file contents', () => {
    // Arrange
    const path = './__testUtils__/content.md';

    // Act
    const result = md(path);

    // Assert
    expect(result).toMatchInlineSnapshot(`
      "# Page title

      ## Section title

      ### Section subtitle

      > Inset text

      This is a paragraph.

      For more info, see [this link](http://localhost)"
    `);
  });

  it('When no markdown path is provided, then it throws an error describing the missing path', () => {
    // Arrange
    const path = '';

    // Act
    const readMarkdown = () => md(path);

    // Assert
    expect(readMarkdown).toThrow('md expected a path, but received none');
  });

  it('When the markdown path does not resolve to a file, then it throws a file system error', () => {
    // Arrange
    const path = './__testUtils__/no-content.md';

    // Act
    const readMarkdown = () => md(path);

    // Assert
    expect(readMarkdown).toThrow();
  });
});
