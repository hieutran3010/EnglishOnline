/**
 * Asynchronously loads the component for HomePage
 */
import React from 'react';
import { lazyLoad } from 'utils/loadable';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const HomePage = lazyLoad(
  () => import('./index'),
  module => module.HomePage,
  { fallback: <LazyLoadingSkeleton /> },
);
