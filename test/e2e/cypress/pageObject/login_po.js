export * from './base_po.js';
import * as basePage from './base_po.js';

// Test data
const ssoType = Cypress.env('SSO_TYPE') || 'oidc';

// Selectors
const usernameInputField = 'input[autocomplete="username"]';
const passwordInputField = 'input[autocomplete="current-password"]';
const submitLoginButton = 'button[type="submit"]';
const totpCodeInput = '#totp-code';
const invalidCredentialsError = 'p:contains("Invalid credentials")';
const loginToTrentoTitle = 'h2:contains("Login to Trento")';
const loginWithSsoButton = 'button:contains("Login with Single Sign-on")';

// UI Interactions
export const typeLoginTotpCode = (totpSecret) =>
  basePage.typeNextGeneratedTotpCode(totpSecret, totpCodeInput, true);

export const typeAlreadyUsedTotpCode = (code) =>
  cy.get(totpCodeInput).clear().type(code);

export const typeInvalidLoginTotpCode = () =>
  cy.get(totpCodeInput).clear().type('invalid');

export const waitForNewTotpCodeAndTypeIt = (totpSecret) =>
  typeLoginTotpCode(totpSecret);

export const clickLoginWithSsoButton = () => cy.get(loginWithSsoButton).click();

export const cleanBrowserData = () => {
  cy.clearAllLocalStorage();
  cy.clearAllCookies();
};

export const ssoLoginPlainUser = () =>
  _loginWithSSO(basePage.plainUser.username, basePage.plainUser.password);

export const ssoLoginAdminUser = () =>
  _loginWithSSO(basePage.adminUser.username, basePage.adminUser.password);

const _loginWithSSO = (username, password) => {
  const args = [username, password];
  cy.session(args, () => {
    basePage.visit();
    clickLoginWithSsoButton();
    cy.origin(Cypress.env('idp_url'), { args }, ([username, password]) => {
      cy.get('#username').type(username);
      cy.get('#password').type(password);
      cy.get('input:contains("Sign In")').click();
    });
    cy.url().should('contain', `/auth/${ssoType}_callback`);
  });
};

export const clickSubmitLoginButton = () => cy.get(submitLoginButton).click();

export const login = (username, password) => {
  cy.get(usernameInputField).type(username);
  cy.get(passwordInputField).type(password);
  return clickSubmitLoginButton();
};

// UI Validations

const _assertSessionStatusCode = (
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
export const loginFailsIfOtpNotProvided = (username, password) =>
  _assertSessionStatusCode(username, password, 422);

export const loginShouldFail = (username, password) =>
  _assertSessionStatusCode(username, password, 401);

export const loginShouldSucceed = (username, password) =>
  _assertSessionStatusCode(username, password, 200);

export const loginPageIsDisplayed = () =>
  cy.get(loginToTrentoTitle).should('be.visible');

export const invalidCredentialsErrorIsDisplayed = () =>
  cy.get(invalidCredentialsError).should('be.visible');
