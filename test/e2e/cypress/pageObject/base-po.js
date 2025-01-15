import { TOTP } from 'totp-generator';

export default class BasePage {
  constructor() {
    this.DEFAULT_USERNAME = Cypress.env('login_user');
    this.DEFAULT_PASSWORD = Cypress.env('login_password');
    this.pageTitle = 'h1';
    this.userDropdownMenuButton = 'header button[id*="menu"]';
    this.userDropdownProfileButton = 'a:contains("Profile")';
    this.accessForbiddenMessage =
      'div:contains("Access to this page is forbidden")';
    this.navigation = {
      navigationItems: 'nav a',
    };
    this.signOutButton = 'button:contains("Sign out")';
  }

  visit(url = '/') {
    return cy.visit(url);
  }

  validateUrl(url = '/') {
    return cy.url().should('eq', `${Cypress.config().baseUrl}${url}`);
  }

  refresh() {
    return cy.reload();
  }

  clickSignOutButton() {
    this.clickUserDropdownMenuButton();
    return cy.get(this.signOutButton).click();
  }

  clickUserDropdownMenuButton() {
    return cy.get(this.userDropdownMenuButton).click();
  }

  clickUserDropdownProfileButton() {
    return cy.get(this.userDropdownProfileButton).click();
  }

  userDropdownMenuButtonHasTheExpectedText(username) {
    return cy.get(this.userDropdownMenuButton).should('have.text', username);
  }

  typeTotpCode(totpSecret, inputField) {
    const { otp } = TOTP.generate(totpSecret);
    return cy
      .get(inputField)
      .clear()
      .type(otp)
      .then(() => totpSecret);
  }

  apiLogin(username = this.DEFAULT_USERNAME, password = this.DEFAULT_PASSWORD) {
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
  }

  apiLoginAndCreateSession(
    username = this.DEFAULT_USERNAME,
    password = this.DEFAULT_PASSWORD
  ) {
    return cy.session([username, password], () => {
      this.apiLogin(username, password).then(
        ({ accessToken, refreshToken }) => {
          window.localStorage.setItem('access_token', accessToken);
          window.localStorage.setItem('refresh_token', refreshToken);
        }
      );
    });
  }

  logout() {
    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('refresh_token');
    Cypress.session.clearAllSavedSessions();
  }

  apiDeleteUser(id, accessToken) {
    return cy.request({
      url: `/api/v1/users/${id}`,
      method: 'DELETE',
      auth: { bearer: accessToken },
    });
  }

  apiDeleteAllUsers() {
    return this.apiLogin().then(({ accessToken }) => {
      cy.request({
        url: '/api/v1/users',
        method: 'GET',
        auth: { bearer: accessToken },
      }).then(({ body: users }) => {
        users.forEach(({ id }) => {
          if (id !== 1) this.apiDeleteUser(id, accessToken);
        });
      });
    });
  }

  pageTitleIsCorrectlyDisplayed(title) {
    return cy.get(this.pageTitle).should('contain', title);
  }

  accessForbiddenMessageIsDisplayed() {
    return cy.get(this.accessForbiddenMessage).should('be.visible');
  }

  validateItemNotPresentInNavigationMenu(itemName) {
    return cy.get(this.navigation.navigationItems).each(($element) => {
      cy.wrap($element).should('not.include.text', itemName);
    });
  }

  validateItemPresentInNavigationMenu(navigationMenuItem) {
    return cy.get(this.navigation.navigationItems).then(($elements) => {
      const itemFound = Array.from($elements).some((element) =>
        element.innerText.includes(navigationMenuItem)
      );
      expect(
        itemFound,
        `"${navigationMenuItem}" navigation item should be present`
      ).to.be.true;
    });
  }

  selectFromDropdown(selector, choice) {
    cy.get(selector).click();
    return cy.get(`${selector} + div div:contains("${choice}")`).click();
  }
}
