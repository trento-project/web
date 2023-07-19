context('Databases Overview', () => {
  before(() => {
    cy.visit('/databases');
    cy.url().should('include', '/databases');
  });

  describe('Deregistration', () => {
    const hdqDatabase = {
      sid: 'HDQ',
      hana_primary: {
        name: 'vmhdbqas01',
        id: '99cf8a3a-48d6-57a4-b302-6e4482227ab6',
      },
    };

    before(() => {
      cy.deregisterHost(hdqDatabase.hana_primary.id);
    });

    it(`should not display DB ${hdqDatabase.sid} after deregistering the primary instance`, () => {
      cy.contains(hdqDatabase.sid).should('not.exist');
    });
  });
});
