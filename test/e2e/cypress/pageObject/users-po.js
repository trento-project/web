import BasePage from './base-po.js';
import { userFactory } from '@lib/test-utils/factories/users';

export default class UsersPage extends BasePage {
  constructor() {
    super();
    this.url = '/users';
    this.createUserButton = 'button[class*="green"]';

    this.adminUserName = 'tbody tr:nth-child(1) a';

    this.newUserName = 'tbody tr:nth-child(2) a';
    this.newUserEmail = 'tbody tr:nth-child(2) p';
    this.usersTableRows = 'tbody tr';

    this.PASSWORD = 'password';
    this.USER = userFactory.build({ username: 'e2etest' });

    this.form = {
      requiredFieldsErrors: 'p[class*="text-red"]',
      usernameAlreadyTakenError: 'Has already been taken',
      fullNameInputField: 'input[aria-label="fullname"]',
      emailInputField: 'input[aria-label="email"]',
      userNameInputField: 'input[aria-label="username"]',
      passwordInputField: 'input[aria-label="password"]',
      passwordConfirmationInputField:
        'input[aria-label="password-confirmation"]',
      generatePasswordButton: 'div[class*="grid"] button[class*="green"]',
      submitUserCreationButton: 'Create',
      cancelUserCreationButton: 'Cancel',
      saveEditUserButton: 'button:contains("Save")',
    };
    this.userHasBeenAlreadyUpdatedWarning =
      'p:contains("Information has been updated by another user")';
    this.userCreatedSuccesfullyToaster = 'User created successfully';
    this.userEditedSuccesfullyToaster =
      'div:contains("User edited successfully")';
  }

  apiCreateUser() {
    this.apiLogin().then(({ accessToken }) => {
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
        body: body,
      });
    });
  }

  patchUser(id, payload) {
    this.apiLogin().then(({ accessToken }) =>
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
  }

  apiModifyUserFullName() {
    this.getUserIdFromPath().then((id) => {
      this.patchUser(id, { fullname: 'some_random_string' });
    });
  }

  visit() {
    return cy.visit(this.url);
  }

  getUserIdFromPath() {
    return cy.location().then(({ pathname }) => {
      return pathname.split('/')[2];
    });
  }

  validateUrl() {
    return cy.url().should('include', this.url);
  }

  clickCreateUserButton() {
    return cy.get(this.createUserButton).click();
  }

  clickUserName() {
    return cy.contains(this.USER.username).click();
  }

  clickGeneratePassword() {
    return cy.get(this.form.generatePasswordButton).click();
  }

  clickSubmitUserCreationButton() {
    return this.clickButton(this.form.submitUserCreationButton);
  }

  clickCancelUserCreation() {
    return this.clickButton(this.form.cancelUserCreationButton);
  }

  typeUserFullName(userFullName = this.USER.fullname) {
    return cy.get(this.form.fullNameInputField).clear().type(userFullName);
  }

  typeUserEmail(emailAddress = this.USER.email) {
    return cy.get(this.form.emailInputField).type(emailAddress);
  }

  typeUserName() {
    return cy.get(this.form.userNameInputField).type(this.USER.username);
  }

  typeUserPassword(password = this.PASSWORD) {
    return cy.get(this.form.passwordInputField).type(password);
  }

  typeUserPasswordConfirmation(password = this.PASSWORD) {
    return cy.get(this.form.passwordConfirmationInputField).type(password);
  }

  validateRequiredFieldsErrors() {
    return cy.get(this.form.requiredFieldsErrors).should('have.length', 5);
  }

  invalidEmailErrorIsDisplayed() {
    return cy
      .contains(this.form.requiredFieldsErrors, 'Is not a valid email')
      .should('have.length', 1);
  }

  weakPasswordErrorIsDisplayed() {
    return cy
      .contains(
        this.form.requiredFieldsErrors,
        'Should be at least 8 character(s)'
      )
      .should('have.length', 1);
  }

  userCreatedSuccessfullyToasterIsDisplayed() {
    return cy.contains(this.userCreatedSuccesfullyToaster).should('be.visible');
  }

  usernameAlreadyTakenErrorIsDisplayed() {
    return cy
      .contains(this.form.usernameAlreadyTakenError)
      .should('be.visible');
  }

  newUserIsDisplayed(username, email) {
    cy.get(this.usersTableRows).should('have.length', 2);
    cy.get(this.newUserName).contains(username);
    cy.get(this.newUserEmail).contains(email);
  }

  clickAdminUserName() {
    return cy.get(this.adminUserName).click();
  }

  saveButtonIsDisabled() {
    return cy.get(this.form.saveEditUserButton).should('be.disabled');
  }

  clickEditUserSaveButton() {
    return cy.get(this.form.saveEditUserButton).click();
  }

  userAlreadyUpdatedWarningIsDisplayed() {
    return cy.get(this.userHasBeenAlreadyUpdatedWarning).should('be.visible');
  }

  userAlreadyUpdatedWarningIsNotDisplayed() {
    return cy.get(this.userHasBeenAlreadyUpdatedWarning).should('not.exist');
  }

  userdEditedSuccessfullyToasterIsDisplayed() {
    return cy.get(this.userEditedSuccesfullyToaster).should('be.visible');
  }

  userWithModifiedNameIsDisplayed(username) {
    return cy.get(`p:contains("${username}")`).should('be.visible');
  }
}
