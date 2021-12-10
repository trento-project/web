import React from 'react';
import { render } from 'react-dom';

import { Routes, Route, Link, Outlet, BrowserRouter } from 'react-router-dom';

const Layout = () => {
  return (
    <div />
  );
};

const HostsList = () => <h1>HOSTS LIST</h1>;
const ClustersList = () => <h1>CLUSTERS LIST</h1>;

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index path="hosts" element={<HostsList />} />
          <Route path="clusters" element={<ClustersList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

render(<App />, document.getElementById('tronto'));
