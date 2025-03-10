import { TOTP } from 'totp-generator';
import { createUserRequestFactory } from '@lib/test-utils/factories';

const DEFAULT_USERNAME = Cypress.env('login_user');
const DEFAULT_PASSWORD = Cypress.env('login_password');

const pageTitle = 'h1';
const userDropdownMenuButton = 'header button[id*="menu"]';
const userDropdownProfileButton = 'a:contains("Profile")';
const accessForbiddenMessage =
  'div:contains("Access to this page is forbidden")';
const navigation = {
  navigationItems: 'nav a',
  activityLog: 'a:contains("Activity Log")',
};
const signOutButton = 'button:contains("Sign out")';
const removeEnv1TagButton = 'span span:contains("env1") span';
export const addTagButtons = 'span span:contains("Add Tag")';

// Test data

const password = 'password';

const user = createUserRequestFactory.build({
  password,
  password_confirmation: password,
});

export const visit = (url = '/') => {
  return cy.visit(url);
};

export const validateUrl = (url = '/') => {
  return cy.url().should('eq', `${Cypress.config().baseUrl}${url}`);
};

export const refresh = () => {
  return cy.reload();
};

// UI Interactions
export const addTagByColumnValue = (columnValue, tagValue) => {
  return cy
    .get(`td:contains(${columnValue})`)
    .parents('tr')
    .within(() => {
      cy.get(addTagButtons).type(`${tagValue}{enter}`);
    });
};

export const clickActivityLogNavigationItem = () => {
  return cy.get(navigation.activityLog).click();
};

export const clickActivityLogNavigationItem5Times = () => {
  for (let i = 0; i < 5; i++) {
    clickActivityLogNavigationItem();
  }
};

export const clickSignOutButton = () => {
  clickUserDropdownMenuButton();
  return cy.get(signOutButton).click();
};

export const clickUserDropdownMenuButton = () => {
  return cy.get(userDropdownMenuButton).click();
};

export const clickUserDropdownProfileButton = () => {
  return cy.get(userDropdownProfileButton).click();
};

export const typeNextGeneratedTotpCode = (
  totpSecret,
  inputField,
  forceNext = false
) => {
  const currentTime = Date.now();
  const totpDuration = 30000;
  const expirationTime = Math.ceil(currentTime / totpDuration) * totpDuration;
  const remainingTime = Math.floor(expirationTime - currentTime);
  const timeToWait =
    forceNext === false && remainingTime > 10000 ? 0 : remainingTime;
  return cy.wait(timeToWait).then(() => {
    const { otp } = TOTP.generate(totpSecret);
    return cy
      .get(inputField)
      .clear()
      .type(otp)
      .then(() => otp);
  });
};

// UI Validations

export const userDropdownMenuButtonHasTheExpectedText = (username) => {
  return cy.get(userDropdownMenuButton).should('have.text', username);
};

export const pageTitleIsCorrectlyDisplayed = (title) => {
  return cy.get(pageTitle).should('contain', title);
};

export const accessForbiddenMessageIsDisplayed = () => {
  return cy.get(accessForbiddenMessage).should('be.visible');
};

export const validateItemNotPresentInNavigationMenu = (itemName) => {
  return cy.get(navigation.navigationItems).each(($element) => {
    cy.wrap($element).should('not.include.text', itemName);
  });
};

export const validateItemPresentInNavigationMenu = (navigationMenuItem) => {
  return cy.get(navigation.navigationItems).then(($elements) => {
    const itemFound = Array.from($elements).some((element) =>
      element.innerText.includes(navigationMenuItem)
    );
    expect(
      itemFound,
      `"${navigationMenuItem}" navigation item should be present`
    ).to.be.true;
  });
};

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

export const waitForRequest = (requestAlias) => cy.wait(`@${requestAlias}`);

export const selectFromDropdown = (selector, choice) => {
  cy.get(selector).click();
  return cy.get(`${selector} + div div:contains("${choice}")`).click();
};

export const preloadTestData = () => {
  /**
   * Preload required test data.
   * It must run photofinish scenario twice as the order of sent payloads is relevant
   * and the tests require a fully loaded scenario which only happens when the
   * scenario is sent in the second time.
   */
  isTestDataLoaded().then((isLoaded) => {
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

export const createUserWithAbilities = (abilities) => {
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

export const apiCreateUserWithoutAbilities = () => createUserWithAbilities([]);

export const getResourceTags = (resourceResponse) => {
  const resourceTags = {};
  resourceResponse.forEach((resourceItem) => {
    if (resourceItem.tags && resourceItem.tags.length > 0) {
      resourceTags[resourceItem.id] = resourceItem.tags.map((tag) => tag.value);
    }
  });
  return resourceTags;
};
