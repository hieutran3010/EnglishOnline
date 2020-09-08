/**
 *
 * Asynchronously loads the component for UserList
 *
 */

import { lazyLoad } from 'utils/loadable';
import React from 'react';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const UserList = lazyLoad(
  () => import('./index'),
  module => module.UserList,
  { fallback: <LazyLoadingSkeleton /> },
);
