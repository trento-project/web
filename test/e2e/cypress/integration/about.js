import { getValue } from '../support/common';

describe('User account page', () => {
  before(() => {
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
      .should('contain', getValue('flavor'));
  });

  it('should show the correct server version', () => {
    cy.get('div')
      .contains('Server version')
      .next()
      .then(($sv) => {
        if (Cypress.env('version')) {
          expect($sv).to.contain(Cypress.env('version'));
        } else {
          cy.exec(`cd ${Cypress.env('project_root')} && mix version`)
            .then(({ stdout: out_version }) => {
              return out_version;
            })
            .then((version) => {
              expect($sv.text()).to.contain(version);
            });
        }
      });
  });

  it('should show the github project link', () => {
    cy.get('div')
      .contains('GitHub repository')
      .next()
      .should('contain', 'https://github.com/trento-project/web');
  });

  it('should display number of SLES subscriptions found', () => {
    const subscriptions = getValue('subscriptions');
    cy.get('div')
      .contains('SLES for SAP subscriptions')
      .next()
      .should('contain', subscriptions + ' found');
  });
});
