import { createUserRequestFactory } from '@lib/test-utils/factories';

context('Databases Overview', () => {
  before(() => {
    cy.loadScenario('healthy-27-node-SAP-cluster');
    cy.visit('/databases');
    cy.url().should('include', '/databases');
  });

  describe('Deregistration', () => {
    const hdqDatabase = {
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

    it(`should not display DB ${hdqDatabase.sid} after deregistering the primary instance`, () => {
      cy.deregisterHost(hdqDatabase.instances[0].id);
      cy.contains(hdqDatabase.sid).should('not.exist');
    });

    it(`should display DB ${hdqDatabase.sid} again after restoring the primary instance`, () => {
      cy.loadScenario(`host-${hdqDatabase.instances[0].name}-restore`);
      cy.contains('tr', hdqDatabase.sid).should('exist').click();
    });

    it(`should include both instances in DB ${hdqDatabase.sid} after restoring the primary instance`, () => {
      cy.contains('div', hdqDatabase.instances[0].name).should('exist');
      cy.contains('div', hdqDatabase.instances[1].name).should('exist');
    });

    it('should show the ACTIVE pill in the right host', () => {
      hdqDatabase.instances.forEach((instance) => {
        cy.contains('div.table-row', instance.name).within(() => {
          if (instance.state === 'ACTIVE') {
            cy.contains('ACTIVE').should('exist');
          } else {
            cy.contains('ACTIVE').should('not.exist');
          }
        });
      });
    });

    it('should not deregister database instances if the SAP system using the database is deregistered', () => {
      cy.deregisterHost(nwqSystem.ascsInstance.id);
      cy.contains(
        'p',
        `The SAP System ${nwqSystem.sid} has been deregistered.`
      );
      cy.get('.table-row-group > div.table-row').should('have.length', 6);
    });
  });

  describe('Instance deregistration', () => {
    const hddDatabase = {
      sid: 'HDD',
      instance: {
        instanceNumber: '10',
        row: 1,
      },
    };

    before(() => {
      cy.contains(hddDatabase.sid).should('exist');

      cy.get('table.table-fixed > tbody > tr').eq(0).click();
    });

    it('should mark an instance as absent and restore it as present on received respective discovery messages', () => {
      cy.loadScenario(
        `sap-systems-overview-${hddDatabase.sid}-${hddDatabase.instance.instanceNumber}-absent`
      );

      cy.get('table.table-fixed > tbody > tr')
        .eq(1)
        .find('div.table-row-group')
        .eq(0)
        .find('div.table-row')
        .eq(hddDatabase.instance.row)
        .contains('Clean up', { timeout: 15000 });

      cy.loadScenario(
        `sap-systems-overview-${hddDatabase.sid}-${hddDatabase.instance.instanceNumber}-present`
      );

      cy.get('table.table-fixed > tbody > tr')
        .eq(1)
        .find('div.table-row-group')
        .eq(0)
        .find('div.table-row')
        .eq(hddDatabase.instance.row)
        .should('not.contain', 'Clean up');
    });

    it('should deregister the database after deregistering an absent primary', () => {
      cy.loadScenario(
        `sap-systems-overview-${hddDatabase.sid}-${hddDatabase.instance.instanceNumber}-absent`
      );

      cy.get('table.table-fixed > tbody > tr')
        .eq(1)
        .find('div.table-row-group')
        .eq(0)
        .find('div.table-row')
        .eq(hddDatabase.instance.row)
        .contains('Clean up', { timeout: 15000 })
        .click();

      cy.get('#headlessui-portal-root').as('modal');

      cy.get('@modal').contains('button', 'Clean up').click();

      cy.contains(hddDatabase.sid).should('not.exist');
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
      before(() => {
        cy.addTagByColumnValue('HDQ', 'env1');
      });
      it('it should prevent a tag update when the user abilities are not compliant', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });

        cy.visit('/databases');

        cy.contains('span', 'Add Tag').should('have.class', 'opacity-50');
        cy.get('[data-test-id="tag-env1"]').should('have.class', 'opacity-50');
      });

      it('it should allow a tag update when the user abilities are compliant', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'all', resource: 'database_tags' },
          ]);
          cy.login(user.username, password);
        });

        cy.visit('/databases');

        cy.contains('span', 'Add Tag').should('not.have.class', 'opacity-50');
        cy.get('[data-test-id="tag-env1"]').should(
          'not.have.class',
          'opacity-50'
        );
      });
    });

    describe('Database instance clean up', () => {
      before(() => {
        cy.loadScenario('sap-systems-overview-HDD-10-present');
        cy.loadScenario('sap-systems-overview-HDD-10-absent');
      });

      it('should forbid database instance cleanup', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });
        cy.visit('/databases');

        cy.contains('button', 'Clean up').should('be.disabled');
      });

      it('should allow database instance clean up', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'cleanup', resource: 'database_instance' },
          ]);
          cy.login(user.username, password);
        });
        cy.visit('/databases');

        cy.contains('button', 'Clean up').should('be.enabled');
      });
    });
  });
});
