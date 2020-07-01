/**
 *
 * Asynchronously loads the component for UserCreateOrUpdatePage
 *
 */

import { lazyLoad } from 'utils/loadable';

export const UserCreateOrUpdatePage = lazyLoad(
  () => import('./index'),
  module => module.UserCreateOrUpdatePage,
);
