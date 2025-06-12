import { type HTMLAttributes } from 'react';
import { getPublicEnvs } from '#getPublicEnvs.ts';

export type PublicEnvVarsScriptProps = HTMLAttributes<HTMLScriptElement>;

export const PublicEnvVarsScript = (props: PublicEnvVarsScriptProps) => {
  const envs = getPublicEnvs(process.env);

  return (
    <script
      async
      dangerouslySetInnerHTML={{
        __html: `
          (function(){
            globalThis.env = ${JSON.stringify(envs)};
          })();
        `,
      }}
      defer
      {...props}
    />
  );
};
