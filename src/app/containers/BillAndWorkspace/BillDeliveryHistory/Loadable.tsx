/**
 *
 * Asynchronously loads the component for BillDeliveryHistory
 *
 */

import { lazyLoad } from 'utils/loadable';
import React from 'react';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const BillDeliveryHistoryPage = lazyLoad(
  () => import('./index'),
  module => module.BillDeliveryHistoryPage,
  { fallback: <LazyLoadingSkeleton /> },
);
