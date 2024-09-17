import { adminUser, plainUser } from '../fixtures/sso-integration/users';

const ssoType = Cypress.env('SSO_TYPE') || 'oidc';

const loginWithSSO = (username, password) => {
  const args = [username, password];
  cy.session(args, () => {
    cy.visit('/');
    cy.get('button').contains('Login with Single Sign-on').click();
    cy.origin(Cypress.env('idp_url'), { args }, ([username, password]) => {
      cy.get('[id="username"]').type(username);
      cy.get('[id="password"]').type(password);
      cy.get('input').contains('Sign In').click();
    });

    cy.url().should('contain', `/auth/${ssoType}_callback`);
    cy.get('h2').contains('Loading...');
    cy.get('h1').contains('At a glance');
  });
};

describe('SSO integration', () => {
  if (!Cypress.env('SSO_INTEGRATION_TESTS')) {
    return;
  }

  before(() => {
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
  });

  it('should display Single Sign-on login page', () => {
    cy.visit('/');
    cy.get('h2').contains('Login to Trento');
    cy.get('button').contains('Login with Single Sign-on');
  });

  it('should redirect to external IDP login page when login button is clicked', () => {
    cy.get('button').contains('Login with Single Sign-on').click();
    cy.origin(Cypress.env('idp_url'), () => {
      cy.url().should('contain', '/realms/trento');
    });
  });

  it('should login properly once authentication is completed', () => {
    loginWithSSO(plainUser.username, plainUser.password);
    cy.get('span').contains(plainUser.username);
  });

  describe('Plain user', () => {
    beforeEach(() => {
      loginWithSSO(plainUser.username, plainUser.password);
    });

    it('should have a read only profile view and empty list of permissions', () => {
      cy.visit('/profile');
      cy.get('input').eq(0).should('have.value', plainUser.fullname);
      cy.get('input').eq(1).should('have.value', plainUser.email);
      cy.get('input').eq(2).should('have.value', plainUser.username);
    });

    it('should be able to logout and login without a new authentication request', () => {
      cy.get('span').contains(plainUser.username).click();
      cy.get('button').contains('Sign out').click();
      cy.get('button').contains('Login with Single Sign-on').click();
      cy.get('h2').contains('Loading...');
      cy.get('h1').contains('At a glance');
    });
  });

  describe('Admin user', () => {
    beforeEach(() => {
      loginWithSSO(adminUser.username, adminUser.password);
    });

    it('should have access to Users view', () => {
      cy.visit('/users');
      cy.url().should('include', '/users');
      cy.get('a').contains(plainUser.username);
      cy.get('a').contains(adminUser.username);
    });

    it('should not have user creation button', () => {
      cy.get('button').contains('Create User').should('not.exist');
    });

    it('should have the ability to update user permissions and status', () => {
      cy.visit('/users');
      cy.get('a').contains(plainUser.username).click();
      cy.get('div').contains('Default').click({ force: true });
      cy.get('div').contains('all:users').click();
      cy.get('div').contains('Enabled').click();
      cy.get('div').contains('Disabled').click();
      cy.get('button').contains('Save').click();

      cy.get('a').contains(plainUser.username).click();
      cy.get('div').contains('all:users').parent().find('svg').click();
      cy.get('div').contains('Disabled').click();
      cy.get('div').contains('Enabled').click();
      cy.get('button').contains('Save').click();
    });

    it('should have a read only profile view and all:all permissions', () => {
      cy.visit('/profile');
      cy.get('input').eq(0).should('have.value', adminUser.fullname);
      cy.get('input').eq(1).should('have.value', adminUser.email);
      cy.get('input').eq(2).should('have.value', adminUser.username);
      cy.get('div').contains(adminUser.permissions);
    });
  });
});
