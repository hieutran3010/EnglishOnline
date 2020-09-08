/**
 *
 * Asynchronously loads the component for Workspace
 *
 */

import { lazyLoad } from 'utils/loadable';
import React from 'react';
import { LazyLoadingSkeleton } from 'app/components/Skeleton';

export const Workspace = lazyLoad(
  () => import('./index'),
  module => module.Workspace,
  { fallback: <LazyLoadingSkeleton /> },
);
