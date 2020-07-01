/**
 *
 * Asynchronously loads the component for VendorQuotationDetail
 *
 */

import { lazyLoad } from 'utils/loadable';

export const VendorQuotationDetail = lazyLoad(
  () => import('./index'),
  module => module.VendorQuotationDetail,
);
