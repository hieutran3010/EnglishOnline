/**
 *
 * Asynchronously loads the component for Login
 *
 */

import { lazyLoad } from 'utils/loadable';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';
import React from 'react';

export const Login = lazyLoad(
  () => import('./index'),
  module => module.Login,
  { fallback: <LazyLoadingSkeleton /> },
);
