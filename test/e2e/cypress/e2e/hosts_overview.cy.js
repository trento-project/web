import * as hostsOverviewPage from '../pageObject/hosts_overview_po';

import { createUserRequestFactory } from '@lib/test-utils/factories';

const NEXT_PAGE_SELECTOR = '[aria-label="next-page"]';

context('Hosts Overview', () => {
  before(() => hostsOverviewPage.preloadTestData());

  beforeEach(() => hostsOverviewPage.visit());

  it('should have expected url', () => {
    hostsOverviewPage.validateUrl();
  });

  describe('Registered Hosts are shown in the list', () => {
    it('should highlight the hosts sidebar entry', () => {
      hostsOverviewPage.hostsIsHighglightedInSidebar();
    });

    it('should show 10 of the 27 registered hosts', () => {
      hostsOverviewPage.tenHostsAreListed();
    });

    it('should have 3 pages', () => {
      hostsOverviewPage.expectedPaginationIsDisplayed('Showing 1–10 of 27');
      hostsOverviewPage.clickNextPageButton();
      hostsOverviewPage.expectedPaginationIsDisplayed('Showing 11–20 of 27');
      hostsOverviewPage.clickNextPageButton();
      hostsOverviewPage.expectedPaginationIsDisplayed('Showing 21–27 of 27');
      hostsOverviewPage.nextPageButtonIsDisabled();
    });

    it('should show the ip addresses, provider and agent version data for the hosts in the 1st page', () => {
      hostsOverviewPage.hostsTableContentsAreTheExpected();
    });

    it('should link to the correct host details page clicking in the host name', () => {
      hostsOverviewPage.everyLinkGoesToExpectedHostDetailsPage();
    });

    it('should link to the correct cluster details page clicking in the cluster name', () => {
      hostsOverviewPage.everyClusterLinkGoesToExpectedClusterDetailsPage();
    });

    it('should link to the correct sap system details page clicking in the sap system name', () => {
      hostsOverviewPage.everySapSystemLinkGoesToExpectedSapSystemDetailsPage();
    });
  });

  describe('Health Detection', () => {
    describe('Health Container shows the health overview of the deployed landscape', () => {
      before(() => {
        hostsOverviewPage.startAgentsHeartbeat();
      });

      it('should show health status of the entire cluster of 27 hosts with partial pagination', () => {
        hostsOverviewPage.expectedPassingHostsAreDisplayed(11);
        hostsOverviewPage.expectedWarningHostsAreDisplayed(12);
        hostsOverviewPage.expectedCriticalHostsAreDisplayed(4);
      });

      it('should show the correct health on the hosts when the agents are sending the heartbeat', () => {
        hostsOverviewPage.expectedAmountOfPassingIsDisplayed(8);
        hostsOverviewPage.expectedAmountOfWarningsIsDisplayed(2);
      });

      after(() => hostsOverviewPage.stopAgentsHeartbeat());
    });

    describe('Health is changed based on saptune status', () => {
      before(() => hostsOverviewPage.startAgentsHeartbeat());

      it('should not change the health if saptune is not installed and a SAP workload is not running', () => {
        hostsOverviewPage.loadHostWithoutSaptune();
        hostsOverviewPage.hostWithSapHasExpectedStatus();
      });

      it('should not change the health if saptune is installed and a SAP workload is not running', () => {
        hostsOverviewPage.loadHostWithSaptuneNotTuned();
        hostsOverviewPage.hostWithSapHasExpectedStatus();
      });

      it('should change the health to warning if saptune is not installed', () => {
        hostsOverviewPage.loadHostWithSapWithoutSaptune();
        hostsOverviewPage.hostWithoutSapHasExpectedStatus();
      });

      it('should change the health to warning if saptune version is unsupported', () => {
        hostsOverviewPage.loadHostWithSapWithSaptuneUnsupported();
        hostsOverviewPage.hostWithoutSapHasExpectedStatus();
      });

      it('should change health to not compliant when saptune is not compliant', () => {
        hostsOverviewPage.loadHostWithSaptuneScenario('not-compliant');
        hostsOverviewPage.hostWithSaptuneNotCompliantHasExpectedStatus();
      });

      it('should change health to not tuned when saptune is not tuned', () => {
        hostsOverviewPage.loadHostWithSaptuneScenario('not-tuned');
        hostsOverviewPage.hostWithSaptuneNotTunedHasExpectedStatus();
      });

      it('should change health to compliant when saptune is compliant', () => {
        hostsOverviewPage.loadHostWithSaptuneScenario('compliant');
        hostsOverviewPage.hostWithSaptuneCompliantHasExpectedStatus();
      });

      after(() => hostsOverviewPage.stopAgentsHeartbeat());
    });

    describe('Health is changed to critical when the heartbeat is not sent', () => {
      beforeEach(() => hostsOverviewPage.startAgentsHeartbeat());

      it('should show health status of the entire cluster of 27 hosts with critical health', () => {
        hostsOverviewPage.expectedCriticalHostsAreDisplayed(4);
        hostsOverviewPage.stopAgentsHeartbeat();
        hostsOverviewPage.expectedCriticalHostsAreDisplayed(27);
      });

      it('should show a critical health on the hosts when the agents are not sending the heartbeat', () => {
        hostsOverviewPage.expectedAmountOfCriticalsIsDisplayed(0);
        hostsOverviewPage.stopAgentsHeartbeat();
        hostsOverviewPage.expectedAmountOfCriticalsIsDisplayed(10);
      });

      after(() => hostsOverviewPage.stopAgentsHeartbeat());
    });
  });

  describe('Deregistration', () => {
    describe('Clean-up buttons should be visible only when needed', () => {
      it('should not display a clean-up button when hearbeat is sent', () => {
        hostsOverviewPage.cleanupButtonIsDisplayedForHostSendingHeartbeat();
        hostsOverviewPage.startAgentHeartbeat();
        hostsOverviewPage.cleanupButtonIsNotDisplayedForHostSendingHeartbeat();
      });

      it('should show all other cleanup buttons', () => {
        hostsOverviewPage.expectedAmountOfCleanupButtonsIsDisplayed(10);
        hostsOverviewPage.startAgentHeartbeat();
        hostsOverviewPage.expectedAmountOfCleanupButtonsIsDisplayed(9);
      });

      afterEach(() => hostsOverviewPage.stopAgentsHeartbeat());
    });

    describe('Clean-up button should deregister a host', () => {
      beforeEach(() => {
        hostsOverviewPage.startAgentHeartbeat();
        // hostsOverviewPage.addTagToHost();
      });

      it.only('should allow to deregister a host after clean up confirmation', () => {
        hostsOverviewPage.stopAgentsHeartbeat();
        hostsOverviewPage.heartbeatFailingToasterIsDisplayed();
        hostsOverviewPage.clickCleanupOnHostToDeregister();
        hostsOverviewPage.deregisterModalTitleIsDisplayed();
        hostsOverviewPage.clickCleanupConfirmationButton();
        hostsOverviewPage.deregisteredHostIsNotVisible();
      });

      describe('Restoration', () => {
        // it(`should show host ${hostToDeregister.name} registered again after restoring the host with the tag`, () => {
        //   cy.loadScenario(`host-${hostToDeregister.name}-restore`);
        //   cy.contains(hostToDeregister.name).should('exist');
        //   cy.contains('tr', hostToDeregister.name).within(() => {
        //     cy.contains(hostToDeregister.tag).should('exist');
        //   });
        // });
      });

      describe('Deregistration of hosts should update remaining hosts data', () => {
        const sapSystemHostToDeregister = {
          id: '7269ee51-5007-5849-aaa7-7c4a98b0c9ce',
          sid: 'NWD',
        };

        before(() => {
          cy.visit('/hosts');
          cy.url().should('include', '/hosts');
          cy.loadScenario(`sapsystem-${sapSystemHostToDeregister.sid}-restore`);
        });

        it('should remove the SAP system sid from hosts belonging the deregistered SAP system', () => {
          cy.get(NEXT_PAGE_SELECTOR).click();
          cy.contains('a', sapSystemHostToDeregister.sid).should('exist');
          cy.deregisterHost(sapSystemHostToDeregister.id);
          cy.contains('a', sapSystemHostToDeregister.sid).should('not.exist');
        });
      });

      describe('Movement of application instances on hosts', () => {
        const sapSystemHostsToDeregister = {
          sid: 'NWD',
          movedHostId: 'fb2c6b8a-9915-5969-a6b7-8b5a42de1971',
          initialHostId: '7269ee51-5007-5849-aaa7-7c4a98b0c9ce',
          initialHostname: 'vmnwdev01',
        };

        before(() => {
          cy.visit('/hosts');
          cy.url().should('include', '/hosts');
          cy.loadScenario(
            `sapsystem-${sapSystemHostsToDeregister.sid}-restore`
          );
          cy.loadScenario('sap-systems-overview-moved');
        });

        after(() => {
          cy.loadScenario(
            `sapsystem-${sapSystemHostsToDeregister.sid}-restore`
          );
        });

        it('should associate instances to the correct host during deregistration', () => {
          cy.get(NEXT_PAGE_SELECTOR).click();
          cy.contains('a', sapSystemHostsToDeregister.sid).should('exist');
          cy.deregisterHost(sapSystemHostsToDeregister.movedHostId);
          cy.contains('a', sapSystemHostsToDeregister.sid).should('not.exist');
        });

        it('should complete host deregistration when all instances are moved out', () => {
          cy.contains('a', sapSystemHostsToDeregister.hostname).should('exist');
          cy.deregisterHost(sapSystemHostsToDeregister.initialHostId);
          cy.contains('a', sapSystemHostsToDeregister.initialHostname).should(
            'not.exist'
          );
        });
      });
    });
  });

  describe('Forbidden actions', () => {
    const password = 'password';

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

        cy.visit('/hosts');

        cy.contains('span', 'Add Tag').should('have.class', 'opacity-50');
        cy.get('[data-test-id="tag-tag1"]').should('have.class', 'opacity-50');
      });

      it('it should allow a tag update when the user abilities are compliant', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'all', resource: 'host_tags' },
          ]);
          cy.login(user.username, password);
        });

        cy.visit('/hosts');

        cy.contains('span', 'Add Tag').should('not.have.class', 'opacity-50');
        cy.get('[data-test-id="tag-tag1"]').should(
          'not.have.class',
          'opacity-50'
        );
      });
    });

    describe('Clean up', () => {
      it('should forbid host clean up', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });
        cy.visit(`/hosts`);

        cy.contains('button', 'Clean up').should('be.disabled');
      });

      it('should allow host clean up', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'cleanup', resource: 'host' },
          ]);
          cy.login(user.username, password);
        });
        cy.visit(`/hosts`);

        cy.contains('button', 'Clean up').should('be.enabled');
      });
    });
  });
});
