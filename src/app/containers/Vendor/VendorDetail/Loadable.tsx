/**
 *
 * Asynchronously loads the component for VendorDetail
 *
 */
import React from 'react';
import { lazyLoad } from 'utils/loadable';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const VendorDetail = lazyLoad(
  () => import('./index'),
  module => module.VendorDetailPage,
  { fallback: <LazyLoadingSkeleton /> },
);
