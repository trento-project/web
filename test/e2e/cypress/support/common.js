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
