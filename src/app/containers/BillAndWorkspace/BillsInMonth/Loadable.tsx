/**
 *
 * Asynchronously loads the component for BillsInMonth
 *
 */

import { lazyLoad } from 'utils/loadable';
import React from 'react';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const BillsInMonth = lazyLoad(
  () => import('./index'),
  module => module.BillsInMonth,
  { fallback: <LazyLoadingSkeleton /> },
);
