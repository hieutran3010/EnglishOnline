/**
 *
 * Asynchronously loads the component for BillCreateOrUpdate
 *
 */

import { lazyLoad } from 'utils/loadable';

export const BillCreateOrUpdate = lazyLoad(
  () => import('./index'),
  module => module.BillCreateOrUpdate,
);
