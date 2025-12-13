import PropTypes from 'prop-types';
import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import PageConnector from 'Components/Page/PageConnector';
import ApplyTheme from './ApplyTheme';
import AppRoutes from './AppRoutes';

function App({ store }) {
  return (
    <HelmetProvider>
      <Helmet>
        <title>{window.Readarr.instanceName}</title>
      </Helmet>
      <Provider store={store}>
        <BrowserRouter basename={window.Readarr.urlBase}>
          <ApplyTheme>
            <PageConnector>
              <AppRoutes app={App} />
            </PageConnector>
          </ApplyTheme>
        </BrowserRouter>
      </Provider>
    </HelmetProvider>
  );
}

App.propTypes = {
  store: PropTypes.object.isRequired
};

export default App;
