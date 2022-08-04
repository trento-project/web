describe('User account page', () => {
  before(() => {
    cy.navigateToItem('About');
    cy.url().should('include', '/about');
  });

  it('should have the correct page title', () => {
    cy.get('h2.text-5xl').should('contain', 'About Trento Console');
  });

  it('should show the correct flavor', () => {
    let flavour = 'Community';
    if (Cypress.env('flavour')) {
      flavour = Cypress.env('flavour');
    }
    cy.get('div').contains('Trento flavor').next().should('contain', flavour);
  });

  it('should show the correct server version', () => {
    let version;
    if (Cypress.env('version')) {
      version = Cypress.env('version');
    } else {
      cy.exec(`cd ${Cypress.env('project_root')} && mix version`).then(
        ({ stdout: out_version }) => {
          version = out_version;
        }
      );
    }
    cy.get('div').contains('Server version').next().should('contain', version);
  });

  it('should show the github project link', () => {
    cy.get('div')
      .contains('GitHub repository')
      .next()
      .should('contain', 'https://github.com/trento-project/web');
  });

  it('should display number of SLES subscriptions found', () => {
    let subscriptions = 27;
    if (typeof Cypress.env('subscriptions') !== 'undefined') {
      subscriptions = Cypress.env('subscriptions');
    }
    cy.get('div')
      .contains('SLES for SAP subscriptions')
      .next()
      .should('contain', subscriptions + ' found');
  });
});
