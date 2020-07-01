/**
 *
 * Asynchronously loads the component for Workspace
 *
 */

import { lazyLoad } from 'utils/loadable';

export const Workspace = lazyLoad(
  () => import('./index'),
  module => module.Workspace,
);
