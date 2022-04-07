describe("User account page", () => {
  before(() => {
    cy.loadScenario("healthy-27-node-SAP-cluster");
    cy.login();
    cy.visit("/about");
    cy.url().should("include", "/about");
  });

  it("should have the correct page title", () => {
    cy.get(".text-5xl").should("contain", "About Trento Console");
  });

  it("should display 27 SLES subscriptions found", () => {
    cy.get(".px-2").should("contain", "27 found");
  });

  it("should show the correct flavor", () => {
    cy.get(".grid-flow-row > :nth-child(1) > :nth-child(2) > span").should(
      "contain",
      "Community"
    );
  });
});
