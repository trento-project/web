export default class BasePage {
  constructor() {
    this.DEFAULT_USERNAME = Cypress.env('login_user');
    this.DEFAULT_PASSWORD = Cypress.env('login_password');
    this.pageTitle = 'h1';
  }

  visit(url = '/') {
    cy.visit(url);
  }

  pageTitleIsCorrectlyDisplayed(title) {
    cy.get(this.pageTitle).should('contain', title);
  }

  clickButton(buttonText) {
    return cy.contains('button', buttonText).click();
  }

  apiLogin(username = this.DEFAULT_USERNAME, password = this.DEFAULT_PASSWORD) {
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
  }

  deleteUser(id, accessToken) {
    return cy.request({
      url: `/api/v1/users/${id}`,
      method: 'DELETE',
      auth: { bearer: accessToken },
      body: {},
    });
  }

  deleteAllUsers() {
    return this.apiLogin().then(({ accessToken }) =>
      cy
        .request({
          url: '/api/v1/users',
          method: 'GET',
          auth: { bearer: accessToken },
          body: {},
        })
        .then(({ body: users }) => {
          users.forEach(({ id }) => {
            const isAdminUser = id === 1;
            if (isAdminUser) {
              return;
            }
            this.deleteUser(id, accessToken);
          });
        })
    );
  }
}
