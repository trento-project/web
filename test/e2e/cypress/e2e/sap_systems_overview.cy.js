import * as sapSystemsOverviewPage from '../pageObject/sap_systems_overview_po';

import { createUserRequestFactory } from '@lib/test-utils/factories';

import { healthMap } from '../fixtures/sap-systems-overview/available_sap_systems';

context('SAP Systems Overview', () => {
  // before(() => sapSystemsOverviewPage.preloadTestData());

  beforeEach(() => sapSystemsOverviewPage.visit());

  it('should have expected url', () => {
    sapSystemsOverviewPage.validateUrl();
  });

  describe('Registered SAP Systems should be available in the overview', () => {
    describe('Discovered SID are the expected ones', () => {
      it('should have every expected sid name', () => {
        sapSystemsOverviewPage.expectedSidsAreDisplayed();
      });
    });

    describe('System healths are the expected ones', () => {
      it('should have expected health per system', () => {
        sapSystemsOverviewPage.eachSystemHasExpectedHealth();
      });
    });

    describe('Links to the details page are the expected ones', () => {
      it('should have a working link to each SAP System', () => {
        sapSystemsOverviewPage.eachSystemHasItsExpectedWorkingLink();
      });
    });

    describe('Attached databases are the expected ones', () => {
      it('should show the expected attached database details', () => {
        sapSystemsOverviewPage.eachAttachedDatabaseDetailsAreTheExpected();
      });

      it('should have a working link to each attached HANA database', () => {
        sapSystemsOverviewPage.eachSystemHasItsDatabaseWorkingLink();
      });
    });

    describe('Instances are the expected ones', () => {
      it('should show the expected instances details', () => {
        sapSystemsOverviewPage.eachInstanceDetailsAreTheExpected();
      });

      it('should have a link to known type clusters', () => {
        sapSystemsOverviewPage.eachSapSystemHasWorkingLinkToKnownTypeCluster();
      });

      it('should have a link to the hosts', () => {
        sapSystemsOverviewPage.eachInstanceHasItsHostWorkingLink();
      });
    });

    describe('JAVA system discovery', () => {
      beforeEach(() => {
        sapSystemsOverviewPage.tableDisplaysExpectedAmountOfSystems(3);
        sapSystemsOverviewPage.loadJavaScenario();
      });

      after(() => sapSystemsOverviewPage.apiDeregisterJavaSystems());

      it('should discover a JAVA system', () => {
        sapSystemsOverviewPage.javaSystemIsDiscoveredCorrectly();
      });
    });
  });

  describe('SAP Systems Tagging', () => {
    before(() => sapSystemsOverviewPage.apiRemoveAllSapSystemsTags());

    describe('Add tag to SAP System', () => {
      it('should tag SAP System', () => {
        sapSystemsOverviewPage.tagSapSystems();
      });
    });
  });

  describe('Health states are updated', () => {
    Object.entries(healthMap).forEach(([state, health], index) => {
      it(`should have ${state} health in SAP system and instance ${
        index + 1
      } when SAPControl-${state} state is received`, () => {
        cy.loadScenario(`sap-systems-overview-${state}`);

        cy.get('table.table-fixed > tbody > tr')
          .filter(':visible')
          .eq(0)
          .click();

        cy.get('table.table-fixed > tbody > tr')
          .filter(':visible')
          .eq(0)
          .find('td')
          .eq(0)
          .get('svg')
          .should('have.class', health);
        cy.get('table.table-fixed > tbody > tr')
          .filter(':visible')
          .eq(index)
          .next()
          .get('div.table-row-group > div.table-row')
          .eq(index)
          .get('div.table-cell')
          .eq(0)
          .get('svg')
          .should('have.class', health);

        cy.get('table.table-fixed > tbody > tr')
          .filter(':visible')
          .eq(0)
          .click();
      });
    });

    it(`should have RED health in SAP system when HANA instance with SAPControl-RED state is received`, () => {
      cy.loadScenario(`sap-systems-overview-hana-RED`);

      const healthClasses = healthMap['RED'];

      cy.get('table.table-fixed > tbody > tr')
        .filter(':visible')
        .eq(0)
        .find('td')
        .eq(0)
        .get('svg')
        .should('have.class', healthClasses);

      cy.get('table.table-fixed > tbody > tr').filter(':visible').eq(0).click();
      cy.get('table.table-fixed > tbody > tr')
        .filter(':visible')
        .eq(0)
        .next()
        .get('div.table-row-group > div.table-row')
        .eq(5)
        .get('div.table-cell')
        .eq(0)
        .get('svg')
        .should('have.class', healthClasses);

      cy.get('table.table-fixed > tbody > tr').filter(':visible').eq(0).click();
    });
  });

  describe('SAP diagnostics agent', () => {
    it(`should skip SAP diagnostics agent discovery visualization`, () => {
      cy.loadScenario('sap-systems-overview-DAA');
      cy.get('table.table-fixed').should('not.contain', 'DAA');
    });
  });

  describe('Move application instance', () => {
    const nwdSystem = {
      sid: 'NWD',
      id: '67b247e4-ab5b-5094-993a-a4fd70d0e8d1',
      hostId: '9a3ec76a-dd4f-5013-9cf0-5eb4cf89898f',
      instanceNumber: '02',
      hostname: 'vmnwdev01',
    };

    before(() => {
      cy.contains(nwdSystem.sid).should('exist');

      cy.get('table.table-fixed > tbody > tr').eq(0).click();
    });

    after(() => {
      cy.loadScenario('sap-systems-overview-revert-not-moved');
      cy.get('table.table-fixed ').contains('Clean up', { timeout: 15000 });
      cy.deregisterInstance(
        nwdSystem.id,
        nwdSystem.hostId,
        nwdSystem.instanceNumber
      );
    });

    it('should move a clustered application instance', () => {
      cy.loadScenario('sap-systems-overview-moved');

      cy.get('table.table-fixed > tbody > tr')
        .eq(1)
        .find('div.table-row-group')
        .eq(0)
        .find('div.table-row')
        .its('length')
        .should('eq', 4);

      cy.contains(nwdSystem.hostname).should('not.exist');

      cy.loadScenario('sap-systems-overview-revert-moved');
    });

    it('should register a new instance with an already existing instance number, when the application instance is not clustered', () => {
      cy.loadScenario('sap-systems-overview-not-moved');

      cy.get('table.table-fixed > tbody > tr')
        .eq(1)
        .find('div.table-row-group')
        .eq(0)
        .find('div.table-row')
        .its('length')
        .should('eq', 5);
    });
  });

  describe('Deregistration', () => {
    const sapSystemNwp = {
      sid: 'NWP',
      hanaPrimary: {
        name: 'vmhdbprd01',
        id: '9cd46919-5f19-59aa-993e-cf3736c71053',
      },
    };

    const sapSystemNwq = {
      sid: 'NWQ',
      messageserverInstance: {
        name: 'vmnwqas01',
        id: '25677e37-fd33-5005-896c-9275b1284534',
      },
    };

    const sapSystemNwd = {
      sid: 'NWD',
      applicationInstances: [
        {
          name: 'vmnwdev03',
          id: '9a3ec76a-dd4f-5013-9cf0-5eb4cf89898f',
        },
        {
          name: 'vmnwdev04',
          id: '1b0e9297-97dd-55d6-9874-8efde4d84c90',
        },
      ],
    };

    it(`should not display SAP System ${sapSystemNwp.sid} after deregistering the primary instance`, () => {
      cy.deregisterHost(sapSystemNwp.hanaPrimary.id);
      cy.contains(sapSystemNwp.sid).should('not.exist');
    });

    it(`should not display SAP System ${sapSystemNwq.sid} after deregistering the instance running the messageserver`, () => {
      cy.deregisterHost(sapSystemNwq.messageserverInstance.id);
      cy.contains(sapSystemNwq.sid).should('not.exist');
    });

    it(`should not display SAP System ${sapSystemNwd.sid} after deregistering both application instances`, () => {
      cy.deregisterHost(sapSystemNwd.applicationInstances[0].id);
      cy.deregisterHost(sapSystemNwd.applicationInstances[1].id);
      cy.contains(sapSystemNwd.sid).should('not.exist');
    });

    it(`should show host ${sapSystemNwd.sid} registered again after restoring it`, () => {
      cy.loadScenario(`sapsystem-${sapSystemNwd.sid}-restore`);
      cy.contains(sapSystemNwd.sid).should('exist');
    });
  });

  describe('Instance deregistration', () => {
    const nwdSystem = {
      sid: 'NWD',
      messageserverInstance: {
        instanceNumber: '00',
        row: 0,
      },
      appInstance: {
        instanceNumber: '01',
        row: 1,
      },
    };

    before(() => {
      cy.contains(nwdSystem.sid).should('exist');

      cy.get('table.table-fixed > tbody > tr').eq(0).click();
    });

    it('should mark an instance as absent and restore it as present on received respective discovery messages', () => {
      cy.loadScenario(
        `sap-systems-overview-${nwdSystem.sid}-${nwdSystem.appInstance.instanceNumber}-absent`
      );

      cy.get('table.table-fixed > tbody > tr')
        .eq(1)
        .find('div.table-row-group')
        .eq(0)
        .find('div.table-row')
        .eq(nwdSystem.appInstance.row)
        .contains('Clean up', { timeout: 15000 });

      cy.loadScenario(
        `sap-systems-overview-${nwdSystem.sid}-${nwdSystem.appInstance.instanceNumber}-present`
      );

      cy.get('table.table-fixed > tbody > tr')
        .eq(1)
        .find('div.table-row-group')
        .eq(0)
        .find('div.table-row')
        .eq(nwdSystem.appInstance.row)
        .should('not.contain', 'Clean up');
    });

    it('should deregister an application instance', () => {
      cy.loadScenario(
        `sap-systems-overview-${nwdSystem.sid}-${nwdSystem.appInstance.instanceNumber}-absent`
      );

      cy.get('table.table-fixed > tbody > tr')
        .eq(1)
        .find('div.table-row-group')
        .eq(0)
        .find('div.table-row')
        .eq(nwdSystem.appInstance.row)
        .contains('Clean up', { timeout: 15000 })
        .click();

      cy.get('#headlessui-portal-root').as('modal');

      cy.get('@modal').contains('button', 'Clean up').click();

      cy.get('table.table-fixed > tbody > tr')
        .eq(1)
        .find('div.table-row-group')
        .eq(0)
        .find('div.table-row')
        .its('length')
        .should('eq', 3);
    });

    it('should deregister the SAP system after deregistering an absent messageserver', () => {
      cy.loadScenario(
        `sap-systems-overview-${nwdSystem.sid}-${nwdSystem.messageserverInstance.instanceNumber}-absent`
      );

      cy.get('table.table-fixed > tbody > tr')
        .eq(1)
        .find('div.table-row-group')
        .eq(0)
        .find('div.table-row')
        .eq(nwdSystem.messageserverInstance.row)
        .contains('Clean up', { timeout: 15000 })
        .click();

      cy.get('#headlessui-portal-root').as('modal');

      cy.get('@modal').contains('button', 'Clean up').click();

      cy.contains(nwdSystem.sid).should('not.exist');
    });
  });

  describe('Forbidden actions', () => {
    const password = 'password';

    before(() => {
      cy.loadScenario('sapsystem-NWD-restore');
    });

    beforeEach(() => {
      cy.deleteAllUsers();
      cy.logout();
      const user = createUserRequestFactory.build({
        password,
        password_confirmation: password,
      });
      cy.wrap(user).as('user');
    });

    describe('Tag creation', () => {
      it('it should prevent a tag update when the user abilities are not compliant', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });

        cy.visit('/sap_systems');

        cy.contains('span', 'Add Tag').should('have.class', 'opacity-50');
        cy.get('[data-test-id="tag-env3"]').should('have.class', 'opacity-50');
      });

      it('it should allow a tag update when the user abilities are compliant', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'all', resource: 'sap_system_tags' },
          ]);
          cy.login(user.username, password);
        });

        cy.visit('/sap_systems');

        cy.contains('span', 'Add Tag').should('not.have.class', 'opacity-50');
        cy.get('[data-test-id="tag-env3"]').should(
          'not.have.class',
          'opacity-50'
        );
      });
    });

    describe('Application instance clean up', () => {
      before(() => {
        cy.loadScenario('sap-systems-overview-NWD-00-absent');
        cy.loadScenario('sap-systems-overview-HDD-10-present');
      });

      it('should forbid application instance cleanup', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });
        cy.visit('/sap_systems');

        cy.contains('button', 'Clean up').should('be.disabled');
      });

      it('should allow application instance clenaup', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'cleanup', resource: 'application_instance' },
          ]);
          cy.login(user.username, password);
        });
        cy.visit('/sap_systems');

        cy.contains('button', 'Clean up').should('be.enabled');
      });
    });

    describe('Database instance clean up', () => {
      before(() => {
        cy.loadScenario('sap-systems-overview-NWD-00-present');
        cy.loadScenario('sap-systems-overview-HDD-10-absent');
      });

      it('should forbid database instance cleanup', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });
        cy.visit('/sap_systems');

        cy.contains('button', 'Clean up').should('be.disabled');
      });

      it('should allow database instance clean up', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'cleanup', resource: 'database_instance' },
          ]);
          cy.login(user.username, password);
        });
        cy.visit('/sap_systems');

        cy.contains('button', 'Clean up').should('be.enabled');
      });
    });
  });
});
