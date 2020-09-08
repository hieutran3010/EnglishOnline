/**
 *
 * Asynchronously loads the component for CustomerCreateOrUpdatePage
 *
 */
import React from 'react';
import { lazyLoad } from 'utils/loadable';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const CustomerCreateOrUpdatePage = lazyLoad(
  () => import('./index'),
  module => module.CustomerCreateOrUpdatePage,
  { fallback: <LazyLoadingSkeleton /> },
);
