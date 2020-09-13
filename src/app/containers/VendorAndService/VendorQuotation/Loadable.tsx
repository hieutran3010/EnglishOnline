/**
 *
 * Asynchronously loads the component for VendorQuotationCu
 *
 */
import React from 'react';
import { lazyLoad } from 'utils/loadable';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const VendorQuotation = lazyLoad(
  () => import('./index'),
  module => module.VendorQuotation,
  { fallback: <LazyLoadingSkeleton /> },
);
