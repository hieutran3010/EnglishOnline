/**
 *
 * Asynchronously loads the component for VendorList
 *
 */
import React from 'react';
import { lazyLoad } from 'utils/loadable';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const VendorList = lazyLoad(
  () => import('./index'),
  module => module.VendorList,
  { fallback: <LazyLoadingSkeleton /> },
);
