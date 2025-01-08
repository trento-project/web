import BasePage from './base-po.js';
import { userFactory } from '@lib/test-utils/factories/users';

export default class CreateUserPage extends BasePage {
  constructor() {
    super();
    this.PASSWORD = 'password';
    this.USER = userFactory.build({ username: 'e2etest' });

    this.requiredFieldsErrors = 'p[class*="text-red"]';
    this.usernameAlreadyTakenError = 'Has already been taken';
    this.fullNameInputField = 'input[aria-label="fullname"]';
    this.emailInputField = 'input[aria-label="email"]';
    this.userNameInputField = 'input[aria-label="username"]';
    this.passwordInputField = 'input[aria-label="password"]';
    this.passwordConfirmationInputField =
      'input[aria-label="password-confirmation"]';
    this.generatePasswordButton = 'div[class*="grid"] button[class*="green"]';
    this.submitUserCreationButton = 'Create';
    this.cancelUserCreationButton = 'Cancel';

    this.userCreatedSuccesfullyToaster = 'User created successfully';
  }

  // Métodos de API
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

  // Métodos de interacción
  typeUserFullName() {
    return cy.get(this.fullNameInputField).type(this.USER.fullname);
  }

  typeUserEmail(emailAddress = this.USER.email) {
    return cy.get(this.emailInputField).type(emailAddress);
  }

  typeUserName() {
    return cy.get(this.userNameInputField).type(this.USER.username);
  }

  typeUserPassword(password = this.PASSWORD) {
    return cy.get(this.passwordInputField).type(password);
  }

  typeUserPasswordConfirmation(password = this.PASSWORD) {
    return cy.get(this.passwordConfirmationInputField).type(password);
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

  // Métodos de validación
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

  userCreatedSuccessfullyToasterIsDisplayed() {
    return cy.contains(this.userCreatedSuccesfullyToaster).should('be.visible');
  }

  usernameAlreadyTakenErrorIsDisplayed() {
    return cy.contains(this.usernameAlreadyTakenError).should('be.visible');
  }
}
