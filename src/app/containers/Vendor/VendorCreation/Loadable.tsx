/**
 *
 * Asynchronously loads the component for VendorCreation
 *
 */
import React from 'react';
import { lazyLoad } from 'utils/loadable';

export const VendorCreation = lazyLoad(
  () => import('./index'),
  module => module.VendorCreation,
  { fallback: <span>Loading</span> },
);
