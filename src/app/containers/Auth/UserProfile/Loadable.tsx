/**
 *
 * Asynchronously loads the component for UserProfile
 *
 */

import { lazyLoad } from 'utils/loadable';
import React from 'react';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const UserProfile = lazyLoad(
  () => import('./index'),
  module => module.UserProfile,
  { fallback: <LazyLoadingSkeleton /> },
);
