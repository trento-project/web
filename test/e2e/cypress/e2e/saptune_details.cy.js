describe('Saptune Details page', () => {
  beforeEach(() => {
    cy.visit('/hosts/13e8c25c-3180-5a9a-95c8-51ec38e50cfc/saptune');
  });

  const notFoundContainerSelector = '.pb-24';
  const versionContainerSelector =
    '.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(3)';
  const tuningStatusIcon = ':nth-child(3) > :nth-child(2) > :nth-child(1)';
  const saptuneServiceStatusSelector =
    '.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(5)';
  const saptuneServiceStatusIcon =
    '.grid-flow-col > :nth-child(1) > :nth-child(2) > :nth-child(1) > .flex';
  const sapconfServiceStatusIcon =
    '.grid-flow-col > :nth-child(2) > :nth-child(2) > :nth-child(1) > .flex';
  const tunedServiceStatusIcon =
    ':nth-child(3) > :nth-child(2) > :nth-child(1) > .flex';
  const saptuneTuningSolutionsSelector =
    '.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(7)';
  const saptuneTuningNotesSelector =
    '.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(9)';
  const saptuneStagingStatusSelector = ':nth-child(11)';

  it('should render default not found if saptune payload status is null', () => {
    cy.loadScenario('host-vmhdbdev01-saptune-unsupported');
    cy.get(notFoundContainerSelector).should(
      'contain',
      'Saptune Details Not Found'
    );
  });

  it('should render default not found if saptune payload is not installed', () => {
    cy.loadScenario('host-vmhdbdev01-saptune-uninstalled');
    cy.get(notFoundContainerSelector).should(
      'contain',
      'Saptune Details Not Found'
    );
  });

  it('should render versions list view when saptune is not tuning correctly', () => {
    cy.loadScenario('host-vmhdbdev01-saptune-not-tuned');
    cy.get(versionContainerSelector)
      .should('contain', 'Package')
      .should('contain', '3.1.0')
      .should('contain', 'Configured Version')
      .should('contain', '3')
      .should('contain', 'Tuning')
      .should('contain', 'No tuning');
    cy.get(`${tuningStatusIcon} svg`)
      .should('exist')
      .should('have.class', 'fill-yellow-500');
  });

  it('should render each part of saptune service status with green passing icons', () => {
    cy.loadScenario('host-vmhdbdev01-saptune-service-status_passing');
    cy.get(saptuneServiceStatusSelector)
      .should('contain', 'saptune.service')
      .should('contain', 'enabled/active')
      .should('contain', 'sapconf.service')
      .should('contain', 'disabled/inactive')
      .should('contain', 'tuned.service')
      .should('contain', 'disabled/inactive');
    cy.get(`${saptuneServiceStatusIcon} svg`)
      .should('exist')
      .should('have.class', 'fill-jungle-green-500');
    cy.get(`${sapconfServiceStatusIcon} svg`)
      .should('exist')
      .should('have.class', 'fill-jungle-green-500');
    cy.get(`${tunedServiceStatusIcon} svg`)
      .should('exist')
      .should('have.class', 'fill-jungle-green-500');
  });

  it('should render correctly', () => {
    cy.loadScenario('host-vmhdbdev01-saptune-compliant');
    cy.get(versionContainerSelector)
      .should('contain', 'Tuning')
      .should('contain', 'Compliant');
    cy.get(saptuneServiceStatusSelector)
      .should('contain', 'saptune.service')
      .should('contain', 'enabled/inactive')
      .should('contain', 'sapconf.service')
      .should('contain', '-')
      .should('contain', 'tuned.service')
      .should('contain', '-');
    cy.get(`${saptuneServiceStatusIcon} svg`)
      .should('exist')
      .should('have.class', 'fill-yellow-500');
    cy.get(saptuneTuningSolutionsSelector)
      .should('contain', 'Enabled Solution')
      .should(
        'contain',
        'NETWEAVER (941735, 1771258, 2578899, 2993054, 1656250, 900929)'
      )
      .should('contain', 'Applied Solution')
      .should(
        'contain',
        'NETWEAVER (941735, 1771258, 2578899, 2993054, 1656250, 900929)'
      );
    cy.get(saptuneTuningNotesSelector)
      .should('contain', 'Enabled Notes')
      .should('contain', '941735, 1771258, 2578899, 2993054, 1656250, 900929')
      .should('contain', 'Applied Notes')
      .should('contain', '941735, 1771258, 2578899, 2993054, 1656250, 900929');
    cy.get(saptuneStagingStatusSelector)
      .should('contain', 'Staging')
      .should('contain', 'Disabled')
      .should('contain', 'Staged Notes')
      .should('contain', '-')
      .should('contain', 'Staged Solutions')
      .should('contain', '-');
  });
});
