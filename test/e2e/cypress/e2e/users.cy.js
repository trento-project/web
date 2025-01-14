import { userFactory } from '@lib/test-utils/factories/users';

import UsersPage from '../pageObject/users-po.js';
import BasePage from '../pageObject/base-po.js';
import LoginPage from '../pageObject/login-po.js';
import DashboardPage from '../pageObject/dashboard-po.js';

let usersPage;
let basePage;
let loginPage;
let dashboardPage;

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
      loginPage = new LoginPage();
      dashboardPage = new DashboardPage();
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
      loginPage.loginFailsIfOtpNotProvided(
        usersPage.USER.username,
        usersPage.PASSWORD
      );
    });

    it('should disable TOTP authentication and check login works without TOTP', () => {
      usersPage.clickAuthenticatorAppSwitch();
      usersPage.typeTotpCode();
      usersPage.clickVerifyTotpButton();
      usersPage.clickAuthenticatorAppSwitch();
      usersPage.clickDisableTotpButton();
      loginPage.assertLoginWorks(usersPage.USER.username, usersPage.PASSWORD);
    });

    it('should reconfigure TOTP and validate login cases', () => {
      usersPage.clickAuthenticatorAppSwitch();
      usersPage.typeTotpCode();
      usersPage.clickVerifyTotpButton();
      usersPage.clickAuthenticatorAppSwitch();
      usersPage.clickDisableTotpButton();
      usersPage.clickAuthenticatorAppSwitch();
      usersPage.typeTotpCode().then((totpSecret) => {
        usersPage.clickVerifyTotpButton();
        usersPage.authenticatorAppSwitchIsEnabled();
        usersPage.clickSignOutButton();
        loginPage.login(usersPage.USER.username, usersPage.PASSWORD);
        loginPage.typeTotpCode('invalidCode');
        loginPage.clickSubmitLoginButton();
        loginPage.invalidCredentialsErrorIsDisplayed();
        loginPage.typeAlreadyUsedCode(totpSecret);
        loginPage.clickSubmitLoginButton();
        loginPage.invalidCredentialsErrorIsDisplayed();
        loginPage.waitForNewTotpCodeAndTypeIt(totpSecret);
        loginPage.clickSubmitLoginButton();
        dashboardPage.dashboardPageIsDisplayed();
      });
    });

    it('should be disabled by admin user', () => {
      usersPage.clickAuthenticatorAppSwitch();
      usersPage.typeTotpCode();
      usersPage.clickVerifyTotpButton();
      usersPage.clickSignOutButton();
      usersPage.login();
      usersPage.visit();
      usersPage.clickNewUser();
      usersPage.selectFromTotpDropdown('Disabled');
      usersPage.clickEditUserSaveButton();
      usersPage.userEditedSuccessfullyToasterIsDisplayed();
      usersPage.pageTitleIsCorrectlyDisplayed('Users');
      loginPage.assertLoginWorks(usersPage.USER.username, usersPage.PASSWORD);
    });

    it('should not be enabled by admin user', () => {
      usersPage.clickSignOutButton();
      usersPage.login();
      usersPage.visit();
      usersPage.clickNewUser();
      usersPage.clickTotpDropdown();
      usersPage.enableTotpOptionIsDisabled();
    });
  });

  describe('Lock user', () => {
    beforeEach(() => {
      usersPage = new UsersPage();
      loginPage = new LoginPage();
      usersPage.logout();
      usersPage.deleteAllUsers();
      usersPage.apiCreateUser();
      usersPage.login(usersPage.USER.username, usersPage.PASSWORD);
      usersPage.visit('/profile');
      usersPage.pageTitleIsCorrectlyDisplayed('Profile');
      usersPage.apiDisableUser();
    });

    it('should logout the user when an admin disables the user', () => {
      loginPage.loginPageIsDisplayed();
    });

    it('should not be able to login with locked user', () => {
      loginPage.loginShouldFail(usersPage.USER.username, usersPage.PASSWORD);
    });
  });

  describe('Delete user', () => {
    beforeEach(() => {
      usersPage = new UsersPage();
      loginPage = new LoginPage();
      usersPage.logout();
      usersPage.deleteAllUsers();
      usersPage.apiCreateUser();
      usersPage.login();
      usersPage.visit();
      usersPage.clickNewUserDeleteButton();
      usersPage.clickConfirmDeleteUserButton();
    });

    it('should delete the user properly', () => {
      usersPage.userDeletedSuccesfullyToasterIsDisplayed();
      usersPage.deletedUserNameIsNotDisplayed();
    });

    it('should be able to create a new user with deleted user username and email', () => {
      usersPage.clickCreateUserButton();
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

    it('should not be able to login with deleted user', () => {
      loginPage.loginShouldFail(usersPage.USER.username, usersPage.PASSWORD);
    });
  });
});
