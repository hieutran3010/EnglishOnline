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
      <Helmet titleTemplate="Helen Express" defaultTitle="Helen Express">
        <meta
          name="description"
          content="Quản lý vận hành Công Ty TNHH Vận Chuyển Helen Express"
        />
      </Helmet>

      <Switch>
        <Route path={process.env.PUBLIC_URL + '/'} component={HomePage} />
        <Route exact component={NotFoundPage} />
      </Switch>
      <GlobalStyle />
    </BrowserRouter>
  );
}
