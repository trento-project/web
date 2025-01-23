export * from './base-po.js';
import * as basePage from './base-po.js';

const usernameInputField = 'input[autocomplete="username"]';
const passwordInputField = 'input[autocomplete="current-password"]';
const submitLoginButton = 'button[type="submit"]';
const totpCodeInput = '#totp-code';
const invalidCredentialsError = 'p:contains("Invalid credentials")';
const loginToTrentoTitle = 'h2:contains("Login to Trento")';

export const assertSessionStatusCode = (
  username,
  password,
  expectedStatusCode = 401
) => {
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
};

export const loginFailsIfOtpNotProvided = (username, password) => {
  return assertSessionStatusCode(username, password, 422);
};

export const loginShouldFail = (username, password) => {
  return assertSessionStatusCode(username, password, 401);
};

export const loginShouldSucceed = (username, password) => {
  return assertSessionStatusCode(username, password, 200);
};

export const loginPageIsDisplayed = () => {
  return cy.get(loginToTrentoTitle).should('be.visible');
};

export const login = (username, password) => {
  cy.get(usernameInputField).type(username);
  cy.get(passwordInputField).type(password);
  return clickSubmitLoginButton();
};

export const invalidCredentialsErrorIsDisplayed = () => {
  return cy.get(invalidCredentialsError).should('be.visible');
};

export const clickSubmitLoginButton = () => {
  return cy.get(submitLoginButton).click();
};

export const typeLoginTotpCode = (totpSecret) => {
  basePage.typeTotpCode(totpSecret, totpCodeInput);
};

export const typeAlreadyUsedTotpCode = (totpSecret) => {
  return typeLoginTotpCode(totpSecret);
};

export const typeInvalidLoginTotpCode = () => {
  return cy.get(totpCodeInput).clear().type('invalid');
};

export const waitForNewTotpCodeAndTypeIt = (totpSecret) => {
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  return cy.wait(30000).then(() => typeLoginTotpCode(totpSecret));
};
