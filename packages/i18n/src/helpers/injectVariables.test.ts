import { describe, expect, it } from '@jest/globals';
import { injectVariables } from './injectVariables.ts';

describe('injectVariables', () => {
  it('When a variable is zero, then it interpolates the numeric value', () => {
    // Arrange
    const markdown = 'There are {{count}} items';

    // Act
    const result = injectVariables(markdown, { count: 0 });

    // Assert
    expect(result).toBe('There are 0 items');
  });

  it('When a variable is an empty string, then it interpolates the empty value', () => {
    // Arrange
    const markdown = 'Hello{{name}}!';

    // Act
    const result = injectVariables(markdown, { name: '' });

    // Assert
    expect(result).toBe('Hello!');
  });

  it('When a variable is missing, then it throws an error containing the variable name', () => {
    // Arrange
    const markdown = 'Hello {{name}}!';

    // Act
    const injectMissingVariable = () => injectVariables(markdown, {});

    // Assert
    expect(injectMissingVariable).toThrow("Markdown contains un-replaced variable 'name'");
  });
});
