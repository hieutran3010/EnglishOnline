/**
 *
 * Asynchronously loads the component for VendorList
 *
 */
import React from 'react';
import { lazyLoad } from 'utils/loadable';

export const VendorList = lazyLoad(
  () => import('./index'),
  module => module.VendorList,
  { fallback: <span>Loading</span> },
);
