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

Cypress.Commands.add('acceptEula', () => {
  cy.request('/api/settings').then((response) => {
    if (!response.body.eula_accepted) {
      cy.get('div').should('contain', 'License agreement');
      cy.get('button').contains('Accept').click();
    }
  });
});

Cypress.Commands.add('loadScenario', (scenario) => {
  const [projectRoot, photofinishBinary, webAPIHost, webAPIPort] = [
    Cypress.env('project_root'),
    Cypress.env('photofinish_binary'),
    Cypress.env('web_api_host'),
    Cypress.env('web_api_port'),
  ];
  if (photofinishBinary) {
    cy.log(`Loading scenario "${scenario}"...`);
    cy.exec(
      `cd ${projectRoot} && ${photofinishBinary} run --url "http://${webAPIHost}:${webAPIPort}/api/collect" ${scenario}`
    );
  } else {
    cy.log(`Photofinish is not used.`);
  }
});

Cypress.Commands.add('navigateToItem', (item) => {
  initializeOpenSidebar();
  const items = Array.isArray(item) ? item : [item];
  items.forEach((it) => cy.get('.tn-menu-item').contains(it).click());
});

Cypress.Commands.add('clickOutside', () => {
  return cy.get('body').click(0, 0); //0,0 here are the x and y coordinates
});

Cypress.Commands.add('selectChecks', (clusterId, checks) => {
  const [webAPIHost, webAPIPort] = [
    Cypress.env('web_api_host'),
    Cypress.env('web_api_port'),
  ];
  const checksBody = JSON.stringify({
    checks: checks,
  });

  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
  };

  const url = `http://${webAPIHost}:${webAPIPort}/api/clusters/${clusterId}/checks`;
  cy.request({ method: 'POST', url: url, body: checksBody, headers: headers });
});

Cypress.Commands.add('removeTagsFromView', () => {
  cy.get('body').then(($body) => {
    const deleteTag = 'span.ml-2.cursor-pointer';
    if ($body.find(deleteTag).length > 0) {
      cy.get(deleteTag).then(($deleteTag) =>
        cy.wrap($deleteTag).click({ multiple: true })
      );
    }
  });
});

Cypress.Commands.add('addTagByColumnValue', (columnValue, tagValue) => {
  cy.get('td')
    .contains(columnValue)
    .parents('tr')
    .within(() => {
      cy.get('span').contains('Add Tag').type(`${tagValue}{enter}`);
    });
});

Cypress.Commands.add('setMockRunnerExpectedResult', (result) => {
  const [webAPIHost, webAPIPort] = [
    Cypress.env('web_api_host'),
    Cypress.env('web_api_port'),
  ];

  const requestResultBody = JSON.stringify({
    expected_results: result,
  });

  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
  };

  const url = `http://${webAPIHost}:${webAPIPort}/api/mockrunner/expected_result`;
  cy.request({
    method: 'POST',
    url: url,
    body: requestResultBody,
    headers: headers,
  });
});

Cypress.Commands.add('requestChecksExecution', (clusterId) => {
  const [webAPIHost, webAPIPort] = [
    Cypress.env('web_api_host'),
    Cypress.env('web_api_port'),
  ];

  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
  };

  const url = `http://${webAPIHost}:${webAPIPort}/api/clusters/${clusterId}/checks/request_execution`;
  cy.request({ method: 'POST', url: url, headers: headers });
});
