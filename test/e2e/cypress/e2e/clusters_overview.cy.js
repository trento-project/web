import { createUserRequestFactory } from '@lib/test-utils/factories';

import {
  availableClusters,
  healthyClusterScenario,
  unhealthyClusterScenario,
} from '../fixtures/clusters-overview/available_clusters';

const clusterIdByName = (clusterName) =>
  availableClusters.find(({ name }) => name === clusterName).id;

const clusterTags = {
  hana_cluster_1: 'env1',
  hana_cluster_2: 'env2',
  hana_cluster_3: 'env3',
};

context('Clusters Overview', () => {
  before(() => {
    // cy.loadScenario('healthy-29-node-SAP-cluster');
    cy.visit('/clusters');
    cy.url().should('include', '/clusters');
  });

  describe('Registered Clusters should be available in the overview', () => {
    it('should show all of the registered clusters', () => {
      cy.get('.tn-clustername')
        .its('length')
        .should('eq', availableClusters.length);
    });

    it('should have 1 pages', () => {
      cy.get(`[data-testid="pagination"]`).should('include.text', '1');
      cy.get(`[data-testid="pagination"]`).should('not.include.text', '2');
    });

    it('should show the expected clusters data', () => {
      cy.get('.container').eq(0).as('clustersTable');
      availableClusters.forEach((cluster, index) => {
        cy.get('@clustersTable')
          .find('tr')
          .eq(index + 1)
          .find('td')
          .as('clusterRow');

        cy.get('@clustersTable')
          .contains('th', 'Name')
          .invoke('index')
          .then((i) => {
            cy.get('@clusterRow').eq(i).should('contain', cluster.name);
          });

        cy.get('@clustersTable')
          .contains('th', 'SID')
          .invoke('index')
          .then((i) => {
            cluster.sids.forEach((sid) => {
              cy.get('@clusterRow').eq(i).should('contain', sid);
            });
          });

        cy.get('@clustersTable')
          .contains('th', 'Type')
          .invoke('index')
          .then((i) => {
            cy.get('@clusterRow').eq(i).should('contain', cluster.type);
          });
      });
    });

    describe('Unnamed cluster', () => {
      before(() => {
        cy.loadScenario('cluster-unnamed');
      });

      // Restore cluster name
      after(() => {
        cy.loadScenario('cluster-4-SOK');
      });

      it('Unnamed clusters should use the ID as details page link', () => {
        const clusterID = clusterIdByName('hana_cluster_1');
        cy.get(`a:contains(${clusterID})`).should('be.visible');
      });
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    describe.skip('Health status for each cluster is correct', () => {
      before(() => {
        cy.selectChecks(
          clusterIdByName(healthyClusterScenario.clusterName),
          healthyClusterScenario.checks
        );
        // wip: set expected results
        cy.requestChecksExecution(
          clusterIdByName(healthyClusterScenario.clusterName)
        );

        cy.selectChecks(
          clusterIdByName(unhealthyClusterScenario.clusterName),
          healthyClusterScenario.checks
        );
        // wip: set expected results
        cy.requestChecksExecution(
          clusterIdByName(unhealthyClusterScenario.clusterName)
        );
      });

      after(() => {
        cy.selectChecks(
          clusterIdByName(healthyClusterScenario.clusterName),
          []
        );

        cy.selectChecks(
          clusterIdByName(unhealthyClusterScenario.clusterName),
          []
        );
      });

      it(`should have ${healthyClusterScenario.clusterName} displaying healthy state`, () => {
        cy.get('td')
          .contains(healthyClusterScenario.clusterName)
          .parent()
          .parent()
          .prev()
          .get('div > svg')
          .should('have.class', 'fill-jungle-green-500');
      });

      it(`should have ${unhealthyClusterScenario.clusterName} displaying unhealthy state`, () => {
        cy.get('td')
          .contains(unhealthyClusterScenario.clusterName)
          .parent()
          .parent()
          .prev()
          .get('div > svg')
          .should('have.class', 'fill-red-500');
      });
    });
  });

  describe('Clusters Tagging', () => {
    before(() => {
      cy.removeTagsFromView();
    });
    const clustersByMatchingPattern = (pattern) => (clusterName) =>
      clusterName.includes(pattern);
    const taggingRules = [
      ['hana_cluster_1', clusterTags.hana_cluster_1],
      ['hana_cluster_2', clusterTags.hana_cluster_2],
      ['hana_cluster_3', clusterTags.hana_cluster_3],
    ];

    taggingRules.forEach(([pattern, tag]) => {
      describe(`Add tag '${tag}' to all clusters with '${pattern}' in the cluster name`, () => {
        availableClusters
          .map(({ name }) => name)
          .filter(clustersByMatchingPattern(pattern))
          .forEach((clusterName) => {
            it(`should tag cluster '${clusterName}'`, () => {
              cy.addTagByColumnValue(clusterName, tag);
            });
          });
      });
    });
  });

  describe('Deregistration', () => {
    const hanaCluster1 = {
      name: 'hana_cluster_1',
      hosts: [
        '13e8c25c-3180-5a9a-95c8-51ec38e50cfc',
        '0a055c90-4cb6-54ce-ac9c-ae3fedaf40d4',
      ],
    };

    it(`should not display '${hanaCluster1.name}' after deregistering all its nodes`, () => {
      cy.deregisterHost(hanaCluster1.hosts[0]);
      cy.deregisterHost(hanaCluster1.hosts[1]);
      cy.contains(hanaCluster1.name).should('not.exist');
    });

    it(`should show cluster ${hanaCluster1.name} after registering it again with the previous tags`, () => {
      cy.loadScenario(`cluster-${hanaCluster1.name}-restore`);
      cy.contains(hanaCluster1.name).should('exist');
      cy.contains('tr', hanaCluster1.name).within(() => {
        cy.contains(clusterTags[hanaCluster1.name]).should('exist');
      });
    });
  });

  describe('Forbidden action', () => {
    beforeEach(() => {
      cy.deleteAllUsers();
      cy.logout();
      const user = createUserRequestFactory.build({
        password,
        password_confirmation: password,
      });
      cy.wrap(user).as('user');
    });

    const password = 'password';

    describe('Tag operations', () => {
      it('should prevent a tag update when the user abilities are not compliant', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });

        cy.visit('/clusters');

        cy.contains('span', 'Add Tag').should('have.class', 'opacity-50');
        cy.get('[data-test-id="tag-env1"]').should('have.class', 'opacity-50');
      });

      it('should allow a tag update when the user abilities are compliant', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'all', resource: 'cluster_tags' },
          ]);
          cy.login(user.username, password);
        });

        cy.visit('/clusters');

        cy.contains('span', 'Add Tag').should('not.have.class', 'opacity-50');
        cy.get('[data-test-id="tag-env1"]').should(
          'not.have.class',
          'opacity-50'
        );
      });
    });
  });
});
