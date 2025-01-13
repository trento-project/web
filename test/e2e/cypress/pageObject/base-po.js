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
  }

  visit(url = '/') {
    cy.visit(url);
  }

  validateUrl() {
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  }

  refresh() {
    cy.reload();
  }

  pageTitleIsCorrectlyDisplayed(title) {
    cy.get(this.pageTitle).should('contain', title);
  }

  clickButton(buttonText) {
    cy.contains('button', buttonText).click();
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

  login(username = this.DEFAULT_USERNAME, password = this.DEFAULT_PASSWORD) {
    cy.session([username, password], () => {
      this.apiLogin(username, password).then(
        ({ accessToken, refreshToken }) => {
          window.localStorage.setItem('access_token', accessToken);
          window.localStorage.setItem('refresh_token', refreshToken);
        }
      );
    });
  }

  logout() {
    Cypress.session.clearAllSavedSessions();
  }

  deleteUser(id, accessToken) {
    return cy.request({
      url: `/api/v1/users/${id}`,
      method: 'DELETE',
      auth: { bearer: accessToken },
    });
  }

  deleteAllUsers() {
    return this.apiLogin().then(({ accessToken }) => {
      cy.request({
        url: '/api/v1/users',
        method: 'GET',
        auth: { bearer: accessToken },
      }).then(({ body: users }) => {
        users.forEach(({ id }) => {
          if (id !== 1) this.deleteUser(id, accessToken);
        });
      });
    });
  }

  clickUserDropdownMenuButton() {
    cy.get(this.userDropdownMenuButton).click();
  }

  clickUserDropdownProfileButton() {
    cy.get(this.userDropdownProfileButton).click();
  }

  userDropdownMenuButtonHasTheExpectedText(username) {
    cy.get(this.userDropdownMenuButton).should('have.text', username);
  }

  validateItemNotPresentInNavigationMenu(itemName) {
    cy.get(this.navigation.navigationItems).each(($element) => {
      cy.wrap($element).should('not.include.text', itemName);
    });
  }

  validateItemPresentInNavigationMenu(navigationMenuItem) {
    cy.get(this.navigation.navigationItems).then(($elements) => {
      const itemFound = Array.from($elements).some((element) =>
        element.innerText.includes(navigationMenuItem)
      );
      expect(
        itemFound,
        `"${navigationMenuItem}" navigation item should be present`
      ).to.be.true;
    });
  }

  accessForbiddenMessageIsDisplayed() {
    cy.get(this.accessForbiddenMessage).should('be.visible');
  }
}
