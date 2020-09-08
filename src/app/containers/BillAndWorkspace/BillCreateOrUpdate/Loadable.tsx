/**
 *
 * Asynchronously loads the component for BillCreateOrUpdate
 *
 */

import { lazyLoad } from 'utils/loadable';
import React from 'react';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const BillCreateOrUpdate = lazyLoad(
  () => import('./index'),
  module => module.BillCreateOrUpdate,
  { fallback: <LazyLoadingSkeleton /> },
);
