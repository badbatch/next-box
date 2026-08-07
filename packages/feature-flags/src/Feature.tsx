import { type FC, type ReactNode } from 'react';
import { useFeature } from './useFeature.ts';

export type FeatureProps = {
  children: ReactNode;
  name: string;
};

export const Feature: FC<FeatureProps> = ({ children, name }) => {
  const isFeature = useFeature(name);
  return isFeature ? children : undefined;
};
