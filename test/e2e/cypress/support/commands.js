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

const apiLogin = () => {
  const [username, password] = [
    Cypress.env('login_user'),
    Cypress.env('login_password'),
  ];
  return cy
    .request({
      method: 'POST',
      url: '/api/session',
      body: {
        username,
        password,
      },
    })
    .then((response) => {
      const { access_token: accessToken, refresh_token: refreshToken } =
        response.body;
      return { accessToken, refreshToken };
    });
};

Cypress.Commands.add('initiateSession', () => {
  cy.session('trento-jwt', () => {
    apiLogin().then(({ accessToken, refreshToken }) => {
      window.localStorage.setItem('access_token', accessToken);
      window.localStorage.setItem('refresh_token', refreshToken);
    });
  });
});

Cypress.Commands.add('apiLogin', () => {
  return apiLogin().then(({ accessToken }) => {
    localStorage.setItem('access_token', accessToken);
  });
});

Cypress.Commands.add('acceptEula', () => {
  apiLogin().then(({ accessToken }) => {
    cy.request({
      url: '/api/v1/accept_eula',
      method: 'POST',
      auth: {
        bearer: accessToken,
      },
      body: {},
    });
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

  apiLogin().then(({ accessToken }) => {
    const url = `http://${webAPIHost}:${webAPIPort}/api/clusters/${clusterId}/checks`;
    cy.request({
      method: 'POST',
      url: url,
      body: checksBody,
      headers: headers,
      auth: {
        bearer: accessToken,
      },
    });
  });
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
      cy.intercept('POST', '/api/*/*/tags');
      cy.get('span').contains(tagValue);
    });
});

Cypress.Commands.add('resetFilterSelection', (filterName) => {
  cy.get(`[data-testid="filter-${filterName}"]`)
    .parent()
    .within(($filter) => {
      const resetButton = '[data-testid="eos-svg-component"]';
      if ($filter.find(resetButton).length > 0) {
        cy.get(resetButton).click();
      }
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

  apiLogin().then(({ accessToken }) => {
    const url = `http://${webAPIHost}:${webAPIPort}/api/mockrunner/expected_result`;
    cy.request({
      method: 'POST',
      url: url,
      body: requestResultBody,
      headers: headers,
      auth: {
        bearer: accessToken,
      },
    });
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

  apiLogin().then(({ accessToken }) => {
    const url = `http://${webAPIHost}:${webAPIPort}/api/clusters/${clusterId}/checks/request_execution`;
    cy.request({
      method: 'POST',
      url: url,
      headers: headers,
      auth: {
        bearer: accessToken,
      },
    });
  });
});
