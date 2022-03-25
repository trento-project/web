import React from 'react';
import { render } from 'react-dom';

import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';

import { store } from './state';

import Layout from '@components/Layout';
import Home from '@components/Home';
import AboutPage from '@components/AboutPage';
import HostsList from '@components/HostsList';
import ClustersList from '@components/ClustersList';
import ChecksSelection from '@components/ChecksSelection';
import ChecksResults from '@components/ChecksResults';
import SapSystemsOverview from '@components/SapSystemsOverview';
import HostDetails from '@components/HostDetails';
import DatabasesOverview from '@components/DatabasesOverview';
import SapSystemDetails from './components/SapSystemDetails/SapSystemDetails';
import DatabaseDetails from './components/DatabaseDetails';

const App = () => {
  return (
    <div>
      <Provider store={store}>
        <Toaster position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route index path="hosts" element={<HostsList />} />
              <Route path="clusters" element={<ClustersList />} />
              <Route path="sap-systems" element={<SapSystemsOverview />} />
              <Route path="databases" element={<DatabasesOverview />} />
              <Route path="about" element={<AboutPage />} />
              <Route
                path="clusters/:clusterID/checks"
                element={<ChecksSelection />}
              />
              <Route
                path="clusters/:clusterID/checks/results"
                element={<ChecksResults />}
              />
              <Route path="hosts/:hostID" element={<HostDetails />} />
              <Route path="sap-systems/:id" element={<SapSystemDetails />} />
              <Route path="databases/:id" element={<DatabaseDetails />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </div>
  );
};

render(<App />, document.getElementById('trento'));
