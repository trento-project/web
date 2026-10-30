// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import * as usersPage from '../pageObject/users_po';
import * as loginPage from '../pageObject/login_po';
import * as dashboardPage from '../pageObject/dashboard_po';

describe('SSO integration', () => {
  if (!Cypress.expose('SSO_INTEGRATION_TESTS')) {
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
    beforeEach(() => {
      loginPage.ssoLoginAdminUser();
      usersPage.ifAnalyticsModalIsDisplayed(
        usersPage.clickContinueWithoutAnalytics,
        false
      );
    });

    it('should be able to accept analytics eula as an admin user', () => {
      usersPage.visit('/profile');
      usersPage.adminUserFullNameIsDisplayed();
      usersPage.ifAnalyticsModalIsDisplayed(() => {
        usersPage.analyticsModalIsDisplayed();
        usersPage.clickEnableAnalytics();
        usersPage.visit('/profile');
        usersPage.analyticsModalIsNotDisplayed();
      }, false);
    });

    it('should have access to Users view', () => {
      usersPage.visit();
      usersPage.validateUrl();
      usersPage.adminUsernameIsListedInUsersTable();
      usersPage.plainUsernameIsListedInUsersTable();
    });

    it('should not have user creation button', () => {
      usersPage.createUserButtonIsNotDisplayed();
    });

    it('should have the ability to update other plain user permissions, status and timezone', () => {
      const timezone = 'Europe/Madrid';

      usersPage.visit();
      usersPage.clickPlainUserInList();
      usersPage.clickPermissionsDropdown();
      usersPage.selectPermission('all:users');
      usersPage.selectDisabledStatus();
      usersPage.selectTimezone(timezone);
      usersPage.clickSaveUserButton();
      usersPage.userEditedSuccessfullyToasterIsDisplayed();

      usersPage.clickPlainUserInList();
      usersPage.timezoneValueIsDisplayed(timezone);
      usersPage.clickRemovePermissionButton();
      usersPage.selectEnabledStatus();
      usersPage.clickSaveUserButton();
      usersPage.userEditedSuccessfullyToasterIsDisplayed();
    });

    it('should have a read only profile view and all:all permissions', () => {
      usersPage.visit('/profile');
      usersPage.adminUserFullNameIsDisplayed();
      usersPage.adminUserEmailIsDisplayed();
      usersPage.adminUserUsernameIsDisplayed();
      usersPage.adminUserPermissionsAreDisplayed();
    });

    it('should be able to change timezone and analytics opt-in values from the profile view', () => {
      const timezone = 'Europe/Berlin';

      usersPage.visit('/profile');
      usersPage.selectTimezone(timezone);
      usersPage.clickAnalyticsOptInSwitch();
      usersPage.clickSaveUserButton();
      usersPage.profileChangesSavedToasterIsDisplayed();

      usersPage.visit('/profile');
      usersPage.timezoneValueIsDisplayed(timezone);
    });
  });

  describe('Callback state verification', () => {
    if (loginPage.ssoType === 'saml') {
      return;
    }

    const callbackUrl = `/api/session/${loginPage.ssoType}_local/callback`;

    beforeEach(() => {
      loginPage.cleanBrowserData();
      loginPage.visit();
      loginPage.clickLoginWithSsoButton();
    });

    it('should not log in when the callback carries a different state', () => {
      cy.intercept({ method: 'POST', url: callbackUrl, times: 1 }, (req) => {
        req.body.state = 'forged';
      }).as('callback');

      loginPage.submitIdpCredentialsAsPlainUser();

      cy.wait('@callback').its('response.statusCode').should('not.eq', 200);
      loginPage.ssoLoginFailedIsDisplayed();
    });

    it('should not log in when the callback comes from a browser that did not start the login', () => {
      cy.intercept({ method: 'POST', url: callbackUrl, times: 1 }, (req) =>
        req.reply({ statusCode: 500, body: {} })
      ).as('heldCallback');

      loginPage.submitIdpCredentialsAsPlainUser();
      cy.wait('@heldCallback');

      cy.intercept('POST', callbackUrl).as('callback');
      cy.url().then((idpCallbackUrl) => {
        loginPage.cleanBrowserData();
        cy.visit(idpCallbackUrl);
      });

      cy.wait('@callback').its('response.statusCode').should('not.eq', 200);
      loginPage.ssoLoginFailedIsDisplayed();
    });

    it('should not log in when the same callback is replayed', () => {
      cy.intercept('POST', callbackUrl).as('callback');

      loginPage.submitIdpCredentialsAsPlainUser();

      cy.wait('@callback').then(({ request, response }) => {
        expect(response.statusCode).to.eq(200);
        dashboardPage.dashboardPageIsDisplayed();
        cy.visit(
          `/auth/${loginPage.ssoType}_callback?${new URLSearchParams(request.body)}`
        );
      });

      cy.wait('@callback').its('response.statusCode').should('not.eq', 200);
      loginPage.ssoLoginFailedIsDisplayed();
    });

    it('should log in when retrying from the login failed page after a failed callback', () => {
      cy.intercept({ method: 'POST', url: callbackUrl, times: 1 }, (req) => {
        req.body.code = `${req.body.code}-rejected`;
      }).as('rejectedCallback');

      loginPage.submitIdpCredentialsAsPlainUser();

      cy.wait('@rejectedCallback')
        .its('response.statusCode')
        .should('not.eq', 200);
      loginPage.ssoLoginFailedIsDisplayed();

      cy.intercept('POST', callbackUrl).as('callback');
      loginPage.clickLoginWithSsoButton();

      cy.wait('@callback').its('response.statusCode').should('eq', 200);
      dashboardPage.dashboardPageIsDisplayed();
    });
  });
});
