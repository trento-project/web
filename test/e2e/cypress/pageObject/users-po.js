import BasePage from './base-po.js';
import { userFactory } from '@lib/test-utils/factories/users';

export default class UsersPage extends BasePage {
  constructor() {
    super();
    this.url = '/users';
    this.PASSWORD = 'password';
    this.USER = userFactory.build({ username: 'e2etest' });

    // UI Element Selectors
    this.createUserButton = 'button:contains("Create User")';
    this.adminUserName = 'tbody tr:nth-child(1) a';
    this.newUserName = 'tbody tr:nth-child(2) a:nth-child(1)';
    this.newUserEmail = 'tbody tr:nth-child(2) p:nth-child(1)';
    this.newUserDeleteButton =
      'tbody tr:nth-child(2) td button:contains("Delete")';
    this.confirmDeleteUserButton =
      'div[id*="dialog-panel"]  button:contains("Delete")';
    this.usersTableRows = 'tbody tr';
    this.changePasswordButton = 'button:contains("Change Password")';
    this.fullNameInputField = 'input[aria-label="fullname"]';
    this.emailInputField = 'input[aria-label="email"]';
    this.userNameInputField = 'input[aria-label="username"]';
    this.currentPasswordInputField = 'input[aria-label="current_password"]';
    this.passwordInputField = 'input[aria-label="password"]';
    this.passwordConfirmationInputField =
      'input[aria-label^="password"][aria-label*="confirmation"]';
    this.saveNewPasswordButton = 'div[id*="panel"] button:contains("Save")';
    this.generatePasswordButton = 'div[class*="grid"] button[class*="green"]';
    this.submitUserCreationButton = 'button:contains("Create")';
    this.cancelUserCreationButton = 'button:contains("Cancel")';
    this.saveChangesButton = 'button:contains("Save")';
    this.authenticatorAppSwitch = 'button[role="switch"]';
    this.newTotpCodeIssuedMessage = 'div:contains("Your new TOTP secret is:")';
    this.totpSecret = `${this.newTotpCodeIssuedMessage} + div[class*="bold"]`;
    this.newTotpCodeInputField = 'input[placeholder="TOTP code"]';
    this.verifyTotpButton = 'button:contains("Verify")';
    this.confirmDisableTotpButton = 'button:contains("Disable")';
    this.editUserTotpDropdown = 'button.totp-selection-dropdown';
    this.enableUserTotpOption = `${this.editUserTotpDropdown} + div div:contains("Enabled")`;

    // Toaster Messages
    this.userAlreadyUpdatedWarning =
      'p:contains("Information has been updated by another user")';
    this.userCreatedSuccessfullyToaster =
      'div:contains("User created successfully")';
    this.userEditedSuccessfullyToaster =
      'div:contains("User edited successfully")';
    this.profileChangesSavedToaster = 'div:contains("Profile changes saved!")';
    this.passwordChangeToaster =
      'p:contains("Password change is recommended.")';
    this.totpEnabledToaster = 'div:contains("TOTP Enabled")';
    this.userDeletedSuccesfullyToaster =
      'div:contains("User deleted successfully")';

    // Error Messages
    this.requiredFieldsErrors = 'p[class*="text-red"]';
    this.usernameAlreadyTakenError = 'p:contains("Has already been taken")';
    this.invalidPasswordErrorLabel = 'p:contains("Is invalid")';
    this.totpEnrollmentErrorLabel =
      'p:contains("Totp code not valid for the enrollment procedure.")';
  }

  visit(url = this.url) {
    return cy.visit(url);
  }

  validateUrl(url = this.url) {
    return cy.url().should('include', url);
  }

  clickCreateUserButton() {
    return cy.get(this.createUserButton).click();
  }

  clickNewUserDeleteButton() {
    return cy.get(this.newUserDeleteButton).click();
  }

  clickConfirmDeleteUserButton() {
    return cy.get(this.confirmDeleteUserButton).click();
  }

  clickSaveNewPasswordButton() {
    return cy.get(this.saveNewPasswordButton).click();
  }

  clickAuthenticatorAppSwitch() {
    return cy.get(this.authenticatorAppSwitch).click();
  }

  clickGeneratePassword() {
    return cy.get(this.generatePasswordButton).click();
  }

  clickSubmitUserCreationButton() {
    return cy.get(this.submitUserCreationButton).click();
  }

  clickCancelUserCreation() {
    return cy.get(this.cancelUserCreationButton).click();
  }

  clickNewUser() {
    return cy.get(this.newUserName).click();
  }

  clickEditUserSaveButton() {
    return cy.get(this.saveChangesButton).click();
  }

  clickAdminUserName() {
    return cy.get(this.adminUserName).click();
  }

  clickChangePasswordButton() {
    return cy.get(this.changePasswordButton).click();
  }

  clickVerifyTotpButton() {
    return cy.get(this.verifyTotpButton).click();
  }

  clickDisableTotpButton() {
    return cy.get(this.confirmDisableTotpButton).click();
  }

  clickTotpDropdown() {
    return cy.get(this.editUserTotpDropdown).click();
  }

  typeUserFullName(userFullName = this.USER.fullname) {
    return cy.get(this.fullNameInputField).clear().type(userFullName);
  }

  typeUserEmail(emailAddress = this.USER.email) {
    return cy.get(this.emailInputField).type(emailAddress);
  }

  typeUserName() {
    return cy.get(this.userNameInputField).type(this.USER.username);
  }

  typeCurrentPassword(currentPassword = this.PASSWORD) {
    return cy.get(this.currentPasswordInputField).type(currentPassword);
  }

  typeUserPassword(password = this.PASSWORD) {
    return cy.get(this.passwordInputField).type(password);
  }

  typeUserPasswordConfirmation(password = this.PASSWORD) {
    return cy.get(this.passwordConfirmationInputField).type(password);
  }

  selectFromTotpDropdown(choice) {
    return this.selectFromDropdown(this.editUserTotpDropdown, choice);
  }

  getTotpSecret() {
    return cy.get(this.totpSecret).then((element) => element.text());
  }

  typeUserTotpCode() {
    return this.getTotpSecret().then((totpSecret) =>
      this.typeTotpCode(totpSecret, this.newTotpCodeInputField)
    );
  }

  typeInvalidUserTotpCode() {
    return cy.get(this.newTotpCodeInputField).clear().type('invalid');
  }

  apiGetProfileInfo(username = this.USER.username, password = this.PASSWORD) {
    return this.apiLogin(username, password).then(({ accessToken }) => {
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
  }

  apiDisableUser() {
    return this.apiGetProfileInfo().then(({ id }) => {
      this.apiPatchUser(id, { enabled: false });
    });
  }

  apiApplyAllUsersPermission() {
    return this.apiGetProfileInfo().then(({ id }) => {
      this.apiPatchUser(id, {
        abilities: [{ id: 2, name: 'all', resource: 'users', label: 'test' }],
      });
    });
  }

  apiCreateUser() {
    return this.apiLogin().then(({ accessToken }) => {
      const body = {
        fullname: this.USER.fullname,
        email: this.USER.email,
        enabled: true,
        username: this.USER.username,
        password: this.PASSWORD,
        password_confirmation: this.PASSWORD,
        abilities: [],
      };
      return cy.request({
        url: '/api/v1/users',
        method: 'POST',
        auth: { bearer: accessToken },
        body,
      });
    });
  }

  apiPatchUser(id, payload) {
    return this.apiLogin().then(({ accessToken }) =>
      cy
        .request({
          url: `/api/v1/users/${id}`,
          method: 'GET',
          auth: { bearer: accessToken },
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
  }

  apiModifyUserFullName() {
    return this.getUserIdFromPath().then((id) =>
      this.apiPatchUser(id, { fullname: 'some_random_string' })
    );
  }

  getUserIdFromPath() {
    return cy.location().then(({ pathname }) => pathname.split('/')[2]);
  }

  deletedUserNameIsNotDisplayed() {
    return cy.get(this.newUserName).should('not.exist');
  }

  userDeletedSuccesfullyToasterIsDisplayed() {
    return cy.get(this.userDeletedSuccesfullyToaster).should('be.visible');
  }

  invalidCurrentPasswordErrorIsDisplayed() {
    return cy.get(this.invalidPasswordErrorLabel).should('be.visible');
  }

  validateRequiredFieldsErrors() {
    return cy.get(this.requiredFieldsErrors).should('have.length', 5);
  }

  invalidEmailErrorIsDisplayed() {
    return cy
      .contains(this.requiredFieldsErrors, 'Is not a valid email')
      .should('have.length', 1);
  }

  weakPasswordErrorIsDisplayed() {
    return cy
      .contains(this.requiredFieldsErrors, 'Should be at least 8 character(s)')
      .should('have.length', 1);
  }

  usernameAlreadyTakenErrorIsDisplayed() {
    return cy.get(this.usernameAlreadyTakenError).should('be.visible');
  }

  userCreatedSuccessfullyToasterIsDisplayed() {
    return cy.get(this.userCreatedSuccessfullyToaster).should('be.visible');
  }

  passwordChangeToasterIsDisplayed() {
    return cy.get(this.passwordChangeToaster).should('be.visible');
  }

  passwordChangeToasterIsNotDisplayed() {
    return cy.get(this.passwordChangeToaster).should('not.exist');
  }

  userWithModifiedNameIsDisplayed(username) {
    return cy.get(`p:contains("${username}")`).should('be.visible');
  }

  newUserIsDisplayed(username, email) {
    cy.get(this.usersTableRows).should('have.length', 2);
    cy.get(this.newUserName).contains(username);
    return cy.get(this.newUserEmail).contains(email);
  }

  saveButtonIsDisabled() {
    return cy.get(this.saveChangesButton).should('be.disabled');
  }

  userAlreadyUpdatedWarningIsDisplayed() {
    return cy.get(this.userAlreadyUpdatedWarning).should('be.visible');
  }

  userAlreadyUpdatedWarningIsNotDisplayed() {
    return cy.get(this.userAlreadyUpdatedWarning).should('not.exist');
  }

  userEditedSuccessfullyToasterIsDisplayed() {
    return cy.get(this.userEditedSuccessfullyToaster).should('be.visible');
  }

  changePasswordButtonIsDisabled() {
    return cy.get(this.changePasswordButton).should('be.disabled');
  }

  emailInputFieldHasExpectedValue(email = this.USER.email) {
    return cy.get(this.emailInputField).should('have.value', email);
  }

  usernameInputFieldHasExpectedValue(username = this.USER.username) {
    return cy.get(this.userNameInputField).should('have.value', username);
  }

  profileChangesSavedToasterIsDisplayed() {
    return cy.get(this.profileChangesSavedToaster).should('be.visible');
  }

  newTotpCodeIssuedMessageIsDisplayed() {
    return cy.get(this.newTotpCodeIssuedMessage).should('be.visible');
  }

  totpEnrollmentErrorIsDisplayed() {
    return cy.get(this.totpEnrollmentErrorLabel).should('be.visible');
  }

  authenticatorAppSwitchIsEnabled() {
    return cy.get(this.authenticatorAppSwitch).should('be.enabled');
  }

  totpEnabledToasterIsDisplayed() {
    return cy.get(this.totpEnabledToaster).should('be.visible');
  }

  enableTotpOptionIsDisabled() {
    return cy
      .get(this.enableUserTotpOption)
      .invoke('attr', 'aria-disabled')
      .should('eq', 'true');
  }
}
