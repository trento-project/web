context('HANA scale-up checks', () => {
  const clusterID = 'd2522281-2c76-52dc-8500-10bdf2cc6664';

  const PASSING = 'fill-jungle-green-500';
  const WARNING = 'fill-yellow-500';
  const CRITICAL = 'fill-red-500';

  const expectedCheckResults = [
    [
      ['A1244C', PASSING],
      ['C620DC', PASSING],
      ['24ABCB', PASSING],
      ['845CC9', PASSING],
      ['21FCA6', PASSING],
      ['156F64', PASSING],
      ['33403D', PASSING],
      ['6E9B82', PASSING],
      ['DA114A', WARNING],
      ['822E47', PASSING],
      ['15F7A8', PASSING],
      ['7E0221', PASSING],
      ['32CFC6', WARNING],
      ['FB0E0D', PASSING],
      ['00081D', PASSING],
      ['53D035', PASSING],
      ['D78671', PASSING],
    ],
    [['790926', WARNING]],
    [
      ['DC5429', PASSING],
      ['CAEFF1', PASSING],
      ['D028B9', PASSING],
      ['9FAAD0', PASSING],
      ['9FEFB0', PASSING],
      ['F50AF5', PASSING],
    ],
    [
      ['373DB8', CRITICAL],
      ['205AF7', PASSING],
    ],
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

      expectedCheckResults.forEach((groupedResults, groupIndex) => {
        cy.get('table').eq(groupIndex).find('.tn-check-result-row').as('rows');

        groupedResults.forEach(([checkID, result], checkIndex) => {
          cy.get('@rows').eq(checkIndex).as('row').contains(checkID);
          cy.get('@row')
            .find('[data-testid="eos-svg-component"]')
            .should('have.class', result);
        });
      });
    });
  });
});
