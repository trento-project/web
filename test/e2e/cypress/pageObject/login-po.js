import BasePage from './base-po.js';

export default class LoginPage extends BasePage {
  constructor() {
    super();
    this.usernameInputField = 'input[autocomplete="username"]';
    this.passwordInputField = 'input[autocomplete="current-password"]';
    this.submitLoginButton = 'button[type="submit"]';
    this.totpCodeInput = '#totp-code';
    this.invalidCredentialsError = 'p:contains("Invalid credentials")';
    this.loginToTrentoTitle = 'h2:contains("Login to Trento")';
  }

  assertSessionStatusCode(username, password, expectedStatusCode = 401) {
    return cy
      .request({
        method: 'POST',
        url: '/api/session',
        body: {
          username,
          password,
        },
        failOnStatusCode: false,
      })
      .then((response) => {
        expect(
          response.status,
          'Session endpoint has the expected status code'
        ).to.eq(expectedStatusCode);
      });
  }

  loginFailsIfOtpNotProvided(username, password) {
    return this.assertSessionStatusCode(username, password, 422);
  }

  loginShouldFail(username, password) {
    return this.assertSessionStatusCode(username, password, 401);
  }

  loginShouldSucceed(username, password) {
    return this.assertSessionStatusCode(username, password, 200);
  }

  loginPageIsDisplayed() {
    return cy.get(this.loginToTrentoTitle).should('be.visible');
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

  typeLoginTotpCode(totpSecret) {
    this.typeTotpCode(totpSecret, this.totpCodeInput);
  }

  typeAlreadyUsedTotpCode(totpSecret) {
    return this.typeLoginTotpCode(totpSecret);
  }

  typeInvalidLoginTotpCode() {
    return cy.get(this.totpCodeInput).clear().type('invalid');
  }

  waitForNewTotpCodeAndTypeIt(totpSecret) {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    return cy.wait(30000).then(() => this.typeLoginTotpCode(totpSecret));
  }
}
