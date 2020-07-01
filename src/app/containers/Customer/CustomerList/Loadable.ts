/**
 *
 * Asynchronously loads the component for CustomerList
 *
 */

import { lazyLoad } from 'utils/loadable';

export const CustomerList = lazyLoad(
  () => import('./index'),
  module => module.CustomerList,
);
