export * from './base_po.js';
import * as basePage from './base_po.js';

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

const hddDatabase = {
  sid: 'HDD',
  instance: {
    instanceNumber: '10',
    row: 1,
  },
};

// Selectors

const hdqDatabaseCell = `tr:contains("${hdqDatabase.sid}")`;

const hddDatabaseCell = `tr:contains("${hddDatabase.sid}")`;

const databaseInstance1 = `a:contains("${hdqDatabase.instances[0].name}")`;
const databaseInstance2 = `a:contains("${hdqDatabase.instances[1].name}")`;

const deletedSapSystemToaster = `p:contains("The SAP System ${nwqSystem.sid} has been deregistered.")`;

const tableGroupRows = '.table-row-group > div.table-row';

const cleanUpButtonModal =
  '#headlessui-portal-root button:contains("Clean up")';

const cleanUpButtons = 'button:contains("Clean up")';

const activePill = 'span:contains("ACTIVE")';

const getCleanUpButtonByIdAndInstanceIndex = (id, index) =>
  `tbody tr:contains("${id}") + tr div[class="table-row-group"] div[class*="table-row border-b"]:nth-child(${
    index + 1
  }) span:contains("Clean up")`;

export const visit = () => basePage.visit('/databases');

// UI Validations

export const hdqDatabaseIsNotDisplayed = () =>
  cy.get(hdqDatabaseCell).should('not.exist');

export const hdqDatabaseIsDisplayed = () =>
  cy.get(hdqDatabaseCell).should('be.visible');

export const hddDatabaseIsNotDisplayed = () =>
  cy.get(hddDatabaseCell).should('not.exist');

export const bothDatabaseInstancesAreDisplayed = () => {
  cy.get(databaseInstance1).should('be.visible');
  return cy.get(databaseInstance2).should('be.visible');
};

export const activePillIsDisplayedInTheRightHost = () => {
  return cy.wrap(hdqDatabase.instances).each((instance) => {
    cy.get(`div.table-row:contains("${instance.name}")`).within(() => {
      const isHostActive = instance.state === 'ACTIVE';
      cy.get(activePill).should(isHostActive ? 'be.visible' : 'not.exist');
    });
  });
};

export const deletedSapSystemToasterIsDisplayed = () =>
  cy.get(deletedSapSystemToaster).should('be.visible');

export const databaseInstancesAreStillTheSame = () =>
  cy.get(tableGroupRows).should('have.length', 6);

export const cleanUpButtonIsEnabled = () =>
  cy.get(cleanUpButtons).should('be.enabled');

export const cleanUpButtonIsDisabled = () =>
  cy.get(cleanUpButtons).should('be.disabled');

export const cleanUpButtonIsDisplayed = () => {
  const cleanUpButtonSelector = getCleanUpButtonByIdAndInstanceIndex(
    hddDatabase.sid,
    hddDatabase.instance.row
  );

  return cy.get(cleanUpButtonSelector).should('be.visible', { timeout: 15000 });
};

export const cleanUpButtonIsNotDisplayed = () => {
  const cleanUpButtonSelector = getCleanUpButtonByIdAndInstanceIndex(
    hddDatabase.sid,
    hddDatabase.instance.row
  );

  return cy.get(cleanUpButtonSelector).should('not.exist', { timeout: 15000 });
};

// UI Interactions

export const clickHdqDatabaseRow = () => cy.get(hdqDatabaseCell).click();

export const clickHddDatabaseRow = () => cy.get(hddDatabaseCell).click();

export const clickCleanUpButton = () => {
  const cleanUpButtonSelector = getCleanUpButtonByIdAndInstanceIndex(
    hddDatabase.sid,
    hddDatabase.instance.row
  );
  return cy.get(cleanUpButtonSelector).click({ timeout: 15000 });
};

export const clickModalCleanUpButton = () => cy.get(cleanUpButtonModal).click();

// API Interactions

export const preloadTestData = () =>
  basePage.preloadTestData({ isDataLoadedFunc: isTestDataLoaded });

const isTestDataLoaded = () =>
  basePage.apiLogin().then(({ accessToken }) =>
    cy
      .request({
        url: '/api/v1/sap_systems',
        method: 'GET',
        auth: {
          bearer: accessToken,
        },
      })
      .then(({ body }) => body.length !== 0)
  );

export const deregisterHdqDatabasePrimaryInstance = () =>
  basePage.apiDeregisterHost(hdqDatabase.instances[0].id);

export const deregisterNwqSystemAscsInstance = () =>
  basePage.apiDeregisterHost(nwqSystem.ascsInstance.id);

export const restoreHdqDatabasePrimaryInstance = () =>
  basePage.loadScenario(`host-${hdqDatabase.instances[0].name}-restore`);

export const markHddDatabaseAsAbsent = () => {
  basePage.loadScenario(
    `sap-systems-overview-${hddDatabase.sid}-${hddDatabase.instance.instanceNumber}-absent`
  );
};

export const markHddDatabaseAsPresent = () => {
  basePage.loadScenario(
    `sap-systems-overview-${hddDatabase.sid}-${hddDatabase.instance.instanceNumber}-present`
  );
};

export const apiCreateUserWithDatabaseTagsAbilities = () =>
  basePage.createUserWithAbilities([
    { name: 'all', resource: 'database_tags' },
  ]);

export const apiCreateUserWithCleanupAbilities = () =>
  basePage.createUserWithAbilities([
    { name: 'cleanup', resource: 'database_instance' },
  ]);

const apiGetDatabases = () => {
  return basePage.apiLogin().then(({ accessToken }) => {
    const url = '/api/v1/databases';
    return cy.request({
      method: 'GET',
      url: url,
      auth: {
        bearer: accessToken,
      },
    });
  });
};

export const apiRemoveAllDatabaseTags = () => {
  apiGetDatabases().then((response) => {
    const databaseTags = basePage.getResourceTags(response.body);
    Object.entries(databaseTags).forEach(([databaseId, tags]) => {
      tags.forEach((tag) => apiRemoveTagByDatabaseId(databaseId, tag));
    });
  });
  return basePage.refresh();
};

const apiRemoveTagByDatabaseId = (databaseId, tagId) => {
  return basePage.apiLogin().then(({ accessToken }) =>
    cy.request({
      url: `/api/v1/databases/${databaseId}/tags/${tagId}`,
      method: 'DELETE',
      auth: { bearer: accessToken },
    })
  );
};
