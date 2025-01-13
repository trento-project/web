import { TOTP } from 'totp-generator';

import BasePage from './base-po.js';

export default class LoginPage extends BasePage {
  constructor() {
    super();
    this.usernameInputField = 'input[autocomplete="username"]';
    this.passwordInputField = 'input[autocomplete="current-password"]';
    this.submitLoginButton = 'button[type="submit"]';
    this.totpCodeInput = '#totp-code';
  }

  visit(url = '/') {
    cy.visit(url);
  }

  login(username, password) {
    cy.get(this.usernameInputField).type(username);
    cy.get(this.passwordInputField).type(password);
    return this.clickSubmitLoginButton();
  }

  clickSubmitLoginButton() {
    return cy.get(this.submitLoginButton).click();
  }

  typeTotpCode(totpSecret) {
    if (totpSecret === 'invalid')
      return cy.get(this.totpCodeInput).type(totpSecret);
    else {
      const { otp, expires } = TOTP.generate(totpSecret, { period: 30 });
      cy.log(expires);
      return cy.get(this.totpCodeInput).clear().type(otp);
    }
  }
}
