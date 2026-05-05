import { architectures, providers } from '@lib/model';
import {
  abilityFactory,
  hostFactory,
  relevantPatchFactory,
  upgradablePackageFactory,
  userFactory,
} from '@lib/test-utils/factories';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router';
import { action } from 'storybook/actions';

import HostDetailsPage from './HostDetailsPage';

const host = hostFactory.build();
const allAbility = abilityFactory.build({ name: 'all', resource: 'all' });
const user = userFactory.build();
const patches = relevantPatchFactory.buildList(3);
const upgradablePackages = upgradablePackageFactory.buildList(5);
const hostListSlice = createSlice({
  name: 'hostsList',
  initialState: {
    hosts: [host],
  },
  reducers: {},
});

const clusterListSlice = createSlice({
  name: 'clustersList',
  initialState: {
    clusters: [],
  },
  reducers: {},
});

const sapSystemsListSlice = createSlice({
  name: 'sapSystemsList',
  initialState: {
    sapSystems: [],
    applicationInstances: [],
  },
  reducers: {},
});

const databasesListSlice = createSlice({
  name: 'databasesList',
  initialState: {
    databases: [],
    databaseInstances: [],
  },
  reducers: {},
});

const catalogSlice = createSlice({
  name: 'catalog',
  initialState: {
    catalogs: [],
  },
  reducers: {},
});

const lastExecutionsSlice = createSlice({
  name: 'lastExecutions',
  initialState: {
    [host.id]: null,
  },
  reducers: {},
});

const checksSelectionSlice = createSlice({
  name: 'checksSelection',
  initialState: {
    host: {
      [host.id]: {},
    },
    cluster: {},
  },
  reducers: {},
});

const softwareUpdatesSlice = createSlice({
  name: 'softwareUpdates',
  initialState: {
    softwareUpdates: {
      [host.id]: {
        loading: false,
        relevant_patches: patches,
        upgradable_packages: upgradablePackages,
        errors: [],
      },
    },
    settingsConfigured: false,
  },
  reducers: {},
});

const runningOperationsSlice = createSlice({
  name: 'runningOperations',
  initialState: {
    operations: {},
  },
  reducers: {},
});

const instancesSlice = createSlice({
  name: 'instances',
  initialState: {
    instances: {},
  },
  reducers: {},
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    username: user.username,
    email: user.email,
    abilities: [allAbility],
    timezone: 'Etc/UTC',
  },
  reducers: {},
});

export default {
  title: 'Components/HostDetailsPage',
  component: HostDetailsPage,
  decorators: [
    (Story) => {
      const mockStore = configureStore({
        reducer: {
          hostsList: hostListSlice.reducer,
          clustersList: clusterListSlice.reducer,
          sapSystemsList: sapSystemsListSlice.reducer,
          databasesList: databasesListSlice.reducer,
          catalog: catalogSlice.reducer,
          lastExecutions: lastExecutionsSlice.reducer,
          checksSelection: checksSelectionSlice.reducer,
          softwareUpdates: softwareUpdatesSlice.reducer,
          runningOperations: runningOperationsSlice.reducer,
          instances: instancesSlice.reducer,
          user: userSlice.reducer,
        },
      });

      return (
        <Provider store={mockStore}>
          <MemoryRouter initialEntries={[`/hosts/${host.id}`]}>
            <Routes>
              <Route path="/hosts/:hostID" element={<Story />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );
    },
  ],
  argTypes: {
    agentVersion: {
      description: 'The agentVersion prop',
      control: { type: 'text' },
    },
    arch: {
      description: 'The arch prop',
      control: { type: 'select' },
      options: architectures,
    },
    chartsEnabled: {
      description: 'The chartsEnabled prop',
      control: { type: 'boolean' },
    },
    cluster: {
      description: 'The cluster prop',
      control: { type: 'text' },
    },
    deregisterable: {
      description: 'The deregisterable prop',
      control: { type: 'boolean' },
    },
    deregistering: {
      description: 'The deregistering prop',
      control: { type: 'boolean' },
    },
    exportersStatus: {
      description: 'The exportersStatus prop',
      control: { type: 'text' },
    },
    heartbeat: {
      description: 'The heartbeat prop',
      control: { type: 'text' },
    },
    hostID: {
      description: 'Identifier for the hostID',
      control: { type: 'text' },
    },
    hostname: {
      description: 'The hostname prop',
      control: { type: 'text' },
    },
    ipAddresses: {
      description: 'The ipAddresses prop',
      control: { type: 'object' },
    },
    lastBootTimestamp: {
      description: 'The lastBootTimestamp prop',
      control: { type: 'text' },
    },
    netmasks: {
      description: 'The netmasks prop',
      control: { type: 'object' },
    },
    provider: {
      description: 'Cloud provider',
      control: { type: 'select' },
      options: [...providers, 'unrecognized-provider'],
    },
    providerData: {
      description: 'Identifier for the providerData',
      control: { type: 'text' },
    },
    sapInstances: {
      description: 'The sapInstances prop',
      control: { type: 'object' },
    },
    savingChecks: {
      description: 'The savingChecks prop',
      control: { type: 'boolean' },
    },
    saptuneStatus: {
      description: 'The saptuneStatus prop',
      control: { type: 'text' },
    },
    selectedChecks: {
      description: 'The selectedChecks prop',
      control: { type: 'object' },
    },
    slesSubscriptions: {
      description: 'The slesSubscriptions prop',
      control: { type: 'object' },
    },
    catalog: {
      description: 'The catalog prop',
      control: { type: 'object' },
    },
    lastExecution: {
      description: 'The lastExecution prop',
      control: { type: 'text' },
    },
    relevantPatches: {
      description: 'The relevantPatches prop',
      control: { type: 'object' },
    },
    upgradablePackages: {
      description: 'The upgradablePackages prop',
      control: { type: 'object' },
    },
    softwareUpdatesLoading: {
      description: 'The softwareUpdatesLoading prop',
      control: { type: 'text' },
    },
    softwareUpdatesSettingsSaved: {
      description: 'The softwareUpdatesSettingsSaved prop',
      control: { type: 'text' },
    },
    softwareUpdatesErrorMessage: {
      description: 'The softwareUpdatesErrorMessage prop',
      control: { type: 'text' },
    },
    softwareUpdatesTooltip: {
      description: 'The softwareUpdatesTooltip prop',
      control: { type: 'text' },
    },
    userAbilities: {
      description: 'The userAbilities prop',
      control: { type: 'object' },
    },
    operationsEnabled: {
      description: 'The operationsEnabled prop',
      control: { type: 'text' },
    },
    runningOperation: {
      description: 'The runningOperation prop',
      control: { type: 'text' },
    },
    cleanUpHost: {
      description: 'Callback function invoked when cleaning up host',
      action: 'cleanUpHost',
    },
    requestHostChecksExecution: {
      description: 'Callback function invoked to request host checks execution',
      action: 'requestHostChecksExecution',
    },
    requestOperation: {
      description: 'Callback function invoked to request an operation',
      action: 'requestOperation',
    },
    cleanForbiddenOperation: {
      description:
        'Callback invoked when a forbidden operation modal is dismissed',
      action: 'cleanForbiddenOperation',
    },
    navigate: {
      description: 'Navigation function',
      action: 'navigate',
    },
    timezone: {
      description: 'The timezone prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    agentVersion: '0.0.1',
    arch: 'x86_64',
    chartsEnabled: true,
    cluster: 'HANA-Cluster',
    deregisterable: false,
    deregistering: false,
    exportersStatus: {},
    heartbeat: 'passing',
    hostID: host.id,
    hostname: host.hostname,
    ipAddresses: ['192.168.1.100'],
    lastBootTimestamp: '2024-01-01T00:00:00Z',
    netmasks: ['255.255.255.0'],
    provider: 'aws',
    providerData: '{}',
    sapInstances: [],
    savingChecks: false,
    saptuneStatus: 'disabled',
    selectedChecks: [],
    slesSubscriptions: [],
    catalog: {},
    lastExecution: null,
    relevantPatches: [],
    upgradablePackages: [],
    softwareUpdatesLoading: false,
    softwareUpdatesSettingsSaved: false,
    softwareUpdatesErrorMessage: '',
    softwareUpdatesTooltip: 'Software updates are not available',
    userAbilities: [],
    operationsEnabled: true,
    runningOperation: null,
    cleanUpHost: action('cleanUpHost'),
    requestHostChecksExecution: action('requestHostChecksExecution'),
    requestOperation: action('requestOperation'),
    cleanForbiddenOperation: action('cleanForbiddenOperation'),
    navigate: action('navigate'),
    timezone: 'Etc/UTC',
  },
};
