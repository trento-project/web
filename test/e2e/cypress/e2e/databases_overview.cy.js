context('Databases Overview', () => {
  before(() => {
    cy.visit('/databases');
    cy.url().should('include', '/databases');
  });

  describe('Deregistration', () => {
    const hdq_database = {
      sid: 'HDQ',
      hana_primary: {
        name: 'vmhdbqas01',
        id: '99cf8a3a-48d6-57a4-b302-6e4482227ab6',
      },
    };

    before(() => {
      cy.deregisterHost(hdq_database.hana_primary.id);
    });

    it(`should not display DB ${hdq_database.hana_primary.name} after deregistering the primary instance`, () => {
      cy.contains(hdq_database.sid).should('not.exist');
    });
  });
});
