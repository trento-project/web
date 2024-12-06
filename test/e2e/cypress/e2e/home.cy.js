context('Homepage', () => {
  before(() => {
    cy.loadScenario('healthy-29-node-SAP-cluster');
    cy.visit('/');
    cy.url().should('include', '/');
  });

  describe('Deregistration', () => {
    const sapSystemNwp = {
      sid: 'NWP',
      hostId: '9cd46919-5f19-59aa-993e-cf3736c71053',
    };

    it(`should not display SAP System ${sapSystemNwp.sid} after it is deregistered`, () => {
      cy.contains(sapSystemNwp.sid).should('exist');
      cy.deregisterHost(sapSystemNwp.hostId);
      cy.contains(sapSystemNwp.sid).should('not.exist');
    });
  });
});
