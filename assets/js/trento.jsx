import React from 'react';
import { createRoot } from 'react-dom/client';

import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';

import { ErrorBoundary } from 'react-error-boundary';

import Layout from '@pages/Layout';
import Home from '@pages/Home';
import AboutPage from '@pages/AboutPage';
import HostsList from '@components/HostsList';
import ClustersList from '@pages/ClusterDetails/ClustersList';
import ClusterDetailsPage from '@pages/ClusterDetails';
import ClusterSettingsPage from '@pages/ClusterSettingsPage';
import { ExecutionResultsPage } from '@pages/ExecutionResults';
import CheckResultDetailPage from '@pages/ExecutionResults/CheckResultDetail';
import SapSystemsOverviewPage from '@components/SapSystemsOverview';
import HostDetailsPage, { HostSettingsPage } from '@pages/HostDetails';
import DatabasesOverviewPage from '@pages/DatabasesOverview';
import ChecksCatalogPage from '@pages/ChecksCatalog';
import NotFound from '@pages/NotFound';
import SomethingWentWrong from '@components/SomethingWentWrong';
import SaptuneDetailsPage from '@components/SaptuneDetails';
import Settings from '@components/Settings';
import Eula from '@pages/Eula';
import Login from '@components/Login';
import { me } from '@lib/auth';
import { networkClient } from '@lib/network';
import Guard from '@components/Guard';
import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';
import DatabaseDetails from './pages/DatabaseDetails';
import SapSystemDetails from './pages/SapSystemDetails/SapSystemDetails';

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
