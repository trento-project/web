import * as usersPage from '../pageObject/users_po';
import * as loginPage from '../pageObject/login_po';
import * as dashboardPage from '../pageObject/dashboard_po';

describe('SSO integration', () => {
  if (!Cypress.env('SSO_INTEGRATION_TESTS')) {
    return;
  }

  before(() => {
    loginPage.cleanBrowserData();
    loginPage.visit();
  });

  it('should display Single Sign-on login page', () => {
    loginPage.loginPageIsDisplayed();
  });

  it('should redirect to external IDP login page when login button is clicked', () => {
    loginPage.clickLoginWithSsoButton();
    loginPage.shouldRedirectToIdpUrl();
  });

  it('should login properly once authentication is completed', () => {
    loginPage.ssoLoginPlainUser();
    loginPage.plainUsernameIsDisplayed();
  });

  describe('Plain user', () => {
    beforeEach(() => loginPage.ssoLoginPlainUser());

    it('should have a read only profile view and empty list of permissions', () => {
      usersPage.visit('/profile');
      usersPage.plainUserFullNameIsDisplayed();
      usersPage.plainUserEmailIsDisplayed();
      usersPage.plainUserUsernameIsDisplayed();
    });

    it('should be able to logout and login without a new authentication request', () => {
      usersPage.clickSignOutButton();
      loginPage.clickLoginWithSsoButton();
      dashboardPage.loadingMessageIsDisplayed();
      dashboardPage.dashboardPageIsDisplayed();
    });
  });

  describe('Admin user', () => {
    beforeEach(() => loginPage.ssoLoginAdminUser());

    it('should have access to Users view', () => {
      usersPage.visit();
      usersPage.validateUrl();
      usersPage.adminUsernameIsListedInUsersTable();
      usersPage.plainUsernameIsListedInUsersTable();
    });

    it('should not have user creation button', () => {
      usersPage.createUserButtonIsNotDisplayed();
    });

    it('should have the ability to update user permissions and status', () => {
      usersPage.visit();
      usersPage.clickPlainUserInList();
      usersPage.clickPermissionsDropdown();
      usersPage.selectPermission('all:users');
      usersPage.selectDisabledStatus();
      usersPage.clickSaveUserButton();

      usersPage.clickPlainUserInList();
      usersPage.clickRemovePermissionButton();
      usersPage.selectEnabledStatus();
      usersPage.clickSaveUserButton();
    });

    it('should have a read only profile view and all:all permissions', () => {
      usersPage.visit('/profile');
      usersPage.adminUserFullNameIsDisplayed();
      usersPage.adminUserEmailIsDisplayed();
      usersPage.adminUserUsernameIsDisplayed();
      usersPage.adminUserPermissionsAreDisplayed();
    });
  });
});
