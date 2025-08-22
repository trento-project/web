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

export const addTagByColumnValue = (columnValue, tagValue) => {
  return cy
    .get(`td:contains(${columnValue})`)
    .parents('tr')
    .within(() => {
      cy.get(addTagButtons).type(`${tagValue}{enter}`);
    });
};

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

  return cy.wait(timeToWait).then(() => {
    const { otp } = TOTP.generate(totpSecret);
    return cy
      .get(inputField)
      .clear()
      .type(otp)
      .then(() => otp);
  });
};

export const selectFromDropdown = (selector, choice) => {
  cy.get(selector).click();
  return cy.get(`${selector} + div div:contains("${choice}")`).click();
};

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

export const validateItemNotPresentInNavigationMenu = (itemName) => {
  return cy.get(navigation.navigationItems).each(($element) => {
    cy.wrap($element).should('not.include.text', itemName);
  });
};

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

export const validateResponseStatusCode = (
  endpointAlias,
  expectedStatusCode
) => {
  return cy
    .wait(`@${endpointAlias}`)
    .its('response.statusCode')
    .should('eq', expectedStatusCode);
};

export const apiLogin = (
  username = DEFAULT_USERNAME,
  password = DEFAULT_PASSWORD
) => {
  return cy
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
};

export const apiLoginAndCreateSession = (
  username = DEFAULT_USERNAME,
  password = DEFAULT_PASSWORD
) => {
  return cy.session([username, password], () => {
    apiLogin(username, password).then(({ accessToken, refreshToken }) => {
      window.localStorage.setItem('access_token', accessToken);
      window.localStorage.setItem('refresh_token', refreshToken);
    });
  });
};

export const logout = () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('access_token');
    win.localStorage.removeItem('refresh_token');
  });
  Cypress.session.clearAllSavedSessions();
};

export const apiDeleteUser = (id, accessToken) => {
  return cy.request({
    url: `/api/v1/users/${id}`,
    method: 'DELETE',
    auth: { bearer: accessToken },
  });
};

export const apiDeleteAllUsers = () => {
  return apiLogin().then(({ accessToken }) => {
    cy.request({
      url: '/api/v1/users',
      method: 'GET',
      auth: { bearer: accessToken },
    }).then(({ body: users }) => {
      users.forEach(({ id }) => {
        if (id !== 1) apiDeleteUser(id, accessToken);
      });
    });
  });
};

export const waitForRequest = (requestAlias, timeout = 5000) =>
  cy.wait(`@${requestAlias}`, { timeout: timeout });

export const preloadTestData = ({
  isDataLoadedFunc = isTestDataLoaded,
} = {}) => {
  /**
   * Preload required test data.
   * It must run photofinish scenario twice as the order of sent payloads is relevant
   * and the tests require a fully loaded scenario which only happens when the
   * scenario is sent in the second time.
   */
  isDataLoadedFunc().then((isLoaded) => {
    if (!isLoaded) loadScenario('healthy-27-node-SAP-cluster');
  });
  loadScenario('healthy-27-node-SAP-cluster');
};

export const loadScenario = (scenario) => {
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
};

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

export const apiCreateUserWithAbilities = (abilities) => {
  return apiLogin().then(({ accessToken }) =>
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
          body: { ...user, abilities: abilitiesWithID },
        });
      })
  );
};

export const apiDeregisterHost = (hostId) => {
  return isHostRegistered(hostId).then((isRegistered) => {
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
};

export const stopAgentsHeartbeat = () => cy.task('stopAgentsHeartbeat');

export const isHostRegistered = (hostId) => {
  return apiLogin()
    .then(({ accessToken }) => {
      const url = '/api/v1/hosts/';
      cy.request({
        method: 'GET',
        url: url,
        auth: {
          bearer: accessToken,
        },
      });
    })
    .then(({ body }) => body.some((host) => host.id === hostId));
};

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

export const apiSetTag = (resource, resourceId, tag) => {
  return apiLogin().then(({ accessToken }) =>
    cy.request({
      url: `/api/v1/${resource}/${resourceId}/tags`,
      method: 'POST',
      auth: { bearer: accessToken },
      body: { value: tag },
    })
  );
};

export const apiSelectChecks = (clusterId, checks) => {
  const checksBody = JSON.stringify({
    checks: checks,
  });

  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
  };

  return apiLogin().then(({ accessToken }) => {
    const url = `/api/clusters/${clusterId}/checks`;
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
};

export const saveSUMASettings = ({ url, username, password, ca_cert }) =>
  clearSUMASettings().then(() => {
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
    );
  });

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
