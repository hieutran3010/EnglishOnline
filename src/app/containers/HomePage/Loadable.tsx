/**
 * Asynchronously loads the component for HomePage
 */
import React from 'react';
import { lazyLoad } from 'utils/loadable';

export const HomePage = lazyLoad(
  () => import('./index'),
  module => module.HomePage,
  {
    fallback: <span>Loading</span>,
  },
);
