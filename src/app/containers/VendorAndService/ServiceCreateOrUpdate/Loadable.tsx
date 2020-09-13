/**
 *
 * Asynchronously loads the component for ServiceCreateOrUpdate
 *
 */

import { lazyLoad } from 'utils/loadable';
import React from 'react';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const ServiceCreateOrUpdate = lazyLoad(
  () => import('./index'),
  module => module.ServiceCreateOrUpdate,
  { fallback: <LazyLoadingSkeleton /> },
);
