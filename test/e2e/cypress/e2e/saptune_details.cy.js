import * as saptuneDetailsPage from '../pageObject/saptune_details_po';

describe('Saptune Details page', () => {
  before(() => {
    saptuneDetailsPage.preloadTestData();
    saptuneDetailsPage.visit();
  });

  it('should render saptune details not found if saptune version is unsupported', () => {
    saptuneDetailsPage.loadSaptuneUnsupportedScenario();
    saptuneDetailsPage.saptuneNotFoundLabelIsDisplayed();
  });

  it('should render details not found if saptune is not installed', () => {
    saptuneDetailsPage.loadSaptuneUninstalledScenario();
    saptuneDetailsPage.saptuneNotFoundLabelIsDisplayed();
  });

  it('should render versions list view when saptune is not tuning correctly', () => {
    saptuneDetailsPage.loadSaptuneNotTunedScenario();
    saptuneDetailsPage.hasExpectedPackageVersion();
    saptuneDetailsPage.hasExpectedConfiguredVersion();
    saptuneDetailsPage.hasExpectedTuning();
  });

  it('should render each part of saptune services status with correct content', () => {
    saptuneDetailsPage.loadSaptunePassingScenario();
    saptuneDetailsPage.hasExpectedServiceStatus();
    saptuneDetailsPage.hasExpectedSapConf();
    saptuneDetailsPage.hasExpectedTunedService();
  });

  it('should render correctly a tuned system', () => {
    saptuneDetailsPage.loadSaptuneCompliantScenario();
    saptuneDetailsPage.hasExpectedEnabledSolution();
    saptuneDetailsPage.hasExpectedAppliedSolution();
    saptuneDetailsPage.hasExpectedEnabledNotes();
    saptuneDetailsPage.hasExpectedAppliedNotes();
    saptuneDetailsPage.hasExpectedStagingState();
    saptuneDetailsPage.hasExpectedStagingNotes();
    saptuneDetailsPage.hasExpectedStagingSolution();
  });
});
