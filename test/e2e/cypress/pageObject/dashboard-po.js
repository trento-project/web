import BasePage from './base-po.js';

export default class DashboardPage extends BasePage {
  constructor() {
    super();
  }

  dashboardPageIsDisplayed() {
    this.pageTitleIsCorrectlyDisplayed('At a glance');
  }
}
