import React from 'react';
import { render } from 'react-dom';

import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';

import { store } from './state';

import Layout from './components/Layout';
import Home from './components/Home';
import HostsList from './components/HostsList';
import ClustersList from './components/ClustersList';
import ChecksSelection from './components/ChecksSelection';
import ChecksResults from './components/ChecksResults';

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
              <Route path="clusters/:clusterID/checks" element={<ChecksSelection />} />
              <Route path="clusters/:clusterID/checks/results" element={<ChecksResults />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </div>
  );
};

render(<App />, document.getElementById('tronto'));
