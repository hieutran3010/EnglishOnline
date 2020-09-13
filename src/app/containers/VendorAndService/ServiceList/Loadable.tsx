/**
 *
 * Asynchronously loads the component for ServiceList
 *
 */

import { lazyLoad } from 'utils/loadable';
import React from 'react';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const ServiceList = lazyLoad(
  () => import('./index'),
  module => module.ServiceList,
  { fallback: <LazyLoadingSkeleton /> },
);
