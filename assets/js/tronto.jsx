import React from 'react';
import { render } from 'react-dom';

import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';

import { store } from './state';

import Layout from './components/Layout';
import HostsList from './components/HostsList';

const Home = () => <h1>HOME HERE</h1>;
const ClustersList = () => <h1>CLUSTERS LIST</h1>;

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
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </div>
  );
};

render(<App />, document.getElementById('tronto'));
