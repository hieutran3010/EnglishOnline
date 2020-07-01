/**
 *
 * Asynchronously loads the component for CustomerCreateOrUpdatePage
 *
 */

import { lazyLoad } from 'utils/loadable';

export const CustomerCreateOrUpdatePage = lazyLoad(
  () => import('./index'),
  module => module.CustomerCreateOrUpdatePage,
);
