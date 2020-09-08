/**
 *
 * Asynchronously loads the component for UserCreateOrUpdatePage
 *
 */

import { lazyLoad } from 'utils/loadable';
import React from 'react';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const UserCreateOrUpdatePage = lazyLoad(
  () => import('./index'),
  module => module.UserCreateOrUpdatePage,
  { fallback: <LazyLoadingSkeleton /> },
);
