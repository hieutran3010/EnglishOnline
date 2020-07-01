/**
 *
 * Asynchronously loads the component for VendorQuotationCu
 *
 */
import React from 'react';
import { lazyLoad } from 'utils/loadable';

export const VendorQuotation = lazyLoad(
  () => import('./index'),
  module => module.VendorQuotation,
  { fallback: <span>Loading</span> },
);
