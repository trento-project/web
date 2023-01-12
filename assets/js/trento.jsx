import React from 'react';
import { createRoot } from 'react-dom/client';

import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';

import { ErrorBoundary } from 'react-error-boundary';

import Layout from '@components/Layout';
import Home from '@components/Home';
import AboutPage from '@components/AboutPage';
import HostsList from '@components/HostsList';
import ClustersList from '@components/ClustersList';
import ClusterDetails, {
  ClusterSettings,
  ClusterDetailsNew,
  ClusterSettingsNew,
} from '@components/ClusterDetails';
import ChecksResults from '@components/ChecksResults';
import { ExecutionResultsPage } from '@components/ExecutionResults';
import SapSystemsOverview from '@components/SapSystemsOverview';
import HostDetails from '@components/HostDetails';
import DatabasesOverview from '@components/DatabasesOverview';
import ChecksCatalog, { ChecksCatalogNew } from '@components/ChecksCatalog';
import NotFound from '@components/NotFound';
import SomethingWentWrong from '@components/SomethingWentWrong';
import Settings from '@components/Settings';
import Eula from '@components/Eula';
import Login from '@components/Login';
import { me } from '@lib/auth';
import { networkClient } from '@lib/network';
import Guard from '@components/Guard';
import DatabaseDetails from './components/DatabaseDetails';
import SapSystemDetails from './components/SapSystemDetails/SapSystemDetails';
import { store } from './state';

function App() {
  const getUser = () => me(networkClient);

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
            <Route path="/session/new" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route
                element={
                  <Guard redirectPath="/session/new" getUser={getUser} />
                }
              >
                <Route
                  path="clusters_new/:clusterID/settings"
                  element={<ClusterSettingsNew />}
                />
                <Route
                  path="clusters_new/:clusterID/executions/last"
                  element={<ExecutionResultsPage />}
                />
                <Route
                  path="clusters_new/:clusterID"
                  element={<ClusterDetailsNew />}
                />
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
                  path="clusters/:clusterID/checks/results"
                  element={<ChecksResults />}
                />
                <Route path="hosts/:hostID" element={<HostDetails />} />
                <Route path="sap_systems/:id" element={<SapSystemDetails />} />
                <Route path="databases/:id" element={<DatabaseDetails />} />
                <Route
                  path="clusters/:clusterID"
                  element={<ClusterDetails />}
                />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
}

const container = document.getElementById('trento');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
