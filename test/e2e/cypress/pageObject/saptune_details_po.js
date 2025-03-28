export * from './base_po.js';
import * as basePage from './base_po.js';

// Test data

import { saptuneDetailsData } from '../fixtures/saptune-details/saptune_details_data';

const { hostname, hostID, packageVersion, configuredVersion } =
  saptuneDetailsData;

// Selectors
const notFoundContainerSelector = 'div[class="py-4"]';
const versionContainerSelector =
  '.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(3)';
const saptuneServiceStatusSelector =
  '.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(5)';
const saptuneTuningSolutionsSelector =
  '.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(7)';
const saptuneTuningNotesSelector =
  '.max-w-7xl > :nth-child(1) > :nth-child(1) > :nth-child(9)';
const saptuneStagingStatusSelector = ':nth-child(11)';

// UI Interactions

export const visit = () => basePage.visit(`hosts/${hostID}/saptune`);

// UI Validations
export const saptuneNotFoundLabelIsDisplayed = () =>
  cy
    .get(notFoundContainerSelector)
    .should('have.text', 'Saptune Details Not Found');

// API
export const loadSaptuneUnsupportedScenario = () =>
  basePage.loadScenario(`host-${hostname}-saptune-unsupported`);
