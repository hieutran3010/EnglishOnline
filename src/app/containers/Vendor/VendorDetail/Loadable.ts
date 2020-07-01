/**
 *
 * Asynchronously loads the component for VendorDetail
 *
 */

import { lazyLoad } from 'utils/loadable';

export const VendorDetail = lazyLoad(
  () => import('./index'),
  module => module.VendorDetailPage,
);
