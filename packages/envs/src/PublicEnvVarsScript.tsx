import { type FC, type HTMLAttributes } from 'react';
import { getPublicEnvs } from '#getPublicEnvs.ts';

export type PublicEnvVarsScriptProps = HTMLAttributes<HTMLScriptElement> & {
  whitelist?: string[];
};

export const PublicEnvVarsScript: FC<PublicEnvVarsScriptProps> = ({ whitelist, ...restProps }) => {
  const envs = getPublicEnvs(process.env, whitelist);

  return (
    <script
      async
      // This is intentional
      // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{
        __html: `
          (function(){
            globalThis.env = ${JSON.stringify(envs)};
          })();
        `,
      }}
      defer
      {...restProps}
    />
  );
};
