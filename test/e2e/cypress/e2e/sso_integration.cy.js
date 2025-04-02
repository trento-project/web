import * as ssoIntegrationPage from '../pageObject/sso_integration_po';
import * as usersPage from '../pageObject/users_po';

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
      ssoIntegrationPage.clickLoginWithSsoButton();
      ssoIntegrationPage.loadingMessageIsDisplayed();
      ssoIntegrationPage.pageTitleIsCorrectlyDisplayed('At a glance');
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
      ssoIntegrationPage.createUserButtonIsNotDisplayed();
    });

    it('should have the ability to update user permissions and status', () => {
      usersPage.visit();
      ssoIntegrationPage.clickPlainUserInList();
      ssoIntegrationPage.clickPermissionsDropdown();
      ssoIntegrationPage.selectPermission('all:users');
      ssoIntegrationPage.selectDisabledStatus();
      ssoIntegrationPage.clickSaveUserButton();

      ssoIntegrationPage.clickPlainUserInList();
      ssoIntegrationPage.clickRemovePermissionButton();
      ssoIntegrationPage.selectEnabledStatus();
      ssoIntegrationPage.clickSaveUserButton();
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
