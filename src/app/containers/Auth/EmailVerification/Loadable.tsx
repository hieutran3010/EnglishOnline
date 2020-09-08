/**
 *
 * Asynchronously loads the component for EmailVerification
 *
 */

import { lazyLoad } from 'utils/loadable';
import React from 'react';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const EmailVerification = lazyLoad(
  () => import('./index'),
  module => module.EmailVerification,
  { fallback: <LazyLoadingSkeleton /> },
);
