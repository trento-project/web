export * from './base-po.js';
import * as basePage from './base-po.js';

export const dashboardPageIsDisplayed = () => {
  basePage.pageTitleIsCorrectlyDisplayed('At a glance');
};
