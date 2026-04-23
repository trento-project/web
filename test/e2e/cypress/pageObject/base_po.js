import { TOTP } from 'totp-generator';
import { createUserRequestFactory } from '@lib/test-utils/factories';

// Test data
const DEFAULT_USERNAME = Cypress.env('login_user');
const DEFAULT_PASSWORD = Cypress.env('login_password');

export const plainUser = {
  username: 'trentoidp',
  password: 'password',
  fullname: 'Trento IDP user Of Monk',
  email: 'trentoidp@trento.suse.com',
};

export const adminUser = {
  username: 'admin',
  password: 'admin',
  fullname: 'Trento Admin',
  email: 'admin@trento.suse.com',
  permissions: 'all:all',
};

const password = 'password';

const user = createUserRequestFactory.build({
  password,
  password_confirmation: password,
});

// Selectors
const pageTitle = 'h1';
const userDropdownMenuButton = 'header button[id*="menu"]';
const userDropdownProfileButton = 'a:contains("Profile")';
const accessForbiddenMessage =
  'div:contains("Access to this page is forbidden")';
export const navigation = {
  navigationItems: 'nav a',
  activityLog: 'a:contains("Activity Log")',
  hosts: 'a:contains("Hosts")',
};
const signOutButton = 'button:contains("Sign out")';
const removeEnv1TagButton = 'span span:contains("env1") span';
export const addTagButtons = 'span span:contains("Add Tag")';
const usernameMenu = `span[class="flex items-center"]:contains("${plainUser.username}")`;

// UI Interactions
export const visit = (url = '/') => cy.visit(url);

export const clickUsernameMenu = () => cy.get(usernameMenu).click();

export const validateUrl = (url = '/') =>
  cy.url().should('eq', `${Cypress.config().baseUrl}${url}`);

export const refresh = () => cy.reload();

export const addTagByColumnValue = (columnValue, tagValue) =>
  cy
    .get(`td:contains(${columnValue})`)
    .parents('tr')
    .within(() => cy.get(addTagButtons).type(`${tagValue}{enter}`));

export const clickActivityLogNavigationItem = () =>
  cy.get(navigation.activityLog).click();

export const clickActivityLogNavigationItem5Times = () => {
  for (let i = 0; i < 5; i++) {
    clickActivityLogNavigationItem();
  }
};

export const clickSignOutButton = () => {
  clickUserDropdownMenuButton();
  return cy.get(signOutButton).click();
};

export const clickUserDropdownMenuButton = () =>
  cy.get(userDropdownMenuButton).click();

export const clickUserDropdownProfileButton = () =>
  cy.get(userDropdownProfileButton).click();

const _getTotpWaitTime = (forceNext) => {
  const currentTime = Date.now();
  const totpDuration = 30000;
  const minimumRemainingTimeToReuse = 10000;
  const expirationTime = Math.ceil(currentTime / totpDuration) * totpDuration;
  const remainingTime = Math.floor(expirationTime - currentTime);

  const totpWaitingTime =
    forceNext === false && remainingTime > minimumRemainingTimeToReuse
      ? 0
      : remainingTime;

  return totpWaitingTime;
};

export const typeNextGeneratedTotpCode = (
  totpSecret,
  inputField,
  forceNext = false
) => {
  const timeToWait = _getTotpWaitTime(forceNext);

  return cy.wait(timeToWait).then(() =>
    cy.wrap(TOTP.generate(totpSecret)).then(({ otp }) =>
      cy
        .get(inputField)
        .clear()
        .type(otp)
        .then(() => otp)
    )
  );
};

export const selectOptions = '[role="listbox"] [role="option"]';

export const selectFromDropdown = (selector, choice) => {
  cy.get(selector).click();
  return cy.get(`${selectOptions}:contains("${choice}")`).click();
};

export const getSelectControlValue = (ariaLabel) =>
  `div:has(> ${ariaLabel}) [class$="-singleValue"]`;

export const clickOutside = () => cy.get('body').click();

// UI Validations

export const shouldRedirectToIdpUrl = () =>
  cy.url().should('contain', '/realms/trento');

export const plainUsernameIsDisplayed = () =>
  cy.get(usernameMenu).should('be.visible');

export const userDropdownMenuButtonHasTheExpectedText = (username) =>
  cy.get(userDropdownMenuButton).should('have.text', username);

export const pageTitleIsCorrectlyDisplayed = (title) =>
  cy.get(pageTitle).should('contain', title);

export const accessForbiddenMessageIsDisplayed = () =>
  cy.get(accessForbiddenMessage).should('be.visible');

export const validateItemNotPresentInNavigationMenu = (itemName) =>
  cy
    .get(navigation.navigationItems)
    .each(($element) => cy.wrap($element).should('not.include.text', itemName));

export const validateItemPresentInNavigationMenu = (navigationMenuItem) =>
  cy.get(`a:contains("${navigationMenuItem}")`).should('be.visible');

export const addTagButtonsAreDisabled = () =>
  cy.get(addTagButtons).should('have.class', 'opacity-50');

export const addTagButtonsAreNotDisabled = () =>
  cy.get(addTagButtons).should('not.have.class', 'opacity-50');

export const removeTagButtonIsDisabled = () =>
  cy.get(removeEnv1TagButton).should('have.class', 'opacity-50');

export const removeTagButtonIsEnabled = () =>
  cy.get(removeEnv1TagButton).should('not.have.class', 'opacity-50');

// API Interactions & Validations

export const validateResponseStatusCode = (endpointAlias, expectedStatusCode) =>
  cy
    .wait(`@${endpointAlias}`)
    .its('response.statusCode')
    .should('eq', expectedStatusCode);

export const apiLogin = (
  username = DEFAULT_USERNAME,
  password = DEFAULT_PASSWORD
) =>
  cy
    .request({
      method: 'POST',
      url: '/api/session',
      body: { username, password },
    })
    .then((response) => {
      const { access_token: accessToken, refresh_token: refreshToken } =
        response.body;
      return { accessToken, refreshToken };
    });

export const apiLoginAndCreateSession = (
  username = DEFAULT_USERNAME,
  password = DEFAULT_PASSWORD
) =>
  cy.session([username, password], () => {
    apiLogin(username, password).then(({ accessToken, refreshToken }) => {
      window.localStorage.setItem('access_token', accessToken);
      window.localStorage.setItem('refresh_token', refreshToken);
    });
  });

export const refreshLoginToken = (
  username = DEFAULT_USERNAME,
  password = DEFAULT_PASSWORD
) => {
  if (Cypress.env('web_mode') === 'dev') {
    return;
  }

  Cypress.session.clearAllSavedSessions();
  return apiLoginAndCreateSession(username, password);
};

export const logout = () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('access_token');
    win.localStorage.removeItem('refresh_token');
  });
  return Cypress.session.clearAllSavedSessions();
};

export const apiDeleteUser = (id, accessToken) =>
  cy.request({
    url: `/api/v1/users/${id}`,
    method: 'DELETE',
    auth: { bearer: accessToken },
  });

export const apiDeleteAllUsers = () =>
  apiLogin().then(({ accessToken }) =>
    cy
      .request({
        url: '/api/v1/users',
        method: 'GET',
        auth: { bearer: accessToken },
      })
      .then(({ body: users }) =>
        cy.wrap(users).each(({ id }) => {
          if (id !== 1) return apiDeleteUser(id, accessToken);
        })
      )
  );

export const waitForRequest = (requestAlias, timeout = 10000) =>
  cy.wait(`@${requestAlias}`, { timeout: timeout });

export const preloadTestData = ({ isDataLoadedFunc = isTestDataLoaded } = {}) =>
  /**
   * Preload required test data.
   * It must run photofinish scenario twice as the order of sent payloads is relevant
   * and the tests require a fully loaded scenario which only happens when the
   * scenario is sent in the second time.
   */
  isDataLoadedFunc().then((isLoaded) => {
    if (!isLoaded) loadScenario('healthy-27-node-SAP-cluster');
    return loadScenario('healthy-27-node-SAP-cluster');
  });

export const loadScenario = (scenario) => {
  const [projectRoot, photofinishBinary] = [
    Cypress.env('project_root'),
    Cypress.env('photofinish_binary'),
  ];

  const baseUrl = Cypress.config().baseUrl;

  if (!photofinishBinary) {
    cy.log('Photofinish binary not present');
    return;
  }

  let photofinishCommand = `cd ${projectRoot} && ${photofinishBinary} run --url "${baseUrl}/api/v1/collect" ${scenario}`;

  const runPhotofinish = (apiKey) => {
    photofinishCommand = apiKey
      ? `${photofinishCommand} "${apiKey}"`
      : photofinishCommand;
    cy.log(`Shooting scenario "${scenario}" to: ${baseUrl}`);
    return cy.exec(photofinishCommand, { timeout: 360000 });
  };

  if (Cypress.env('web_mode') === 'dev') return runPhotofinish();
  else return getApiKey().then((apiKey) => runPhotofinish(apiKey));
};

export const getApiKey = () =>
  apiLogin().then(({ accessToken }) =>
    cy
      .request({
        url: '/api/v1/settings/api_key',
        method: 'GET',
        auth: {
          bearer: accessToken,
        },
      })
      .then((response) => response.body.generated_api_key)
  );

const isTestDataLoaded = () =>
  apiLogin().then(({ accessToken }) =>
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

export const startAgentsHeartbeat = (agents) => {
  if (Cypress.env('web_mode') === 'dev') {
    return cy.task('startAgentHeartbeat', { agents });
  }

  return getApiKey().then((apiKey) =>
    cy.task('startAgentHeartbeat', { agents, apiKey })
  );
};

export const apiCreateUserWithAbilities = (abilities) =>
  apiLogin().then(({ accessToken }) =>
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

        return cy.request({
          url: '/api/v1/users',
          method: 'POST',
          auth: { bearer: accessToken },
          body: { ...user, abilities: abilitiesWithID },
        });
      })
  );

export const apiAcceptAnalyticsEula = (
  username = user.username,
  pass = password
) =>
  apiLogin(username, pass).then(({ accessToken }) =>
    cy.request({
      url: '/api/v1/profile',
      method: 'PATCH',
      auth: { bearer: accessToken },
      body: { analytics_eula_accepted: true },
    })
  );

export const apiDeregisterHost = (hostId) =>
  isHostRegistered(hostId).then((isRegistered) => {
    if (isRegistered) {
      return apiLogin().then(({ accessToken }) => {
        const url = `/api/v1/hosts/${hostId}`;
        return cy.request({
          method: 'DELETE',
          url: url,
          auth: {
            bearer: accessToken,
          },
        });
      });
    } else return;
  });

export const apiDeregisterRealHost = () =>
  apiLogin().then(({ accessToken }) =>
    cy
      .request({
        url: '/api/v1/hosts',
        method: 'GET',
        auth: {
          bearer: accessToken,
        },
      })
      .then(({ body }) => {
        const hostId = body[0].id;
        return apiDeregisterHost(hostId);
      })
  );

export const stopAgentsHeartbeat = () => cy.task('stopAgentsHeartbeat');

export const isHostRegistered = (hostId) =>
  apiLogin()
    .then(({ accessToken }) => {
      const url = '/api/v1/hosts/';
      return cy.request({
        method: 'GET',
        url: url,
        auth: {
          bearer: accessToken,
        },
      });
    })
    .then(({ body }) => body.some((host) => host.id === hostId));

export const loginWithoutAbilities = () =>
  apiLoginAndCreateSession(user.username, password);

export const loginWithAbilities = () =>
  apiLoginAndCreateSession(user.username, password);

export const apiCreateUserWithoutAbilities = () =>
  apiCreateUserWithAbilities([]);

export const getResourceTags = (resourceResponse) => {
  const resourceTags = {};
  resourceResponse.forEach((resourceItem) => {
    if (resourceItem.tags && resourceItem.tags.length > 0) {
      resourceTags[resourceItem.id] = resourceItem.tags.map((tag) => tag.value);
    }
  });
  return resourceTags;
};

export const apiSetTag = (resource, resourceId, tag) =>
  apiLogin().then(({ accessToken }) =>
    cy.request({
      url: `/api/v1/${resource}/${resourceId}/tags`,
      method: 'POST',
      auth: { bearer: accessToken },
      body: { value: tag },
    })
  );

export const apiSelectChecks = (clusterId, checks) => {
  const checksBody = JSON.stringify({
    checks: checks,
  });

  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
  };

  return apiLogin().then(({ accessToken }) => {
    const url = `/api/v1/clusters/${clusterId}/checks`;
    return cy.request({
      method: 'POST',
      url: url,
      body: checksBody,
      headers: headers,
      auth: {
        bearer: accessToken,
      },
    });
  });
};

export const saveSUMASettings = ({ url, username, password, ca_cert }) =>
  clearSUMASettings().then(() =>
    apiLogin().then(({ accessToken }) =>
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

export const clearSUMASettings = () =>
  apiLogin().then(({ accessToken }) =>
    cy.request({
      url: '/api/v1/settings/suse_manager',
      method: 'DELETE',
      auth: {
        bearer: accessToken,
      },
    })
  );

export const getAlertingSettings = () =>
  apiLogin().then(({ accessToken }) =>
    cy.request({
      url: '/api/v1/settings/alerting',
      method: 'GET',
      auth: {
        bearer: accessToken,
      },
      failOnStatusCode: false,
    })
  );
