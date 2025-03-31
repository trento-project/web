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

const DEFAULT_USERNAME = Cypress.env('login_user');
const DEFAULT_PASSWORD = Cypress.env('login_password');

const apiLogin = (username, password) => {
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

Cypress.Commands.add(
  'login',
  (username = DEFAULT_USERNAME, password = DEFAULT_PASSWORD) => {
    cy.session([username, password], () => {
      apiLogin(username, password).then(({ accessToken, refreshToken }) => {
        window.localStorage.setItem('access_token', accessToken);
        window.localStorage.setItem('refresh_token', refreshToken);
      });
    });
  }
);

Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('access_token');
  window.localStorage.removeItem('refresh_token');
});

Cypress.Commands.add(
  'apiLogin',
  (username = DEFAULT_USERNAME, password = DEFAULT_PASSWORD) => {
    apiLogin(username, password);
  }
);

Cypress.Commands.add('updateApiKeyExpiration', (apiKeyExpiration) => {
  cy.apiLogin().then(({ accessToken }) => {
    cy.request({
      url: '/api/v1/settings/api_key',
      method: 'PATCH',
      auth: {
        bearer: accessToken,
      },
      body: {
        expire_at: apiKeyExpiration,
      },
    });
  });
});

Cypress.Commands.add('preloadTestData', () => {
  /**
   * Preload required test data.
   * It must run photofinish scenario twice as the order of sent payloads is relevant
   * and the tests require a fully loaded scenario which only happens when the
   * scenario is sent in the second time.
   */
  isTestDataLoaded().then((isLoaded) => {
    if (!isLoaded) cy.loadScenario('healthy-27-node-SAP-cluster');
  });
  cy.loadScenario('healthy-27-node-SAP-cluster');
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

const isTestDataLoaded = () =>
  cy.apiLogin().then(({ accessToken }) =>
    cy
      .request({
        url: '/api/v1/hosts',
        method: 'GET',
        auth: {
          bearer: accessToken,
        },
      })
      .then(({ body }) => body.length !== 0)
  );

Cypress.Commands.add(
  'saveSUMASettings',
  ({ url, username, password, ca_cert }) =>
    cy.apiLogin().then(({ accessToken }) =>
      cy.request({
        url: '/api/v1/settings/suse_manager',
        method: 'POST',
        auth: {
          bearer: accessToken,
        },
        body: {
          url,
          username,
          password,
          ...(ca_cert && { ca_cert }),
        },
      })
    )
);

Cypress.Commands.add('clearSUMASettings', () =>
  cy.apiLogin().then(({ accessToken }) =>
    cy.request({
      url: '/api/v1/settings/suse_manager',
      method: 'DELETE',
      auth: {
        bearer: accessToken,
      },
    })
  )
);

Cypress.Commands.add('createUserWithAbilities', (payload, abilities) =>
  cy.apiLogin().then(({ accessToken }) =>
    cy
      .request({
        url: '/api/v1/abilities',
        method: 'GET',
        auth: { bearer: accessToken },
        body: {},
      })
      .then(({ body }) => {
        const abilitiesWithID = abilities.map((ability) => ({
          ...body.find(
            ({ name, resource }) =>
              ability.name === name && ability.resource === resource
          ),
        }));

        cy.request({
          url: '/api/v1/users',
          method: 'POST',
          auth: { bearer: accessToken },
          body: { ...payload, abilities: abilitiesWithID },
        });
      })
  )
);

Cypress.Commands.add('deleteAllUsers', () =>
  cy.apiLogin().then(({ accessToken }) =>
    cy
      .request({
        url: '/api/v1/users',
        method: 'GET',
        auth: { bearer: accessToken },
        body: {},
      })
      .then(({ body: users }) => {
        users.forEach(({ id }) => {
          if (id === 1) {
            return;
          }
          cy.request({
            url: `/api/v1/users/${id}`,
            method: 'DELETE',
            auth: { bearer: accessToken },
            body: {},
          });
        });
      })
  )
);
