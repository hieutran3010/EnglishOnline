/**
 *
 * Asynchronously loads the component for BillAdvanceSearch
 *
 */

import { lazyLoad } from 'utils/loadable';
import React from 'react';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const BillAdvanceSearch = lazyLoad(
  () => import('./index'),
  module => module.BillAdvanceSearch,
  { fallback: <LazyLoadingSkeleton /> },
);
