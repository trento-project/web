export * from './base-po.js';
import * as basePage from './base-po.js';

// Test Data
export const hdqDatabase = {
  sid: 'HDQ',
  instances: [
    {
      name: 'vmhdbqas01',
      id: '99cf8a3a-48d6-57a4-b302-6e4482227ab6',
      state: '',
    },
    {
      name: 'vmhdbqas02',
      id: 'e0c182db-32ff-55c6-a9eb-2b82dd21bc8b',
      state: 'ACTIVE',
    },
  ],
};

const nwqSystem = {
  sid: 'NWQ',
  ascsInstance: {
    id: '25677e37-fd33-5005-896c-9275b1284534',
  },
};

// Selectors
const hdqDatabaseCell = `tr:contains("${hdqDatabase.sid}")`;

const databaseInstace1 = `a:contains("${hdqDatabase.instances[0].name}")`;
const databaseInstace2 = `a:contains("${hdqDatabase.instances[1].name}")`;

const deletedSapSystemToaster = `p:contains("The SAP System ${nwqSystem.sid} has been deregistered.")`;

const tableGroupRows = '.table-row-group > div.table-row';

export const visit = () => basePage.visit('/databases');

export const deregisterHdqDatabasePrimaryInstance = () =>
  basePage.apiDeregisterHost(hdqDatabase.instances[0].id);

export const deregisterNwqSystemAscsInstance = () =>
  basePage.apiDeregisterHost(nwqSystem.ascsInstance.id);

export const restoreHdqDatabasePrimaryInstance = () =>
  basePage.loadScenario(`host-${hdqDatabase.instances[0].name}-restore`);

export const hdqDatabaseIsNotDisplayed = () =>
  cy.get(hdqDatabaseCell).should('not.exist');

export const hdqDatabaseIsDisplayed = () =>
  cy.get(hdqDatabaseCell).should('be.visible');

export const clickHdqDatabaseRow = () => cy.get(hdqDatabaseCell).click();

export const bothDatabaseInstancesAreDisplayed = () => {
  cy.get(databaseInstace1).should('be.visible');
  return cy.get(databaseInstace2).should('be.visible');
};

export const activePillIsDisplayedInTheRightHost = () => {
  hdqDatabase.instances.forEach((instance) => {
    cy.get(`div.table-row:contains("${instance.name}")`).within(() => {
      if (instance.state === 'ACTIVE') {
        cy.contains('ACTIVE').should('exist');
      } else {
        cy.contains('ACTIVE').should('not.exist');
      }
    });
  });
};

export const deletedSapSystemToasterIsDisplayed = () =>
  cy.get(deletedSapSystemToaster).should('be.visible');

export const databaseInstancesAreStillTheSame = () =>
  cy.get(tableGroupRows).should('have.length', 6);
