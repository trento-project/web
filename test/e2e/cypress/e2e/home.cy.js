import * as homePage from '../pageObject/home-po.js';

context('Homepage', () => {
  before(() => homePage.preloadTestData());

  beforeEach(() => {
    homePage.visit();
    homePage.validateUrl();
  });

  describe('Deregistration', () => {
    it('should not display SAP System NWP after it is deregistered', () => {
      homePage.nwpSystemShouldBeDisplayed();
      homePage.apiDeregisterSapSystemNwpHost();
      homePage.nwpSystemShouldNotBeDisplayed();
    });
  });
});
