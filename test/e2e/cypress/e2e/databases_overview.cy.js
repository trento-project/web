context('Databases Overview', () => {
  before(() => {
    cy.visit('/databases');
    cy.url().should('include', '/databases');
  });

  describe('Deregistration', () => {
    const hdqDatabase = {
      sid: 'HDQ',
      hanaPrimary: {
        name: 'vmhdbqas01',
        id: '99cf8a3a-48d6-57a4-b302-6e4482227ab6',
      },
    };

    it(`should not display DB ${hdqDatabase.sid} after deregistering the primary instance`, () => {
      cy.deregisterHost(hdqDatabase.hanaPrimary.id);
      cy.contains(hdqDatabase.sid).should('not.exist');
    });

    it(`should display DB ${hdqDatabase.sid} again after restoring the primary instance`, () => {
      cy.loadScenario(`host-${hdqDatabase.hanaPrimary.name}-restore`);
      cy.contains(hdqDatabase.sid).should('exist');
    });
  });
});
