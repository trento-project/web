import devValues from './values.dev.json';
import prodValues from './values.prod.json';

export const getValue = (key, defaultValue) => {
  const environment = Cypress.env('destination_environment');

  switch (environment) {
    case 'dev':
      return devValues[key];
    case 'prod':
      return prodValues[key];
    default:
      return defaultValue;
  }
};

export const allClusterNames = (availableClusters) =>
  availableClusters.map(([_, clusterName]) => clusterName);

export const allClusterIds = (availableClusters) =>
  availableClusters.map(([clusterId, _]) => clusterId);

export const clusterIdByName = (availableClusters, clusterName) =>
  availableClusters.find(([, name]) => name === clusterName)[0];

export const clusterNameById = (availableClusters, clusterId) =>
  availableClusters.find(([id]) => id === clusterId)[1];
