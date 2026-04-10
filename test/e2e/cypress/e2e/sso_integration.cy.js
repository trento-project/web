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
    beforeEach(() => {
      loginPage.ssoLoginPlainUser();
      usersPage.ifAnalyticsModalIsDisplayed(
        usersPage.clickContinueWithoutAnalytics,
        false
      );
    });

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

    it('should be able to accept analytics eula', () => {
      usersPage.ifAnalyticsModalIsDisplayed(() => {
        usersPage.visit('/profile');
        usersPage.analyticsModalIsDisplayed();
        usersPage.clickEnableAnalytics();
        usersPage.visit('/profile');
        usersPage.analyticsModalIsNotDisplayed();
      }, false);
    });

    it('should be able to change allowed profile fields when SSO is enabled', () => {
      usersPage.visit('/profile');
      usersPage.clickAnalyticsOptInSwitch();
      usersPage.clickSaveUserButton();
    });

    it('should be able to change timezone when SSO is enabled', () => {
      const timezone = 'Europe/Berlin';

      usersPage.visit('/profile');
      usersPage.selectTimezone(timezone);
      usersPage.clickSaveUserButton();
      usersPage.profileChangesSavedToasterIsDisplayed();

      usersPage.visit('/profile');
      usersPage.timezoneValueIsDisplayed(timezone);
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

    it('should have the ability to update user permissions, status and timezone', () => {
      const timezone = 'Europe/Madrid';

      usersPage.visit();
      usersPage.clickPlainUserInList();
      usersPage.clickPermissionsDropdown();
      usersPage.selectPermission('all:users');
      usersPage.selectDisabledStatus();
      usersPage.selectTimezone(timezone);
      usersPage.clickSaveUserButton();

      usersPage.clickPlainUserInList();
      usersPage.timezoneValueIsDisplayed(timezone);
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
