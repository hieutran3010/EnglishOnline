/**
 *
 * Asynchronously loads the component for VendorCreation
 *
 */
import React from 'react';
import { lazyLoad } from 'utils/loadable';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const VendorCreation = lazyLoad(
  () => import('./index'),
  module => module.VendorCreation,
  { fallback: <LazyLoadingSkeleton /> },
);
