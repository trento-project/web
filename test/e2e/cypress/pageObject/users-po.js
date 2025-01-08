import BasePage from './base-po.js';

export default class UsersPage extends BasePage {
  constructor() {
    super();
    this.url = '/users';
    this.createUserButton = 'button[class*="green"]';
    this.newUserName = 'tbody tr:nth-child(2) a';
    this.newUserEmail = 'tbody tr:nth-child(2) p';
    this.usersTableRows = 'tbody tr';
  }

  visit() {
    return cy.visit(this.url);
  }

  validateUrl() {
    return cy.url().should('include', this.url);
  }

  clickCreateUserButton() {
    return cy.get(this.createUserButton).click();
  }

  newUserIsDisplayed(username, email) {
    cy.get(this.usersTableRows).should('have.length', 2);
    cy.get(this.newUserName).contains(username);
    cy.get(this.newUserEmail).contains(email);
  }
}
