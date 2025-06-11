import Script, { type ScriptProps } from 'next/script.js';
import { getPublicEnvs } from '#getPublicEnvs.ts';

export type PublicEnvVarsProps = {
  id?: string;
  nonce: string;
  strategy?: ScriptProps['strategy'];
};

export const PublicEnvVars = ({
  id = 'public-env-vars-init',
  nonce,
  strategy = 'beforeInteractive',
}: PublicEnvVarsProps) => {
  const envs = getPublicEnvs(process.env);

  return (
    // @ts-expect-error false positive
    <Script
      dangerouslySetInnerHTML={{
        __html: `
      (function(w,l){
        w.envs = ${JSON.stringify(envs)};
      })(window);`,
      }}
      id={id}
      nonce={nonce}
      strategy={strategy}
    />
  );
};
