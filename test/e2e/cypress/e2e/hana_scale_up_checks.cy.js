context('HANA scale-up checks', () => {
  const clusterID = '597a00db-5920-5033-b3b4-1dc98ca8718a';

  const PASSING = 'fill-jungle-green-500';
  // eslint-disable-next-line no-unused-vars
  const WARNING = 'fill-yellow-500';
  // eslint-disable-next-line no-unused-vars
  const CRITICAL = 'fill-red-500';

  const expectedCheckResults = {
    A1244C: CRITICAL,
    C620DC: PASSING,
    '33403D': PASSING,
    DA114A: WARNING,
    790926: PASSING,
    '61451E': WARNING,
  };

  before(() => {
    cy.visit(`/clusters/${clusterID}`);
    cy.url().should('include', `/clusters/${clusterID}`);
  });

  describe('Run checks', () => {
    it('should run checks with expected results', () => {
      cy.get('button').contains('Check Selection').click();

      cy.get('.tn-check-switch').click({ multiple: true });
      cy.get('button').contains('Save Checks Selection').click();
      cy.get('button').contains('Back to Cluster Details').click();
      cy.get('button').contains('Start Execution').click();

      cy.get('table').each((_, index) => {
        cy.get('table').eq(index).find('.tn-check-result-row').as('rows');

        cy.get('@rows').each((elem) => {
          const checkID = elem.find('td').get(0).innerText;
          const result = expectedCheckResults[checkID];

          if (result) {
            cy.get(elem)
              .find('[data-testid="eos-svg-component"]')
              .should('have.class', result);
          }
        });
      });
    });
  });
});
