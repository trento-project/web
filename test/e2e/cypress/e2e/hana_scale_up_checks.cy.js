if (Cypress.env('REAL_CLUSTER_TESTS')) {
  context('HANA scale-up checks', () => {
    const clusterID = 'd2522281-2c76-52dc-8500-10bdf2cc6664';

    const PASSING = 'fill-jungle-green-500';
    const WARNING = 'fill-yellow-500';
    const CRITICAL = 'fill-red-500';

    const expectedCheckResults = [
      ['00081D', PASSING],
      ['156F64', PASSING],
      ['15F7A8', PASSING],
      ['21FCA6', PASSING],
      ['24ABCB', PASSING],
      ['32CFC6', WARNING],
      ['33403D', PASSING],
      ['53D035', PASSING],
      ['6E9B82', PASSING],
      ['7E0221', PASSING],
      ['822E47', PASSING],
      ['845CC9', PASSING],
      ['A1244C', PASSING],
      ['C620DC', PASSING],
      ['D78671', PASSING],
      ['DA114A', WARNING],
      ['FB0E0D', PASSING],
      ['205AF7', PASSING],
      ['373DB8', CRITICAL],
      ['790926', WARNING],
      ['9FAAD0', PASSING],
      ['9FEFB0', PASSING],
      ['CAEFF1', PASSING],
      ['D028B9', PASSING],
      ['DC5429', PASSING],
      ['F50AF5', PASSING],
    ];

    before(() => {
      cy.visit(`/clusters/${clusterID}`);
      cy.url().should('include', `/clusters/${clusterID}`);
    });

    describe('Run checks', () => {
      it('should run checks with expected results', () => {
        cy.get('button').contains('Settings').click();

        cy.get('.tn-check-switch').click({ multiple: true });
        cy.get('button').contains('Select Checks for Execution').click();
        cy.get('button').contains('Back to Cluster Details').click();
        cy.get('button').contains('Start Execution').click();

        cy.get('table').each((_, index) => {
          cy.get('table').eq(index).find('.tn-check-result-row').as('rows');

          cy.get('@rows').each((_, index) => {
            const [id, result] = expectedCheckResults[index];

            cy.get('@rows').eq(index).as('row').contains(id);
            cy.get('@row')
              .find('[data-testid="eos-svg-component"]')
              .should('have.class', result);
          });
        });
      });
    });
  });
}
