export * from './base_po';
// import * as basePage from './base_po';

// Test data

const ssoType = Cypress.env('SSO_TYPE') || 'oidc';

const plainUser = {
  username: 'trentoidp',
  password: 'password',
  fullname: 'Trento IDP user Of Monk',
  email: 'trentoidp@trento.suse.com',
};

const adminUser = {
  username: 'admin',
  password: 'admin',
  fullname: 'Trento Admin',
  email: 'admin@trento.suse.com',
  permissions: 'all:all',
};

// Selectors

const fullNameInputField = 'label:contains("Full Name") + div';
const emailAddressInputField = 'label:contains("Email Address") + div';
const usernameInputField = 'label:contains("Username") + div';
const permissionsInputField = 'label:contains("Permissions") + div';
const usernameMenu = `span:contains("${plainUser.username}")`;
const usersListPlainUser = `a:contains("${plainUser.username}")`;
const usersListAdminUser = `a:contains("${adminUser.username}")`;

// UI Interactions

export const clickListedPlainUser = () => cy.get(usersListPlainUser).click();

export const ssoLoginPlainUser = () =>
  loginWithSSO(plainUser.username, plainUser.password);

export const ssoLoginAdminUser = () =>
  loginWithSSO(adminUser.username, adminUser.password);

const loginWithSSO = (username, password) => {
  const args = [username, password];
  cy.session(args, () => {
    cy.visit('/');
    cy.get('button').contains('Login with Single Sign-on').click();
    cy.origin(Cypress.env('idp_url'), { args }, ([username, password]) => {
      cy.get('[id="username"]').type(username);
      cy.get('[id="password"]').type(password);
      cy.get('input').contains('Sign In').click();
    });

    cy.url().should('contain', `/auth/${ssoType}_callback`);
    cy.get('h2').contains('Loading...');
    cy.get('h1').contains('At a glance');
  });
};

export const clickUsernameMenu = () => cy.get(usernameMenu).click();

// UI Validations

export const adminUsernameIsListedInUsersTable = () =>
  cy.get(usersListAdminUser).should('be.visible');

export const plainUsernameIsListedInUsersTable = () =>
  cy.get(usersListPlainUser).should('be.visible');

export const plainUsernameIsDisplayed = () =>
  cy.get(usernameMenu).should('be.visible');

export const plainUserFullNameIsDisplayed = () =>
  expectedFullNameIsDisplayed(plainUser.fullname);

export const adminUserFullNameIsDisplayed = () =>
  expectedFullNameIsDisplayed(adminUser.fullname);

export const plainUserEmailIsDisplayed = () =>
  expectedEmailIsDisplayed(plainUser.email);

export const adminUserEmailIsDisplayed = () =>
  expectedEmailIsDisplayed(adminUser.email);

export const plainUserUsernameIsDisplayed = () =>
  expectedUsernameIsDisplayed(plainUser.username);

export const adminUserUsernameIsDisplayed = () =>
  expectedUsernameIsDisplayed(adminUser.username);

export const adminUserPermissionsAreDisplayed = () =>
  cy.get(permissionsInputField).contains(adminUser.permissions);

const expectedFullNameIsDisplayed = (fullname) =>
  cy.get(fullNameInputField).should('have.value', fullname);

const expectedEmailIsDisplayed = (email) =>
  cy.get(emailAddressInputField).should('have.value', email);

const expectedUsernameIsDisplayed = (username) =>
  cy.get(usernameInputField).should('have.value', username);
