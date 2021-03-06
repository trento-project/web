import React from 'react';
import { Provider } from 'react-redux';

import { store } from '@state';
import { setHosts } from '@state/hosts';
import { setClusters } from '@state/clusters';
import { setSapSystems } from '@state/sapSystems';

import hosts from './data/hosts';
import clusters from './data/clusters';
import sapSystems from './data/hosts';

export const withState = (component) => {
  store.dispatch(setHosts(hosts));
  store.dispatch(setClusters(clusters));
  store.dispatch(setSapSystems(sapSystems));

  return [
    <Provider key="root" store={store}>
      {component}
    </Provider>,
    store,
  ];
};
