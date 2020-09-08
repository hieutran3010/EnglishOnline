/**
 *
 * Asynchronously loads the component for Setting
 *
 */
import React from 'react';
import { lazyLoad } from 'utils/loadable';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const Setting = lazyLoad(
  () => import('./index'),
  module => module.Setting,
  { fallback: <LazyLoadingSkeleton /> },
);
