import React from 'react';
import { createRoot } from 'react-dom/client';

import { createBrowserRouter, Outlet } from 'react-router';
import { RouterProvider } from 'react-router/dom';

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
import PostHogPageView from '@lib/analytics/pageview';

import { createStore } from './state';

const createRouter = ({ getUser }) => {
  const routes = [
    {
      path: '/',
      element: <RoutesWrapper />,
      errorElement: <SomethingWentWrong />,
      children: [
        {
          path: '/session/new',
          element: <Login />,
        },
        ...(isSingleSignOnEnabled()
          ? [
              {
                path: getSingleSignOnCallbackUrl(),
                element: <SSOCallback />,
              },
            ]
          : []),
        {
          element: <Guard redirectPath="/session/new" getUser={getUser} />,
          children: [
            {
              element: <Layout />,
              children: [
                { index: true, element: <Home /> },
                { path: 'profile', element: <ProfilePage /> },
                { path: 'hosts', element: <HostsList /> },
                { path: 'hosts/:hostID', element: <HostDetailsPage /> },
                {
                  path: 'hosts/:hostID/settings',
                  element: <HostSettingsPage />,
                },
                {
                  path: 'hosts/:hostID/saptune',
                  element: <SaptuneDetailsPage />,
                },
                {
                  path: 'hosts/:hostID/packages',
                  element: <UpgradablePackagesPage />,
                },
                {
                  path: 'hosts/:hostID/patches',
                  element: <HostRelevantPatchesPage />,
                },
                {
                  path: 'hosts/:hostID/patches/:advisoryID',
                  element: <AdvisoryDetailsPage />,
                },
                { path: 'clusters', element: <ClustersList /> },
                {
                  path: 'clusters/:clusterID',
                  element: <ClusterDetailsPage />,
                },
                {
                  path: 'clusters/:clusterID/settings',
                  element: <ClusterSettingsPage />,
                },
                {
                  path: 'clusters/:targetID/executions/last',
                  element: <ExecutionResultsPage targetType={TARGET_CLUSTER} />,
                },
                {
                  path: 'hosts/:targetID/executions/last',
                  element: <ExecutionResultsPage targetType={TARGET_HOST} />,
                },
                {
                  path: 'clusters/:targetID/executions/last/:checkID/:resultTargetType/:resultTargetName',
                  element: (
                    <CheckResultDetailPage targetType={TARGET_CLUSTER} />
                  ),
                },
                {
                  path: 'hosts/:targetID/executions/last/:checkID/:resultTargetType/:resultTargetName',
                  element: <CheckResultDetailPage targetType={TARGET_HOST} />,
                },
                { path: 'sap_systems', element: <SapSystemsOverviewPage /> },
                { path: 'sap_systems/:id', element: <SapSystemDetails /> },
                { path: 'databases', element: <DatabasesOverviewPage /> },
                { path: 'databases/:id', element: <DatabaseDetails /> },
                { path: 'catalog', element: <ChecksCatalogPage /> },
                { path: 'settings', element: <SettingsPage /> },
                { path: 'about', element: <AboutPage /> },
                { path: 'activity_log', element: <ActivityLogPage /> },
                {
                  element: (
                    <ForbiddenGuard permitted={['all:users']} outletMode />
                  ),
                  children: [
                    { path: 'users', element: <UsersPage /> },
                    { path: 'users/new', element: <CreateUserPage /> },
                    { path: 'users/:userID/edit', element: <EditUserPage /> },
                  ],
                },
              ],
            },
          ],
        },
        {
          path: '*',
          element: <NotFound />,
        },
      ],
    },
  ];

  return createBrowserRouter(routes, {
    future: {
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
      v7_fetcherPersist: true,
    },
  });
};

function RoutesWrapper() {
  return (
    <>
      <Toaster position="top-right" containerStyle={{ top: 50, zIndex: 99 }} />
      <Outlet />
      <PostHogPageView />
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
