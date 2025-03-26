import * as sapSystemsOverviewPage from '../pageObject/sap_systems_overview_po';

import { createUserRequestFactory } from '@lib/test-utils/factories';

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
    beforeEach(() => sapSystemsOverviewPage.restoreNwdHost());

    it('should have expected health in SAP system and instance when a different state is received', () => {
      sapSystemsOverviewPage.eachInstanceHasItsHealthStatusCorrectlyUpdated();
    });

    it('should have RED health in SAP system when HANA instance with SAPControl-RED state is received', () => {
      sapSystemsOverviewPage.sapSystemHealthChangesToRedAsExpected();
    });
  });

  describe('SAP diagnostics agent', () => {
    it('should skip SAP diagnostics agent discovery visualization', () => {
      sapSystemsOverviewPage.sapDiagnosticsAgentDiscoveryVisualizationIsSkipped();
    });
  });

  describe('Move application instance', () => {
    beforeEach(() => {
      sapSystemsOverviewPage.revertMovedScenario();
      sapSystemsOverviewPage.systemNwdIsVisible();
      sapSystemsOverviewPage.clickSystemToRemove();
    });

    it('should move a clustered application instance', () => {
      sapSystemsOverviewPage.loadMovedScenario();
      sapSystemsOverviewPage.systemApplicationLayerRowsAreTheExpected(4);
      sapSystemsOverviewPage.movedSystemIsNotDisplayed();
    });

    it('should register a new instance with an already existing instance number, when the application instance is not clustered', () => {
      sapSystemsOverviewPage.cleanUpButtonIsNotDisplayed();
      sapSystemsOverviewPage.loadNotMovedScenario();
      sapSystemsOverviewPage.systemApplicationLayerRowsAreTheExpected(5);
      sapSystemsOverviewPage.revertNotMovedScenario();
      sapSystemsOverviewPage.cleanUpButtonIsDisplayed();
      sapSystemsOverviewPage.deregisterInstance();
    });
  });

  describe('Deregistration', () => {
    it('should not display SAP System after deregistering the primary instance', () => {
      sapSystemsOverviewPage.nwpSystemIsDisplayed();
      sapSystemsOverviewPage.apiDeregisterNwpHost();
      sapSystemsOverviewPage.nwpSystemIsNotDisplayed();
    });

    it('should not display SAP System after deregistering the instance running the messageserver', () => {
      sapSystemsOverviewPage.nwqSystemIsDisplayed();
      sapSystemsOverviewPage.apiDeregisterNwqHost();
      sapSystemsOverviewPage.nwqSystemIsNotDisplayed();
    });

    it('should not display SAP System ${sapSystemNwd.sid} after deregistering both application instances', () => {
      sapSystemsOverviewPage.nwdSystemIsDisplayed();
      sapSystemsOverviewPage.apiDeregisterNwdInstances();
      sapSystemsOverviewPage.nwdSystemIsNotDisplayed();
    });

    describe('Restore deregistered host', () => {
      beforeEach(() => {
        sapSystemsOverviewPage.restoreNwdHost();
        sapSystemsOverviewPage.apiDeregisterNwdInstances();
      });

      it('should show host registered again after restoring it', () => {
        sapSystemsOverviewPage.restoreNwdHost();
        sapSystemsOverviewPage.nwdSystemIsDisplayed();
      });
    });
  });

  describe('Instance deregistration', () => {
    beforeEach(() => {
      sapSystemsOverviewPage.restoreNwdHost();
      sapSystemsOverviewPage.nwdSystemIsDisplayed();
      sapSystemsOverviewPage.clickNwdSystem();
    });

    it('should mark an instance as absent and restore it as present on received respective discovery messages', () => {
      sapSystemsOverviewPage.loadAbsentInstanceScenario();
      sapSystemsOverviewPage.nwdInstance01CleanUpButtonIsVisible();
      sapSystemsOverviewPage.loadPresentInstanceScenario();
      sapSystemsOverviewPage.nwdInstance01CleanUpButtonIsNotVisible();
    });

    it('should deregister an application instance', () => {
      sapSystemsOverviewPage.systemApplicationLayerRowsAreTheExpected(4);
      sapSystemsOverviewPage.loadAbsentInstanceScenario();
      sapSystemsOverviewPage.clickNwdInstance01CleanUpButton();
      sapSystemsOverviewPage.clickCleanupModalConfirmationButton();
      sapSystemsOverviewPage.systemApplicationLayerRowsAreTheExpected(3);
    });

    it('should deregister the SAP system after deregistering an absent messageserver', () => {
      sapSystemsOverviewPage.systemNwdIsVisible();
      sapSystemsOverviewPage.loadAbsentMessageServerInstance();
      sapSystemsOverviewPage.clickNwdInstance00CleanUpButton();
      sapSystemsOverviewPage.clickCleanupModalConfirmationButton();
      sapSystemsOverviewPage.systemNwdIsNotDisplayed();
    });
  });

  describe('Forbidden actions', () => {
    const password = 'password';

    before(() => sapSystemsOverviewPage.restoreNwdHost());

    beforeEach(() => {
      sapSystemsOverviewPage.apiDeleteAllUsers();
      sapSystemsOverviewPage.apiRemoveAllSapSystemsTags();
      sapSystemsOverviewPage.apiSetTagNwdSystem();
      sapSystemsOverviewPage.logout();
      const user = createUserRequestFactory.build({
        password,
        password_confirmation: password,
      });
      cy.wrap(user).as('user');
    });

    describe('Tag creation', () => {
      it('it should prevent a tag update when the user abilities are not compliant', () => {
        sapSystemsOverviewPage.apiCreateUserWithoutAbilities();
        sapSystemsOverviewPage.loginWithoutAbilities();
        sapSystemsOverviewPage.visit();
        sapSystemsOverviewPage.addTagButtonIsDisabled();
        sapSystemsOverviewPage.existentTagCannotBeModified();
      });

      it('it should allow a tag update when the user abilities are compliant', () => {
        sapSystemsOverviewPage.apiCreateUserWithSapSystemTagsAbility();
        sapSystemsOverviewPage.loginWithAbilities();
        sapSystemsOverviewPage.visit();
        sapSystemsOverviewPage.addTagButtonIsEnabled();
        sapSystemsOverviewPage.existentTagCanBeModified();
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
