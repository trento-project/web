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
        },
        {
          name: 'vmhdbqas02',
          id: 'e0c182db-32ff-55c6-a9eb-2b82dd21bc8b',
        },
      ],
    };

    it(`should not display DB ${hdqDatabase.sid} after deregistering the primary instance`, () => {
      cy.deregisterHost(hdqDatabase.instances[0].id);
      cy.contains(hdqDatabase.sid).should('not.exist');
    });

    it(`should display DB ${hdqDatabase.sid} again after restoring the primary instance`, () => {
      cy.loadScenario(`host-${hdqDatabase.instances[0].name}-restore`);
    });

    it(`should include both instances in DB ${hdqDatabase.sid} after restoring the primary instance`, () => {
      cy.contains('tr', hdqDatabase.sid).should('exist').click();
      cy.contains(hdqDatabase.instances[0].name).should('exist');
      cy.contains(hdqDatabase.instances[1].name).should('exist');
    });
  });
});
