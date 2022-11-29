import React from 'react';
import { createRoot } from 'react-dom/client';

import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';

import { ErrorBoundary } from 'react-error-boundary';

import { store } from './state';

import Layout from '@components/Layout';
import Home from '@components/Home';
import AboutPage from '@components/AboutPage';
import HostsList from '@components/HostsList';
import ClustersList from '@components/ClustersList';
import { ClusterSettings } from '@components/ClusterDetails';
import ChecksResults from '@components/ChecksResults';
import { ExecutionResultsPage } from '@components/ExecutionResults';
import SapSystemsOverview from '@components/SapSystemsOverview';
import HostDetails from '@components/HostDetails';
import ClusterDetails from '@components/ClusterDetails';
import DatabasesOverview from '@components/DatabasesOverview';
import SapSystemDetails from './components/SapSystemDetails/SapSystemDetails';
import DatabaseDetails from './components/DatabaseDetails';
import ChecksCatalog, { ChecksCatalogNew } from '@components/ChecksCatalog';
import NotFound from '@components/NotFound';
import SomethingWentWrong from '@components/SomethingWentWrong';
import Settings from '@components/Settings';
import Eula from '@components/Eula';

const App = () => {
  return (
    <Provider store={store}>
      <Toaster position="top-right" />
      <Eula />
      <BrowserRouter>
        <ErrorBoundary
          FallbackComponent={SomethingWentWrong}
          onReset={() => {
            store.dispatch({ type: 'RESET_STATE' });
          }}
        >
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route index path="hosts" element={<HostsList />} />
              <Route path="clusters" element={<ClustersList />} />
              <Route path="sap_systems" element={<SapSystemsOverview />} />
              <Route path="databases" element={<DatabasesOverview />} />
              <Route path="catalog" element={<ChecksCatalog />} />
              <Route path="catalog_new" element={<ChecksCatalogNew />} />
              <Route path="settings" element={<Settings />} />
              <Route path="about" element={<AboutPage />} />
              <Route
                path="clusters/:clusterID/settings"
                element={<ClusterSettings />}
              />
              <Route
                path="clusters/:clusterID/settings_new"
                element={<ClusterSettings newChecksSelectionView={true} />}
              />
              <Route
                path="clusters/:clusterID/checks/results"
                element={<ChecksResults />}
              />
              <Route
                path="clusters/:clusterID/executions/:executionID"
                element={<ExecutionResultsPage />}
              />
              <Route path="hosts/:hostID" element={<HostDetails />} />
              <Route path="sap_systems/:id" element={<SapSystemDetails />} />
              <Route path="databases/:id" element={<DatabaseDetails />} />
              <Route path="clusters/:clusterID" element={<ClusterDetails />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
};

const container = document.getElementById('trento');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
