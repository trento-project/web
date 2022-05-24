describe('User account page', () => {
  before(() => {
    cy.loadScenario('healthy-27-node-SAP-cluster');
    cy.login();
    cy.navigateToItem('About');
    cy.url().should('include', '/about');
  });

  it('should have the correct page title', () => {
    cy.get('h2.text-5xl').should('contain', 'About Trento Console');
  });

  it('should show the correct flavor', () => {
    cy.get('div')
      .contains('Trento flavor')
      .next()
      .should('contain', 'Community');
  });

  it('should show the correct server version', () => {
    cy.exec(`cd ${Cypress.env('project_root')} && mix version`).then(
      ({ stdout: version }) => {
        cy.get('div')
          .contains('Server version')
          .next()
          .should('contain', version);
      }
    );
  });

  it('should show the github project link', () => {
    cy.get('div')
      .contains('GitHub repository')
      .next()
      .should('contain', 'https://github.com/trento-project/web');
  });

  it('should display 27 SLES subscriptions found', () => {
    cy.get('div')
      .contains('SLES for SAP subscriptions')
      .next()
      .should('contain', '27 found');
  });
});
