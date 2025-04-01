import * as ssoIntegrationPage from '../pageObject/sso_integration_po';
import * as usersPage from '../pageObject/users_po';

import { adminUser, plainUser } from '../fixtures/sso-integration/users';

describe('SSO integration', () => {
  if (!Cypress.env('SSO_INTEGRATION_TESTS')) {
    return;
  }

  before(() => {
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    ssoIntegrationPage.visit();
  });

  it('should display Single Sign-on login page', () => {
    ssoIntegrationPage.loginPageHasExpectedTitle('Login to Trento');
  });

  it('should redirect to external IDP login page when login button is clicked', () => {
    ssoIntegrationPage.clickLoginWithSsoButton();
    ssoIntegrationPage.shouldRedirectToIdpUrl();
  });

  it('should login properly once authentication is completed', () => {
    ssoIntegrationPage.ssoLoginPlainUser();
    ssoIntegrationPage.plainUsernameIsDisplayed();
  });

  describe('Plain user', () => {
    beforeEach(() => {
      ssoIntegrationPage.ssoLoginPlainUser();
    });

    it('should have a read only profile view and empty list of permissions', () => {
      ssoIntegrationPage.visit('/profile');
      ssoIntegrationPage.plainUserFullNameIsDisplayed();
      ssoIntegrationPage.plainUserEmailIsDisplayed();
      ssoIntegrationPage.plainUserUsernameIsDisplayed();
    });

    it('should be able to logout and login without a new authentication request', () => {
      ssoIntegrationPage.clickUsernameMenu();
      ssoIntegrationPage.clickSignOutButton();
      cy.get('button').contains('Login with Single Sign-on').click();
      cy.get('h2').contains('Loading...');
      cy.get('h1').contains('At a glance');
    });
  });

  describe('Admin user', () => {
    beforeEach(() => ssoIntegrationPage.ssoLoginAdminUser());

    it('should have access to Users view', () => {
      usersPage.visit();
      usersPage.validateUrl();
      ssoIntegrationPage.adminUsernameIsListedInUsersTable();
      ssoIntegrationPage.plainUsernameIsListedInUsersTable();
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
