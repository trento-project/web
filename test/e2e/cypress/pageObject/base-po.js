import { TOTP } from 'totp-generator';

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

export const visit = (url = '/') => {
  return cy.visit(url);
};

export const validateUrl = (url = '/') => {
  return cy.url().should('eq', `${Cypress.config().baseUrl}${url}`);
};

export const refresh = () => {
  return cy.reload();
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

export const userDropdownMenuButtonHasTheExpectedText = (username) => {
  return cy.get(userDropdownMenuButton).should('have.text', username);
};

export const validateResponseStatusCode = (
  endpointAlias,
  expectedStatusCode
) => {
  return cy
    .wait(`@${endpointAlias}`)
    .its('response.statusCode')
    .should('eq', expectedStatusCode);
};

export const typeTotpCode = (totpSecret, inputField) => {
  const { otp } = TOTP.generate(totpSecret);
  return cy
    .get(inputField)
    .clear()
    .type(otp)
    .then(() => totpSecret);
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
  window.localStorage.removeItem('access_token');
  window.localStorage.removeItem('refresh_token');
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
