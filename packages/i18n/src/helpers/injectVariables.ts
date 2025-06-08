const extractTemplateVariables = /{{[^\s{}]+}}/g;
const extractVarName = /{{ *([^ }]*) *}}/;

export const injectVariables = (markdown: string, variables?: Record<string, string | number>): string =>
  variables
    ? // @ts-expect-error lib config needs updating
      markdown.replaceAll(extractTemplateVariables, (match: string) => {
        const varName = match.replace(extractVarName, '$1');
        const replacementValue = variables[varName];

        if (replacementValue) {
          return replacementValue;
        }

        throw new Error(`Markdown contains un-replaced variable '${varName}'`);
      })
    : markdown;
