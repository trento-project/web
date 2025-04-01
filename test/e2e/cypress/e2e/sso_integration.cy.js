import * as ssoIntegrationPage from '../pageObject/sso_integration_po';

describe('SSO integration', () => {
  if (!Cypress.env('SSO_INTEGRATION_TESTS')) {
    return;
  }

  before(() => {
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
  });

  beforeEach(() => ssoIntegrationPage.visit());

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
      cy.visit('/profile');
      ssoIntegrationPage.plainUserFullNameIsDisplayed();
      ssoIntegrationPage.plainUserEmailIsDisplayed();
      ssoIntegrationPage.plainUserUsernameIsDisplayed();
    });

    it('should be able to logout and login without a new authentication request', () => {
      ssoIntegrationPage.clickUsernameMenu();
      cy.get('button').contains('Sign out').click();
      cy.get('button').contains('Login with Single Sign-on').click();
      cy.get('h2').contains('Loading...');
      cy.get('h1').contains('At a glance');
    });
  });

  describe('Admin user', () => {
    // beforeEach(() => {
    //   ssoIntegrationPage.ssoLoginAdminUser();
    // });

    // eslint-disable-next-line mocha/no-exclusive-tests
    it.only('should have access to Users view', () => {
      ssoIntegrationPage.ssoLoginAdminUser();
      cy.visit('/users');
      cy.url().should('include', '/users');
      ssoIntegrationPage.adminUsernameIsListedInUsersTable();
      const plainUser = {
        username: 'trentoidp',
        password: 'password',
        fullname: 'Trento IDP user Of Monk',
        email: 'trentoidp@trento.suse.com',
      };
      cy.get('a').contains(plainUser.username);

      // ssoIntegrationPage.plainUsernameIsListedInUsersTable();
    });

    it('should not have user creation button', () => {
      cy.get('button').contains('Create User').should('not.exist');
    });

    it('should have the ability to update user permissions and status', () => {
      cy.visit('/users');
      ssoIntegrationPage.clickListedPlainUser();
      cy.get('div').contains('Default').click({ force: true });
      cy.get('div').contains('all:users').click();
      cy.get('div').contains('Enabled').click();
      cy.get('div').contains('Disabled').click();
      cy.get('button').contains('Save').click();

      ssoIntegrationPage.clickListedPlainUser();
      cy.get('div').contains('all:users').parent().find('svg').click();
      cy.get('div').contains('Disabled').click();
      cy.get('div').contains('Enabled').click();
      cy.get('button').contains('Save').click();
    });

    it('should have a read only profile view and all:all permissions', () => {
      cy.visit('/profile');
      ssoIntegrationPage.adminUserFullNameIsDisplayed();
      ssoIntegrationPage.adminUserEmailIsDisplayed();
      ssoIntegrationPage.adminUserUsernameIsDisplayed();
      ssoIntegrationPage.adminUserPermissionsAreDisplayed();
    });
  });
});
