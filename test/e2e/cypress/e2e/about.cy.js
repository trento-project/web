import * as aboutPage from '../pageObject/about_po';

describe('User account page', () => {
  before(() => {
    aboutPage.preloadTestData();
  });

  beforeEach(() => {
    aboutPage.visit();
    aboutPage.validateUrl('/about');
  });

  it('should have the correct page title', () => {
    aboutPage.pageTitleIsDisplayed();
  });

  it('should show the correct server version', () => {
    aboutPage.expectedServerVersionIsDisplayed();
  });

  it('should show the github project link', () => {
    aboutPage.expectedGithubUrlIsDisplayed();
  });

  it('should display number of SLES subscriptions found', () => {
    aboutPage.expectedSlesForSapSubscriptionsAreDisplayed();
  });
});
