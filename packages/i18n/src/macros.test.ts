import { md } from '#macros.ts';

describe('md', () => {
  describe('when a valid path is provided', () => {
    it('should return the markdown content in the file the path resolves to', () => {
      const content = md('./__testUtils__/content.md');

      expect(content).toMatchInlineSnapshot(`
        "# Page title

        ## Section title

        ### Section subtitle

        > Inset text

        This is a paragraph.

        For more info, see [this link](http://localhost)"
      `);
    });
  });

  describe('when no path is not provided', () => {
    it('should throw the expected error', () => {
      expect(() => md('')).toThrow('md expected a path, but received none');
    });
  });

  describe('when a valid path is not provided', () => {
    it('should throw the expected error', () => {
      expect(() => md('./__testUtils__/no-content.md')).toThrow();
    });
  });
});
