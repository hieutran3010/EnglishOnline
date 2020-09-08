/**
 *
 * Asynchronously loads the component for BillUpdating
 *
 */

import { lazyLoad } from 'utils/loadable';
import React from 'react';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const BillUpdating = lazyLoad(
  () => import('./index'),
  module => module.BillUpdating,
  { fallback: <LazyLoadingSkeleton /> },
);
