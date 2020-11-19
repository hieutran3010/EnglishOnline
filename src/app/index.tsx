/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { Switch, Route, BrowserRouter } from 'react-router-dom';

import { GlobalStyle } from '../styles/global-styles';

import { HomePage } from './containers/HomePage/Loadable';
import { NotFoundPage } from './containers/NotFoundPage/Loadable';
import { initializeFirebase } from './services/firebase';

initializeFirebase();

export function App() {
  return (
    <BrowserRouter>
      <Helmet titleTemplate="English Zone" defaultTitle="English Zone">
        <meta name="description" content="English Zone" />
      </Helmet>

      <Switch>
        <Route path={process.env.PUBLIC_URL + '/'} component={HomePage} />
        <Route exact component={NotFoundPage} />
      </Switch>
      <GlobalStyle />
    </BrowserRouter>
  );
}
