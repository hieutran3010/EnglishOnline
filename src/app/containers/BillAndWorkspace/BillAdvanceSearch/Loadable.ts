/**
 *
 * Asynchronously loads the component for BillAdvanceSearch
 *
 */

import { lazyLoad } from 'utils/loadable';

export const BillAdvanceSearch = lazyLoad(
  () => import('./index'),
  module => module.BillAdvanceSearch,
);
