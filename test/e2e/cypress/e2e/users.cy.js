import { TOTP } from 'totp-generator';

import { userFactory } from '@lib/test-utils/factories/users';

import UsersPage from '../pageObject/users-po.js';
import BasePage from '../pageObject/base-po.js';

const PASSWORD = 'password';
const USER = userFactory.build({ username: 'e2etest' });

const patchUser = (id, payload) => {
  cy.apiLogin().then(({ accessToken }) =>
    cy
      .request({
        url: `/api/v1/users/${id}`,
        method: 'GET',
        auth: { bearer: accessToken },
        body: {},
      })
      .then(({ headers: { etag } }) => {
        cy.request({
          url: `/api/v1/users/${id}`,
          method: 'PATCH',
          auth: { bearer: accessToken },
          body: payload,
          headers: { 'if-match': etag },
        });
      })
  );
};

const getProfile = (username, password) => {
  return cy.apiLogin(username, password).then(({ accessToken }) => {
    return cy
      .request({
        url: '/api/v1/profile',
        method: 'GET',
        auth: { bearer: accessToken },
        body: {},
      })
      .then(({ body: profile }) => {
        return profile;
      });
  });
};

const expectLoginFails = (username, password, code = 401) => {
  cy.request({
    method: 'POST',
    url: '/api/session',
    body: {
      username,
      password,
    },
    failOnStatusCode: false,
  }).then((response) => {
    expect(response.status).to.eq(code);
  });
};

let usersPage;
let basePage;

describe('Users', () => {
  describe('Create user', () => {
    beforeEach(() => {
      usersPage = new UsersPage();
      usersPage.deleteAllUsers();
      usersPage.visit();
      usersPage.validateUrl();
      usersPage.clickCreateUserButton();
    });

    it('should redirect to user creation form', () => {
      usersPage.pageTitleIsCorrectlyDisplayed('Create User');
    });

    it('should fail if required fields are missing', () => {
      usersPage.clickSubmitUserCreationButton();
      usersPage.validateRequiredFieldsErrors();
    });

    it('should fail if email value is wrong', () => {
      usersPage.typeUserFullName();
      usersPage.typeUserEmail('invalid_email');
      usersPage.typeUserName();
      usersPage.clickGeneratePassword();
      usersPage.clickSubmitUserCreationButton();
      usersPage.invalidEmailErrorIsDisplayed();
    });

    it('should fail if password is weak', () => {
      usersPage.typeUserFullName();
      usersPage.typeUserEmail();
      usersPage.typeUserName();
      usersPage.typeUserPassword('weakpwd');
      usersPage.typeUserPasswordConfirmation('weakpwd');
      usersPage.clickSubmitUserCreationButton();
      usersPage.weakPasswordErrorIsDisplayed();
    });

    it('should create user properly', () => {
      usersPage.typeUserFullName();
      usersPage.typeUserEmail();
      usersPage.typeUserName();
      usersPage.typeUserPassword();
      usersPage.typeUserPasswordConfirmation();
      usersPage.clickSubmitUserCreationButton();
      usersPage.userCreatedSuccessfullyToasterIsDisplayed();

      usersPage.pageTitleIsCorrectlyDisplayed('Users');
      usersPage.newUserIsDisplayed(
        usersPage.USER.username,
        usersPage.USER.email
      );
    });

    it('should not allow creating the user with the same data', () => {
      usersPage.apiCreateUser();
      usersPage.typeUserFullName();
      usersPage.typeUserEmail();
      usersPage.typeUserName();
      usersPage.typeUserPassword();
      usersPage.typeUserPasswordConfirmation();
      usersPage.clickSubmitUserCreationButton();
      usersPage.usernameAlreadyTakenErrorIsDisplayed();
      usersPage.clickCancelUserCreation();
      usersPage.pageTitleIsCorrectlyDisplayed('Users');
    });
  });

  describe('Edit user', () => {
    beforeEach(() => {
      usersPage = new UsersPage();
      usersPage.deleteAllUsers();
      usersPage.visit();
    });

    it('should not allow saving edited admin user', () => {
      usersPage.clickAdminUserName();
      usersPage.saveButtonIsDisabled();
    });

    it('should redirect to user edition form', () => {
      usersPage.apiCreateUser();
      usersPage.refresh();
      usersPage.clickAdminUserName();
      usersPage.pageTitleIsCorrectlyDisplayed('Edit User');
    });

    it('should show changed by other user warning', () => {
      usersPage.apiCreateUser();
      usersPage.refresh();
      usersPage.clickNewUser();
      usersPage.apiModifyUserFullName();
      usersPage.typeUserFullName('modified_name');
      usersPage.clickEditUserSaveButton();
      usersPage.userAlreadyUpdatedWarningIsDisplayed();
      usersPage.refresh();
      usersPage.userAlreadyUpdatedWarningIsNotDisplayed();
    });

    it('should edit full name properly', () => {
      usersPage.apiCreateUser();
      usersPage.refresh();
      usersPage.clickNewUser();
      const { fullname } = userFactory.build();
      usersPage.typeUserFullName(fullname);
      usersPage.clickEditUserSaveButton();
      usersPage.userEditedSuccessfullyToasterIsDisplayed();
      usersPage.userAlreadyUpdatedWarningIsNotDisplayed();
      usersPage.pageTitleIsCorrectlyDisplayed('Users');
      usersPage.userWithModifiedNameIsDisplayed(fullname);
    });
  });

  describe('Admin user profile', () => {
    beforeEach(() => {
      basePage = new BasePage();
      usersPage = new UsersPage();
      usersPage.visit();
    });

    it('should not allow editing admin user profile', () => {
      basePage.clickUserDropdownMenuButton();
      basePage.clickUserDropdownProfileButton();
      usersPage.saveButtonIsDisabled();
      usersPage.changePasswordButtonIsDisabled();
    });
  });

  describe('User profile', () => {
    beforeEach(() => {
      basePage = new BasePage();
      usersPage = new UsersPage();
      basePage.logout();
      basePage.deleteAllUsers();
      usersPage.apiCreateUser();
      basePage.login(usersPage.USER.username, usersPage.PASSWORD);
      basePage.visit();
    });

    it('should login with the new user', () => {
      basePage.validateUrl();
      basePage.userDropdownMenuButtonHasTheExpectedText(
        usersPage.USER.username
      );
    });

    it('should not see Users entry in the sidebar', () => {
      basePage.validateItemNotPresentInNavigationMenu('Users');
    });

    it('should get a forbidden messages for user related pages', () => {
      usersPage.visit();
      basePage.accessForbiddenMessageIsDisplayed();
    });

    it('should see password change suggestion toast', () => {
      usersPage.passwordChangeToasterIsDisplayed();
    });

    it('should have a proper user data in the profile view', () => {
      basePage.clickUserDropdownProfileButton();
      usersPage.emailInputFieldHasExpectedValue();
      usersPage.usernameInputFieldHasExpectedValue();
    });

    it('should edit full name properly from the profile view', () => {
      const { fullname } = userFactory.build();
      basePage.clickUserDropdownProfileButton();
      usersPage.typeUserFullName(fullname);
      usersPage.clickEditUserSaveButton();
      usersPage.profileChangesSavedToasterIsDisplayed();
    });

    it('should fail editing user password if current password is wrong', () => {
      basePage.clickUserDropdownProfileButton();
      usersPage.clickChangePasswordButton();
      usersPage.typeCurrentPassword('wrong');
      usersPage.typeUserPassword();
      usersPage.typeUserPasswordConfirmation();
      usersPage.clickSaveNewPasswordButton();
      usersPage.invalidCurrentPasswordErrorIsDisplayed();
    });

    it('should edit the user password', () => {
      basePage.clickUserDropdownProfileButton();
      usersPage.clickChangePasswordButton();
      usersPage.typeCurrentPassword();
      usersPage.typeUserPassword();
      usersPage.typeUserPasswordConfirmation();
      usersPage.clickSaveNewPasswordButton();
      usersPage.profileChangesSavedToasterIsDisplayed();
      usersPage.passwordChangeToasterIsNotDisplayed();
    });

    it('should see Users entry in sidebar when the all:users ability is given', () => {
      usersPage.apiApplyAllUsersPermission();
      usersPage.validateItemPresentInNavigationMenu('Users');
    });
  });

  describe('TOTP authentication', () => {
    beforeEach(() => {
      basePage = new BasePage();
      usersPage = new UsersPage();
      basePage.logout();
      basePage.deleteAllUsers();
      usersPage.apiCreateUser();
      basePage.login(usersPage.USER.username, usersPage.PASSWORD);
      basePage.visit();
      basePage.clickUserDropdownProfileButton();
      basePage.validateUrl('/profile');
    });

    it('should display TOTP enrollment failure if the given code is invalid', () => {
      usersPage.clickAuthenticatorAppSwitch();
      usersPage.newTotpCodeIssuedMessageIsDisplayed();
      usersPage.typeTotpCode('invalid');
      usersPage.clickVerifyTotpButton();
      usersPage.totpEnrollmentErrorIsDisplayed();
    });

    it('should complete TOTP enrollment properly', () => {
      usersPage.clickAuthenticatorAppSwitch();
      usersPage.typeTotpCode();
      usersPage.clickVerifyTotpButton();
      usersPage.authenticatorAppSwitchIsEnabled();
      usersPage.totpEnabledToasterIsDisplayed();
    });

    it('should fail to login if TOTP code is not given', () => {
      usersPage.clickAuthenticatorAppSwitch();
      usersPage.typeTotpCode();
      usersPage.clickVerifyTotpButton();
      usersPage.loginFailsIfOtpNotProvided();
    });

    it('should disable TOTP authentication and check login works without TOTP', () => {
      usersPage.clickAuthenticatorAppSwitch();
      usersPage.typeTotpCode();
      usersPage.clickVerifyTotpButton();
      usersPage.clickAuthenticatorAppSwitch();
      usersPage.clickDisableTotpButton();
      usersPage.assertLoginWorks();
    });

    it('should reconfigure TOTP authentication with a new secret', () => {
      cy.get('button[role="switch"]').click();
      cy.contains('Your new TOTP secret is')
        .next()
        .invoke('text')
        .as('totpSecret');

      cy.get('@totpSecret').then((totpSecret) => {
        cy.wrap(TOTP.generate(totpSecret)).then(({ otp }) => {
          cy.get('input[placeholder="TOTP code"]').type(otp);
        });

        Cypress.env('totp_secret', totpSecret);
      });

      cy.contains('button', 'Verify').click();
      cy.get('button[role="switch"]').should('be.enabled');
    });

    it('should ask TOTP code during login and fail if given code is invalid', () => {
      cy.logout();
      cy.visit('/');
      cy.get('input[data-testid="login-username"]').type(USER.username);
      cy.get('input[data-testid="login-password"]').type(PASSWORD);
      cy.contains('button', 'Login').click();

      cy.get('label').should('contain', 'TOTP code');

      cy.get('input[data-testid="login-totp-code"]').type('invalid');
      cy.contains('button', 'Login').click();

      cy.get('p').contains('Invalid credentials');
    });

    it('should fail login in if the code is already used', () => {
      cy.get('input[data-testid="login-totp-code"]').clear();

      cy.wrap(TOTP.generate(Cypress.env('totp_secret'))).then(({ otp }) => {
        cy.get('input[data-testid="login-totp-code"]').type(otp);
      });

      cy.contains('button', 'Login').click();
      cy.get('p').contains('Invalid credentials');
    });

    // skipping this test by default, as it takes a long time.
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip('should ask TOTP code during login and work if the code is new', () => {
      cy.get('input[data-testid="login-totp-code"]').clear();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(30000)
        .then(() => TOTP.generate(Cypress.env('totp_secret')))
        .as('otpCode');

      cy.get('@otpCode').then(({ otp }) => {
        cy.get('input[data-testid="login-totp-code"]').type(otp);
      });

      cy.contains('button', 'Login').click();

      cy.get('h1').should('contain', 'At a glance');
    });

    it('should be disabled by admin user', () => {
      cy.logout();
      cy.login();
      cy.visit('/users');
      cy.contains('a', USER.username).click();
      cy.get('h1').should('contain', 'Edit User');

      cy.get('button.totp-selection-dropdown').click();

      cy.contains('div', 'Disabled').click();
      cy.contains('button', 'Save').click();

      cy.get('div').contains('User edited successfully');
      cy.get('h1').should('contain', 'Users');

      cy.apiLogin(USER.username, PASSWORD);
    });

    it('should not be enabled by admin user', () => {
      cy.contains('a', USER.username).click();
      cy.get('h1').should('contain', 'Edit User');

      cy.get('button.totp-selection-dropdown').click();

      cy.get(
        'div[role="listbox"][data-headlessui-state="open"] > div:nth-child(1)'
      )
        .invoke('attr', 'aria-disabled')
        .should('eq', 'true');
    });
  });

  describe('Lock user', () => {
    before(() => {
      cy.logout();
      cy.login(USER.username, PASSWORD);
      cy.visit('/profile');
      cy.get('h1').should('contain', 'Profile');
    });

    it('should logout the user when an admin disables the user', () => {
      getProfile(USER.username, PASSWORD).then(({ id }) => {
        patchUser(id, { enabled: false });
      });
      cy.get('h2').should('contain', 'Login to Trento');
    });

    it('should not be able to login with locked user', () => {
      expectLoginFails(USER.username, PASSWORD);
    });
  });

  describe('Delete user', () => {
    before(() => {
      cy.logout();
      cy.login();
      cy.visit('/users');
    });

    it('should delete the user properly', () => {
      cy.get('button:contains("Delete")').eq(1).click();

      cy.get('button:contains("Delete")').eq(2).click();
      cy.contains(USER.username).should('not.exist');
    });

    it('should be able to create a new user with deleted user username and email', () => {
      cy.contains('button', 'Create User').click();
      cy.get('h1').should('contain', 'Create User');

      cy.get('input[placeholder="Enter full name"]').type(USER.fullname);
      cy.get('input[placeholder="Enter email address"]').type(USER.email);
      cy.get('input[placeholder="Enter username"]').type(USER.username);

      cy.contains('button', 'Generate Password').click();

      cy.contains('button', 'Create').click();
      cy.get('div').contains('User created successfully');

      cy.get('h1').should('contain', 'Users');
      cy.get('a').contains(USER.username);
      cy.get('p').contains(USER.fullname);
    });

    it('should not be able to login with deleted user', () => {
      expectLoginFails(USER.username, PASSWORD);
    });
  });
});
