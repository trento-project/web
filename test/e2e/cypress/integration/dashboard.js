describe("Dashboard page", () => {
  before(() => {
    cy.loadScenario("healthy-27-node-SAP-cluster");
    cy.login("chiecks@trento.io", "secret1234");
    cy.visit("/");
    cy.url().should("include", "/");
  });

  describe('The current state should be available in a summary', () => {
    it("should display 27 hosts and 9 clusters", () => {
      cy.get(".mr-4 > div > .mt-2").should("contain", "27");
      cy.get(":nth-child(2) > div > .mt-2").should("contain", "9");
    });
  });
});
