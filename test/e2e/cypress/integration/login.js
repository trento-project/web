context('Trento login page', () => {
    before(() => {
        cy.visit('/');
    });
  
    it('is redirected to the login page')
    it('should show a login form', () => {
      cy.get('.mt-6').should('contain', 'Login to Trento');
      cy.get('.mx-auto').should('exist');
      cy.get(':nth-child(2) > .text-sm').should('contain', 'Username');
    });
  });
  