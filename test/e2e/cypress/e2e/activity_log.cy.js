/* eslint-disable cypress/no-unnecessary-waiting */

context('Activity Log page', () => {
  describe('Filtering', () => {
    it('should render without selected filters', () => {
      cy.intercept({
        url: '/api/v1/activity_log',
      }).as('data');
      cy.visit('/activity_log');

      cy.contains('Filter Resource type', { matchCase: false }).should(
        'be.visible'
      );
      cy.contains('Filter older than', { matchCase: false }).should(
        'be.visible'
      );
      cy.contains('Filter newer than', { matchCase: false }).should(
        'be.visible'
      );

      cy.wait('@data').its('response.statusCode').should('eq', 200);
    });

    it('should render with selected filters from querystring', () => {
      cy.intercept({
        url: '/api/v1/activity_log?from_date=2024-08-14T10:21:00.000Z&to_date=2024-08-13T10:21:00.000Z&type[]=login_attempt&type[]=resource_tagging',
      }).as('data');

      cy.visit(
        '/activity_log?from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging'
      );

      cy.contains('Login Attempt, Tag Added').should('be.visible');
      cy.contains('8/14/2024 10:21:00 AM').should('be.visible');
      cy.contains('8/13/2024 10:21:00 AM').should('be.visible');

      cy.wait('@data').its('response.statusCode').should('eq', 200);
    });

    it('should update querystring when filters are selected', () => {
      cy.visit('/activity_log');

      cy.contains('Filter older than').click();
      cy.get('input[type="datetime-local"]:first').type('2024-08-14T10:21');

      cy.contains('Filter newer than').click();
      cy.get('input[type="datetime-local"]:first').type('2024-08-13T10:21');

      cy.contains('Filter Resource type').click();
      cy.contains('Login Attempt').click();
      cy.contains('Tag Added').click();

      cy.contains('Apply').click();

      cy.url().should(
        'eq',
        `${
          Cypress.config().baseUrl
        }/activity_log?from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging`
      );
    });

    it('should reset filters', () => {
      cy.intercept({
        url: '/api/v1/activity_log',
      }).as('data');

      cy.visit(
        '/activity_log?from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging'
      );

      cy.contains('Reset').click();

      cy.contains('Filter Resource type', { matchCase: false }).should(
        'be.visible'
      );
      cy.contains('Filter older than', { matchCase: false }).should(
        'be.visible'
      );
      cy.contains('Filter newer than', { matchCase: false }).should(
        'be.visible'
      );

      cy.wait('@data').its('response.statusCode').should('eq', 200);
    });
  });
});
