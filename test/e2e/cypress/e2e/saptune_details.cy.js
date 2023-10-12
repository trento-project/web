describe('Saptune Details page', () => {
  beforeEach(() => {
    cy.visit('/hosts/13e8c25c-3180-5a9a-95c8-51ec38e50cfc/saptune');
  });

  it('should show information from the agent with unsupported version', () => {
    cy.loadScenario('host-vmhdbdev01-saptune-unsupported');
    cy.get('div').should('contain', 'Saptune Details Not Found');
  });

  it('should show information from the agent saptune not installed', () => {
    cy.loadScenario('host-vmhdbdev01-saptune-uninstalled');
    cy.get('div').should('contain', 'Saptune Details Not Found');
  });

  it('should show not tuned saptune details', () => {
    cy.loadScenario('host-vmhdbdev01-saptune-not-tuned');

    cy.get('div').should('contain', 'Package').should('contain', '3.1.0');
    cy.get('div')
      .should('contain', 'Configured Version')
      .should('contain', '3');

    cy.get('div').should('contain', 'Tuning').find('svg').should('exist');
    cy.get('div')
      .should('contain', 'Tuning')
      .find('svg')
      .should('exist')
      .should('have.class', 'fill-yellow-500');
    cy.get('div').should('contain', 'Tuning').should('contain', 'No tuning');
  });

  it('should show compliant saptune details', () => {
    cy.loadScenario('host-vmhdbdev01-saptune-compliant');

    cy.get('div').should('contain', 'Package').should('contain', '3.1.0');
    cy.get('div')
      .should('contain', 'Configured Version')
      .should('contain', '3');
    cy.get('div').should('contain', 'Tuning').should('contain', 'Compliant');
    cy.get('div')
    .should('contain', 'saptune.service')
    .find('svg')
    .should('exist')
    .should('have.class', 'fill-yellow-500');
    cy.get('div')
      .should('contain', 'saptune.service')
      .should('contain', 'enabled/inactive');
    cy.get('div').should('contain', 'sapconf.service').should('contain', '-');
    cy.get('div').should('contain', 'tuned.service').should('contain', '-');
    cy.get('div')
      .should('contain', 'Enabled Solution')
      .should(
        'contain',
        'NETWEAVER (941735, 1771258, 2578899, 2993054, 1656250, 900929)'
      );
    cy.get('div')
      .should('contain', 'Applied Solution')
      .should(
        'contain',
        'NETWEAVER (941735, 1771258, 2578899, 2993054, 1656250, 900929)'
      );
    cy.get('div')
      .should('contain', 'Enabled Notes')
      .should('contain', '941735, 1771258, 2578899, 2993054, 1656250, 900929');
    cy.get('div')
      .should('contain', 'Applied Notes')
      .should('contain', '941735, 1771258, 2578899, 2993054, 1656250, 900929');
    cy.get('div').should('contain', 'Staging').should('contain', 'Disabled');
    cy.get('div').should('contain', 'Staged Notes').should('contain', '-');
    cy.get('div').should('contain', 'Staged Solutions').should('contain', '-');
  });
});
