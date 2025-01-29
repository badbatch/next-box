import { type ReactNode } from 'react';
import { useFeature } from './useFeature.ts';

export type FeatureProps = {
  children: ReactNode;
  name: string;
};

export const Feature = ({ children, name }: FeatureProps) => {
  const feature = useFeature(name);
  return feature ? children : undefined;
};
