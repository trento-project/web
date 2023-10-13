describe('Saptune Details page', () => {
  beforeEach(() => {
    cy.visit('/hosts/13e8c25c-3180-5a9a-95c8-51ec38e50cfc/saptune');
  });

  it('should show not found text if saptune status is null', () => {
    cy.loadScenario('host-vmhdbdev01-saptune-unsupported');
    const notFoundContainer= cy.get('.pb-24')
    notFoundContainer.should('contain', 'Saptune Details Not Found');
  });

  it('should show not found text if saptune is not installed', () => {
    cy.loadScenario('host-vmhdbdev01-saptune-uninstalled');
    const notFoundContainer= cy.get('.pb-24')
    notFoundContainer.should('contain', 'Saptune Details Not Found');
  });

  it('should display saptune details when saptune is not tuning', () => {
    cy.loadScenario('host-vmhdbdev01-saptune-not-tuned');
    const versionContainer = cy.get('.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(3)')
    versionContainer.should('contain', 'Package').should('contain', '3.1.0')
    versionContainer.should('contain', 'Configured Version').should('contain', '3');
    versionContainer.should('contain', 'Tuning').should('contain', 'No tuning');
    versionContainer.should('contain', 'Tuning').find('svg').should('exist').should('have.class', 'fill-yellow-500');
  });

  it.only('should display Saptune Service Status in saptune details view passing', () => {
    cy.loadScenario('saptune-service-status_passing');
    const saptuneStatusContainer = cy.get('.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(5)')
    saptuneStatusContainer.should('contain','saptune.service').should('contain', 'enabled/active')
    saptuneStatusContainer.should('contain', 'sapconf.service').should('contain', 'disabled/inactive');
    saptuneStatusContainer.should('contain', 'tuned.service').should('contain', 'disabled/inactive');
    const saptuneServiceStatusContainer= cy.get('.grid-flow-col > :nth-child(1) > :nth-child(2) > :nth-child(1) > .flex')
    saptuneServiceStatusContainer.find('svg').should('exist').should('have.class', 'fill-jungle-green-500')
    const sapconfServiceStatusContainer=  cy.get('.grid-flow-col > :nth-child(2) > :nth-child(2) > :nth-child(1) > .flex')
    sapconfServiceStatusContainer.find('svg').should('exist').should('have.class', 'fill-jungle-green-500')
    const tunedServiceStatusContainer= cy.get(':nth-child(3) > :nth-child(2) > :nth-child(1) > .flex')
    tunedServiceStatusContainer.find('svg').should('exist').should('have.class', 'fill-jungle-green-500')
  });


  it('should show compliant saptune details', () => {
    cy.loadScenario('host-vmhdbdev01-saptune-compliant');

    const versionContainer = cy.get('.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(3)')
    versionContainer.should('contain', 'Tuning').should('contain', 'Compliant');

    const saptuneServiceStatusContainer = cy.get('.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(5)')

    saptuneServiceStatusContainer.should('contain','saptune.service').should('contain', 'enabled/active')
    saptuneServiceStatusContainer.should('contain', 'sapconf.service').should('contain', '-');
    saptuneServiceStatusContainer.should('contain', 'tuned.service').should('contain', '-');
    saptuneServiceStatusContainer.should('contain', 'saptune.service').find('svg').should('exist').should('have.class', 'fill-yellow-500')


    const saptuneTuningSolutionsContainer = cy.get('.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(7)')
    saptuneTuningSolutionsContainer.should('contain', 'Enabled Solution').should('contain','NETWEAVER (941735, 1771258, 2578899, 2993054, 1656250, 900929)');
    saptuneTuningSolutionsContainer.should('contain', 'Applied Solution').should('contain','NETWEAVER (941735, 1771258, 2578899, 2993054, 1656250, 900929)');

    const saptuneTuningNotesContainer= cy.get('.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(9)')

    saptuneTuningNotesContainer.should('contain', 'Enabled Notes').should('contain', '941735, 1771258, 2578899, 2993054, 1656250, 900929');
    saptuneTuningNotesContainer.should('contain', 'Applied Notes').should('contain', '941735, 1771258, 2578899, 2993054, 1656250, 900929');
    
    const saptuneStagingStatusContainer=cy.get(':nth-child(11)')
    saptuneStagingStatusContainer.should('contain', 'Staging').should('contain', 'Disabled');
    saptuneStagingStatusContainer.should('contain', 'Staged Notes').should('contain', '-');
    saptuneStagingStatusContainer.should('contain', 'Staged Solutions').should('contain', '-');
  });
});
