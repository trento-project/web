export * from './base_po.js';
import * as basePage from './base_po.js';

// Test data
import { saptuneDetailsData } from '../fixtures/saptune-details/saptune_details_data';

const { hostname, hostID, packageVersion, configuredVersion } =
  saptuneDetailsData;

const { saptuneServiceStatus, sapconfServiceStatus, tunedServiceStatus } =
  saptuneDetailsData;

const {
  appliedNotes,
  appliedSolutions,
  enabledNotes,
  enabledSolutions,
  stagingState,
  stagingNotes,
  stagingSolution,
} = saptuneDetailsData;

// Selectors
const notFoundContainer = 'div[class="py-4"]';
const saptunePackageVersion = 'div:contains("Package") + div span span';
const saptuneConfiguredVersion =
  'div div[class*="bold"]:contains("Configured Version") + div span';
const saptuneTuningStatus = 'div:contains("Tuning") + div svg + span';
const saptuneService =
  'div[class*="bold"]:contains("saptune.service") + div svg + span';
const sapConf =
  'div[class*="bold"]:contains("sapconf.service") + div svg + span';
const tunedService =
  'div[class*="bold"]:contains("tuned.service") + div svg + span';
const enabledSolutionSelector =
  'div div[class*="bold"]:contains("Enabled Solution") + div span span';
const saptuneAppliedSolution =
  'div div[class*="bold"]:contains("Applied Solution") + div span span';
const saptuneEnabledNotes =
  'div div[class*="bold"]:contains("Enabled Notes") + div span';
const saptuneAppliedNotes =
  'div div[class*="bold"]:contains("Applied Notes") + div span';
const saptuneStagingState =
  'div div[class*="bold"]:contains("Staging") + div span span';
const saptuneStagingNotes =
  'div div[class*="bold"]:contains("Staged Notes") + div span span';
const saptuneStagingSolution =
  'div div[class*="bold"]:contains("Staged Solution") + div span span';

// UI Interactions
export const visit = () => basePage.visit(`hosts/${hostID}/saptune`);

// UI Validations
export const saptuneNotFoundLabelIsDisplayed = () =>
  cy.get(notFoundContainer).should('have.text', 'Saptune Details Not Found');

export const hasExpectedPackageVersion = () =>
  cy.get(saptunePackageVersion).should('have.text', packageVersion);

export const hasExpectedConfiguredVersion = () =>
  cy.get(saptuneConfiguredVersion).should('have.text', configuredVersion);

export const hasExpectedTuning = () =>
  cy.get(saptuneTuningStatus).should('have.text', 'No tuning');

export const hasExpectedServiceStatus = () =>
  cy.get(saptuneService).should('have.text', saptuneServiceStatus);

export const hasExpectedSapConf = () =>
  cy.get(sapConf).should('have.text', sapconfServiceStatus);

export const hasExpectedTunedService = () =>
  cy.get(tunedService).should('have.text', tunedServiceStatus);

export const hasExpectedEnabledSolution = () =>
  cy.get(enabledSolutionSelector).should('have.text', enabledSolutions);

export const hasExpectedAppliedSolution = () =>
  cy.get(saptuneAppliedSolution).should('have.text', appliedSolutions);

export const hasExpectedEnabledNotes = () =>
  cy.get(saptuneEnabledNotes).should('have.text', enabledNotes);

export const hasExpectedAppliedNotes = () =>
  cy.get(saptuneAppliedNotes).should('have.text', appliedNotes);

export const hasExpectedStagingState = () =>
  cy.get(saptuneStagingState).should('have.text', stagingState);

export const hasExpectedStagingNotes = () =>
  cy.get(saptuneStagingNotes).should('have.text', stagingNotes);

export const hasExpectedStagingSolution = () =>
  cy.get(saptuneStagingSolution).should('have.text', stagingSolution);

// API
export const loadSaptuneUnsupportedScenario = () =>
  basePage.loadScenario(`host-${hostname}-saptune-unsupported`);

export const loadSaptuneUninstalledScenario = () =>
  basePage.loadScenario(`host-${hostname}-saptune-uninstalled`);

export const loadSaptuneNotTunedScenario = () =>
  basePage.loadScenario(`host-${hostname}-saptune-not-tuned`);

export const loadSaptunePassingScenario = () =>
  basePage.loadScenario(`host-${hostname}-saptune-service-status-passing`);

export const loadSaptuneCompliantScenario = () =>
  basePage.loadScenario(`host-${hostname}-saptune-compliant`);
