import React from 'react';
import { createRoot } from 'react-dom/client';

import {
  createRoutesFromElements,
  createBrowserRouter,
  Route,
  RouterProvider,
  Outlet,
} from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';

import AboutPage from '@pages/AboutPage';
import CheckResultDetailPage from '@pages/ExecutionResults/CheckResultDetail';
import ChecksCatalogPage from '@pages/ChecksCatalog';
import ClusterDetailsPage from '@pages/ClusterDetails';
import ClusterSettingsPage from '@pages/ClusterSettingsPage';
import ClustersList from '@pages/ClusterDetails/ClustersList';
import DatabasesOverviewPage from '@pages/DatabasesOverview';
import DatabaseDetails from '@pages//DatabaseDetails';
import { ExecutionResultsPage } from '@pages/ExecutionResults';
import Guard from '@pages/Guard';
import ForbiddenGuard from '@common/ForbiddenGuard';
import Home from '@pages/Home';
import HostDetailsPage from '@pages/HostDetailsPage';
import HostSettingsPage from '@pages/HostSettingsPage';
import HostRelevantPatchesPage from '@pages/HostRelevantPatches';
import AdvisoryDetailsPage from '@pages/AdvisoryDetails';
import UpgradablePackagesPage from '@pages/UpgradablePackagesPage';
import HostsList from '@pages/HostsList';
import Layout from '@pages/Layout';
import Login from '@pages/Login';
import NotFound from '@pages/NotFound';
import SapSystemDetails from '@pages//SapSystemDetails/SapSystemDetails';
import SapSystemsOverviewPage from '@pages/SapSystemsOverviewPage';
import SaptuneDetailsPage from '@pages/SaptuneDetails';
import SettingsPage from '@pages/SettingsPage';
import SomethingWentWrong from '@pages/SomethingWentWrong';
import UsersPage, { CreateUserPage, EditUserPage } from '@pages/Users';
import ProfilePage from '@pages/Profile';
import ActivityLogPage from '@pages/ActivityLogPage';
import SSOCallback from '@pages/SSOCallback';

import { profile } from '@lib/auth';
import {
  isSingleSignOnEnabled,
  getSingleSignOnCallbackUrl,
} from '@lib/auth/config';
import { networkClient } from '@lib/network';
import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';

import { createStore } from './state';

const createRouter = ({ getUser }) =>
  createBrowserRouter(
    createRoutesFromElements(
      <Route element={<RoutesWrapper />} ErrorBoundary={SomethingWentWrong}>
        <Route path="/session/new" element={<Login />} />
        {isSingleSignOnEnabled() && (
          <Route
            path={getSingleSignOnCallbackUrl()}
            element={<SSOCallback />}
          />
        )}
        <Route path="/">
          <Route
            element={<Guard redirectPath="/session/new" getUser={getUser} />}
          >
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route index path="profile" element={<ProfilePage />} />
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
              <Route path="sap_systems" element={<SapSystemsOverviewPage />} />
              <Route path="databases" element={<DatabasesOverviewPage />} />
              <Route path="catalog" element={<ChecksCatalogPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="hosts/:hostID" element={<HostDetailsPage />} />
              <Route path="sap_systems/:id" element={<SapSystemDetails />} />
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
                element={<ExecutionResultsPage targetType={TARGET_CLUSTER} />}
              />
              <Route
                path="hosts/:targetID/executions/last"
                element={<ExecutionResultsPage targetType={TARGET_HOST} />}
              />
              <Route
                path="clusters/:targetID/executions/last/:checkID/:resultTargetType/:resultTargetName"
                element={<CheckResultDetailPage targetType={TARGET_CLUSTER} />}
              />
              <Route
                path="hosts/:targetID/executions/last/:checkID/:resultTargetType/:resultTargetName"
                element={<CheckResultDetailPage targetType={TARGET_HOST} />}
              />
              <Route
                path="hosts/:hostID/patches"
                element={<HostRelevantPatchesPage />}
              />
              <Route
                path="hosts/:hostID/packages"
                element={<UpgradablePackagesPage />}
              />
              <Route
                path="hosts/:hostID/patches/:advisoryID"
                element={<AdvisoryDetailsPage />}
              />
              <Route path="activity_log" element={<ActivityLogPage />} />
              <Route
                element={
                  <ForbiddenGuard permitted={['all:users']} outletMode />
                }
              >
                <Route path="users" element={<UsersPage />} />
                <Route path="users/new" element={<CreateUserPage />} />
                <Route path="users/:userID/edit" element={<EditUserPage />} />
              </Route>
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );

function RoutesWrapper() {
  return (
    <>
      <Toaster position="top-right" containerStyle={{ top: 50, zIndex: 99 }} />
      <Outlet />
    </>
  );
}

const getUser = () => profile(networkClient);
const router = createRouter({ getUser });
const store = createStore(router);

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

const container = document.getElementById('trento');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
