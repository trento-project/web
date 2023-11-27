import React from 'react';
import { createRoot } from 'react-dom/client';

import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';

import { ErrorBoundary } from 'react-error-boundary';

import Layout from '@components/Layout';
import Home from '@components/Home';
import AboutPage from '@pages/AboutPage';
import HostsList from '@components/HostsList';
import ClustersList from '@components/ClustersList';
import ClusterDetailsPage from '@pages/ClusterDetails';
import ClusterSettingsPage from '@components/ClusterSettingsPage';
import { ExecutionResultsPage } from '@components/ExecutionResults';
import SapSystemsOverviewPage from '@components/SapSystemsOverview';
import HostDetailsPage, { HostSettingsPage } from '@components/HostDetails';
import DatabasesOverviewPage from '@components/DatabasesOverview';
import ChecksCatalogPage from '@pages/ChecksCatalog';
import NotFound from '@components/NotFound';
import SomethingWentWrong from '@components/SomethingWentWrong';
import SaptuneDetailsPage from '@components/SaptuneDetails';
import Settings from '@components/Settings';
import Eula from '@components/Eula';
import Login from '@components/Login';
import { me } from '@lib/auth';
import { networkClient } from '@lib/network';
import Guard from '@components/Guard';
import CheckResultDetailPage from '@components/ExecutionResults/CheckResultDetail';
import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';
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
            <Route path="/">
              <Route
                element={
                  <Guard redirectPath="/session/new" getUser={getUser} />
                }
              >
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route index path="hosts" element={<HostsList />} />
                  <Route
                    path="hosts/:hostID/settings"
                    element={<HostSettingsPage />}
                  />
                  <Route
                    path="hosts/:hostID/saptune"
                    element={<SaptuneDetailsPage />}
                  />
                  <Route path="clusters" element={<ClustersList />} />
                  <Route
                    path="sap_systems"
                    element={<SapSystemsOverviewPage />}
                  />
                  <Route path="databases" element={<DatabasesOverviewPage />} />
                  <Route path="catalog" element={<ChecksCatalogPage />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="hosts/:hostID" element={<HostDetailsPage />} />
                  <Route
                    path="sap_systems/:id"
                    element={<SapSystemDetails />}
                  />
                  <Route path="databases/:id" element={<DatabaseDetails />} />
                  <Route
                    path="clusters/:clusterID"
                    element={<ClusterDetailsPage />}
                  />
                  <Route
                    path="clusters/:clusterID/settings"
                    element={<ClusterSettingsPage />}
                  />
                  <Route
                    path="clusters/:targetID/executions/last"
                    element={
                      <ExecutionResultsPage targetType={TARGET_CLUSTER} />
                    }
                  />
                  <Route
                    path="hosts/:targetID/executions/last"
                    element={<ExecutionResultsPage targetType={TARGET_HOST} />}
                  />
                  <Route
                    path="clusters/:targetID/executions/last/:checkID/:resultTargetType/:resultTargetName"
                    element={
                      <CheckResultDetailPage targetType={TARGET_CLUSTER} />
                    }
                  />
                  <Route
                    path="hosts/:targetID/executions/last/:checkID/:resultTargetType/:resultTargetName"
                    element={<CheckResultDetailPage targetType={TARGET_HOST} />}
                  />
                </Route>
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
