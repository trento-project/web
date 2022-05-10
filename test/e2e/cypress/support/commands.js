// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const initializeOpenSidebar = () => cy.setCookie('sidebar-collapsed', 'false');

Cypress.Commands.add('login', () => {
  const [username, password] = [
    Cypress.env('login_user'),
    Cypress.env('login_password'),
  ];
  cy.visit('/login');
  cy.get('#user_username').type(username);
  cy.get('#user_password').type(password);
  cy.get(':nth-child(5) > .w-full').click();
  cy.url().should('include', '/');
});

Cypress.Commands.add('loadScenario', (scenario) => {
  const [projectRoot, photofinishBinary, webAPIHost, webAPIPort] = [
    Cypress.env('project_root'),
    Cypress.env('photofinish_binary'),
    Cypress.env('web_api_host'),
    Cypress.env('web_api_port'),
  ];
  cy.log(`Loading scenario "${scenario}"...`);
  cy.exec(
    `cd ${projectRoot} && ${photofinishBinary} run --url "http://${webAPIHost}:${webAPIPort}/api/collect" ${scenario}`
  );
});

Cypress.Commands.add('navigateToItem', (item) => {
  initializeOpenSidebar();
  const items = Array.isArray(item) ? item : [item];
  items.forEach((it) => cy.get('.tn-menu-item').contains(it).click());
});

Cypress.Commands.add('clickOutside', () => {
  return cy.get('body').click(0, 0); //0,0 here are the x and y coordinates
});
