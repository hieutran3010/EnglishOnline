/**
 *
 * Asynchronously loads the component for BillUpdating
 *
 */

import { lazyLoad } from 'utils/loadable';

export const BillUpdating = lazyLoad(
  () => import('./index'),
  module => module.BillUpdating,
);
