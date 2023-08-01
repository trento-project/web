context('Databases Overview', () => {
  before(() => {
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

    it.skip('should show the ACTIVE pill in the right host', () => {
      hdqDatabase.instances.forEach((instance) => {
        cy.contains('div', instance.name).within(() => {
          if (instance.state === 'ACTIVE') {
            cy.contains('ACTIVE').should('exist');
          } else {
            cy.contains('ACTIVE').should('not.exist');
          }
        });
      });
    });
  });
});
