/**
 *
 * Asynchronously loads the component for BillsInMonth
 *
 */

import { lazyLoad } from 'utils/loadable';

export const BillsInMonth = lazyLoad(
  () => import('./index'),
  module => module.BillsInMonth,
);
