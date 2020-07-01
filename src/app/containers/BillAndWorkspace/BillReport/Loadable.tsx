/**
 * Asynchronously loads the component for HomePage
 */
import React from 'react';
import { lazyLoad } from 'utils/loadable';

export const BillReport = lazyLoad(
  () => import('./index'),
  module => module.BillReport,
  {
    fallback: <span>Loading</span>,
  },
);
