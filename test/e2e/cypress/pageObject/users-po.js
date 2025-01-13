import BasePage from './base-po.js';
import { userFactory } from '@lib/test-utils/factories/users';

export default class UsersPage extends BasePage {
  constructor() {
    super();
    this.url = '/users';
    this.PASSWORD = 'password';
    this.USER = userFactory.build({ username: 'e2etest' });

    this.createUserButton = 'button[class*="green"]';
    this.adminUserName = 'tbody tr:nth-child(1) a';
    this.newUserName = 'tbody tr:nth-child(2) a';
    this.newUserEmail = 'tbody tr:nth-child(2) p';
    this.usersTableRows = 'tbody tr';
    this.changePasswordButton = 'button:contains("Change Password")';
    this.userAlreadyUpdatedWarning =
      'p:contains("Information has been updated by another user")';
    this.userCreatedSuccessfullyToaster = 'User created successfully';
    this.userEditedSuccessfullyToaster =
      'div:contains("User edited successfully")';
    this.profileChangesSavedToaster = 'div:contains("Profile changes saved!")';
    this.passwordChangeToaster =
      'p:contains("Password change is recommended.")';

    this.requiredFieldsErrors = 'p[class*="text-red"]';
    this.usernameAlreadyTakenError = 'Has already been taken';
    this.fullNameInputField = 'input[aria-label="fullname"]';
    this.emailInputField = 'input[aria-label="email"]';
    this.userNameInputField = 'input[aria-label="username"]';
    this.currentPasswordInputField = 'input[aria-label="current_password"]';
    this.passwordInputField = 'input[aria-label="password"]';
    this.passwordConfirmationInputField =
      'input[aria-label^="password"][aria-label*="confirmation"]';
    this.saveNewPasswordButton = 'div[id*="panel"] button:contains("Save")';
    this.invalidPasswordErrorLabel = 'p:contains("Is invalid")';
    this.generatePasswordButton = 'div[class*="grid"] button[class*="green"]';
    this.submitUserCreationButton = 'Create';
    this.cancelUserCreationButton = 'Cancel';
    this.saveChangesButton = 'button:contains("Save")';
  }

  visit(url = this.url) {
    return cy.visit(url);
  }

  validateUrl(url = this.url) {
    return cy.url().should('include', url);
  }

  getUserIdFromPath() {
    return cy.location().then(({ pathname }) => pathname.split('/')[2]);
  }

  getProfile(username = this.USER.username, password = this.PASSWORD) {
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

  apiApplyAllUsersPermission() {
    this.getProfile().then(({ id }) => {
      this.patchUser(id, {
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

  patchUser(id, payload) {
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
      this.patchUser(id, { fullname: 'some_random_string' })
    );
  }

  clickCreateUserButton() {
    return cy.get(this.createUserButton).click();
  }

  clickSaveNewPasswordButton() {
    return cy.get(this.saveNewPasswordButton).click();
  }

  invalidCurrentPasswordErrorIsDisplayed() {
    return cy.get(this.invalidPasswordErrorLabel).should('be.visible');
  }

  clickGeneratePassword() {
    return cy.get(this.generatePasswordButton).click();
  }

  clickSubmitUserCreationButton() {
    return this.clickButton(this.submitUserCreationButton);
  }

  clickCancelUserCreation() {
    return this.clickButton(this.cancelUserCreationButton);
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
    return cy.contains(this.usernameAlreadyTakenError).should('be.visible');
  }

  userCreatedSuccessfullyToasterIsDisplayed() {
    return cy
      .contains(this.userCreatedSuccessfullyToaster)
      .should('be.visible');
  }

  passwordChangeToasterIsDisplayed() {
    cy.get(this.passwordChangeToaster).should('be.visible');
  }

  passwordChangeToasterIsNotDisplayed() {
    cy.get(this.passwordChangeToaster).should('not.exist');
  }

  userWithModifiedNameIsDisplayed(username) {
    return cy.get(`p:contains("${username}")`).should('be.visible');
  }

  newUserIsDisplayed(username, email) {
    cy.get(this.usersTableRows).should('have.length', 2);
    cy.get(this.newUserName).contains(username);
    cy.get(this.newUserEmail).contains(email);
  }

  clickEditUserSaveButton() {
    return cy.get(this.saveChangesButton).click();
  }

  clickAdminUserName() {
    return cy.get(this.adminUserName).click();
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

  clickChangePasswordButton() {
    return cy.get(this.changePasswordButton).click();
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
}
