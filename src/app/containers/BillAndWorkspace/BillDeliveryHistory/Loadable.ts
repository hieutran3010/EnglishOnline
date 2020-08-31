/**
 *
 * Asynchronously loads the component for BillDeliveryHistory
 *
 */

import { lazyLoad } from 'utils/loadable';

export const BillDeliveryHistoryPage = lazyLoad(
  () => import('./index'),
  module => module.BillDeliveryHistoryPage,
);
