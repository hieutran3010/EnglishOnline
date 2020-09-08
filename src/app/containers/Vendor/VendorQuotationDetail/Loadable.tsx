/**
 *
 * Asynchronously loads the component for VendorQuotationDetail
 *
 */

import { lazyLoad } from 'utils/loadable';
import React from 'react';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const VendorQuotationDetail = lazyLoad(
  () => import('./index'),
  module => module.VendorQuotationDetail,
  { fallback: <LazyLoadingSkeleton /> },
);
