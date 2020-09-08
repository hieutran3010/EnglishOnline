/**
 *
 * Asynchronously loads the component for CustomerList
 *
 */
import React from 'react';
import { lazyLoad } from 'utils/loadable';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const CustomerList = lazyLoad(
  () => import('./index'),
  module => module.CustomerList,
  { fallback: <LazyLoadingSkeleton /> },
);
