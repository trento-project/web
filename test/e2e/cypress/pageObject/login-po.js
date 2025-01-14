import { TOTP } from 'totp-generator';

import BasePage from './base-po.js';

export default class LoginPage extends BasePage {
  constructor() {
    super();
    this.usernameInputField = 'input[autocomplete="username"]';
    this.passwordInputField = 'input[autocomplete="current-password"]';
    this.submitLoginButton = 'button[type="submit"]';
    this.totpCodeInput = '#totp-code';
    this.invalidCredentialsError = 'p:contains("Invalid credentials")';
  }

  visit(url = '/') {
    cy.visit(url);
  }

  login(username, password) {
    cy.get(this.usernameInputField).type(username);
    cy.get(this.passwordInputField).type(password);
    return this.clickSubmitLoginButton();
  }

  sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  invalidCredentialsErrorIsDisplayed() {
    return cy.get(this.invalidCredentialsError).should('be.visible');
  }

  clickSubmitLoginButton() {
    return cy.get(this.submitLoginButton).click();
  }

  typeTotpCode(totpSecret) {
    if (totpSecret === 'invalid')
      return cy.get(this.totpCodeInput).type(totpSecret);
    else {
      const { otp } = TOTP.generate(totpSecret);
      return cy.get(this.totpCodeInput).clear().type(otp);
    }
  }

  typeAlreadyUsedCode(totpSecret) {
    return this.typeTotpCode(totpSecret);
  }

  waitForNewTotpCodeAndTypeIt(totpSecret) {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(30000).then(() => {
      this.typeTotpCode(totpSecret);
    });
  }
}
