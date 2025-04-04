import * as hostDetailsPage from '../pageObject/host_details_po.js';

context('SUSE Manager overviews', () => {
  before(() => hostDetailsPage.preloadTestData());

  beforeEach(() => {
    hostDetailsPage.clearSUMASettings();
    hostDetailsPage.saveSUMASettingsForAdmin();
  });

  describe('navigates and display SUSE Manager based infos', () => {
    it('host is found on SUSE Manager and has vulnerabilities', () => {
      hostDetailsPage.visitVmdrbddev01Host();
      hostDetailsPage.expectedRelevantPatchesAreDisplayed(' 2');

      hostDetailsPage.clickRelevantPatches();

      hostDetailsPage.expectedHostIsDisplayedInTitle();
      hostDetailsPage.expectedSynopsisText1IsDisplayed();
      hostDetailsPage.expectedSynopsisText1IsDisplayed();

      hostDetailsPage.clickBackToHostDetailsButton();

      hostDetailsPage.upgradablePackagesAmountIsTheExpected(2);
      hostDetailsPage.clickUpgradablePackagesCard();

      hostDetailsPage.elixirLatestPackageIsTheExpected();

      hostDetailsPage.expectedRelatedPackageIsDisplayed();
      hostDetailsPage.clickFirstRelatedPackage();

      hostDetailsPage.expectedSynopsisSecurityUpdateIsDisplayed();

      hostDetailsPage.synopsisIssuedDateIsTheExpected();
      hostDetailsPage.synopsisStatusLabelIsTheExpected();
      hostDetailsPage.synopsisRebootRequiredLabelIsTheExpected();
      hostDetailsPage.affectsPkgMaintenanceLabelIsTheExpected();

      hostDetailsPage.advisoryDetailsShowsExpectedDescription();
      hostDetailsPage.advisoryDetailsShowsExpectedFixes();
      hostDetailsPage.advisoryDetailsCVEsAreTheExpected();
      hostDetailsPage.advisoryDetailsAffectedPackageIsTheExpected();
      hostDetailsPage.advisoryDetailsAffectedSystemsAreTheExpected();
    });

    it('host is not found on SUSE Manager', () => {
      hostDetailsPage.visitVmdrbddev02Host();
      hostDetailsPage.expectedRelevantPatchesAreDisplayed(
        ' Host not found in SUSE Manager'
      );
      hostDetailsPage.upgradablePackagesAmountIsTheExpected(
        ' Host not found in SUSE Manager'
      );
    });
  });
});
