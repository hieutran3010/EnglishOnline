/**
 *
 * Asynchronously loads the component for QuickQuotation
 *
 */

import { lazyLoad } from 'utils/loadable';

export const QuickQuotation = lazyLoad(
  () => import('./index'),
  module => module.QuickQuotation,
);
