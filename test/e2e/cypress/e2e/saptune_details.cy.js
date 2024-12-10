import { saptuneDetailsData } from '../fixtures/saptune-details/saptune_details_data';

describe('Saptune Details page', () => {
  const { hostname, hostID, packageVersion, configuredVersion } =
    saptuneDetailsData;

  const notFoundContainerSelector = '.pb-24';
  const versionContainerSelector =
    '.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(3)';
  const saptuneServiceStatusSelector =
    '.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(5)';
  const saptuneTuningSolutionsSelector =
    '.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(7)';
  const saptuneTuningNotesSelector =
    '.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(9)';
  const saptuneStagingStatusSelector = ':nth-child(11)';

  before(() => {
    cy.loadScenario('healthy-29-node-SAP-cluster');
    cy.visit(`hosts/${hostID}/saptune`);
  });

  it('should render saptune details not found if saptune version is unsupported', () => {
    cy.loadScenario(`host-${hostname}-saptune-unsupported`);
    cy.get(notFoundContainerSelector).should(
      'contain',
      'Saptune Details Not Found'
    );
  });

  it('should render details not found if saptune is not installed', () => {
    cy.loadScenario(`host-${hostname}-saptune-uninstalled`);
    cy.get(notFoundContainerSelector).should(
      'contain',
      'Saptune Details Not Found'
    );
  });

  it('should render versions list view when saptune is not tuning correctly', () => {
    cy.loadScenario(`host-${hostname}-saptune-not-tuned`);

    cy.get(versionContainerSelector)
      .contains('Package')
      .next()
      .should('contain', packageVersion);

    cy.get(versionContainerSelector)
      .contains('Configured Version')
      .next()
      .should('contain', configuredVersion);

    cy.get(versionContainerSelector)
      .contains('Tuning')
      .next()
      .should('contain', 'No tuning');
  });

  it('should render each part of saptune services status with correct content', () => {
    cy.loadScenario(`host-${hostname}-saptune-service-status-passing`);
    const { saptuneServiceStatus, sapconfServiceStatus, tunedServiceStatus } =
      saptuneDetailsData;
    cy.get(saptuneServiceStatusSelector)
      .contains('saptune.service')
      .next()
      .should('contain', saptuneServiceStatus);
    cy.get(saptuneServiceStatusSelector)
      .contains('sapconf.service')
      .next()
      .should('contain', sapconfServiceStatus);
    cy.get(saptuneServiceStatusSelector)
      .contains('tuned.service')
      .next()
      .should('contain', tunedServiceStatus);
  });

  it('should render correctly a tuned system', () => {
    cy.loadScenario(`host-${hostname}-saptune-compliant`);
    const {
      appliedNotes,
      appliedSolutions,
      enabledNotes,
      enabledSolutions,
      stagingState,
      stagingNotes,
      stagingSolution,
    } = saptuneDetailsData;
    cy.get(saptuneTuningSolutionsSelector)
      .contains('Enabled Solution')
      .next()
      .should('contain', enabledSolutions);
    cy.get(saptuneTuningSolutionsSelector)
      .contains('Applied Solution')
      .next()
      .should('contain', appliedSolutions);
    cy.get(saptuneTuningNotesSelector)
      .contains('Enabled Notes')
      .next()
      .should('contain', enabledNotes);
    cy.get(saptuneTuningNotesSelector)
      .contains('Applied Notes')
      .next()
      .should('contain', appliedNotes);
    cy.get(saptuneStagingStatusSelector)
      .contains('Staging')
      .next()
      .should('contain', stagingState);
    cy.get(saptuneStagingStatusSelector)
      .contains('Staged Notes')
      .next()
      .should('contain', stagingNotes);
    cy.get(saptuneStagingStatusSelector)
      .contains('Staged Solutions')
      .next()
      .should('contain', stagingSolution);
  });
});
