import * as checksCatalogPage from '../pageObject/checks-catalog-po.js';

describe('Checks catalog', () => {
  beforeEach(() => {
    checksCatalogPage.interceptChecksCatalogEndpoint();
    checksCatalogPage.visit();
    checksCatalogPage.validateUrl('/catalog');
    checksCatalogPage.waitForChecksCatalogRequest();
  });

  describe('Checks catalog should be available', () => {
    it('should show 3 check groups in the catalog', () => {
      checksCatalogPage.expectedCheckGroupsAreDisplayed();
    });

    it('should have only the first group expanded', () => {
      checksCatalogPage.onlyFirstCheckGroupIsExpanded();
    });
  });

  describe('Checks grouping and identification is correct', () => {
    it(`should include expected groups [${checksCatalogPage.getCheckGroupsNames()}]`, () => {
      checksCatalogPage.expectedCheckGroupsAreDisplayed();
    });

    it(`should expand all groups [${checksCatalogPage.getCheckGroupsNames()}]`, () => {
      checksCatalogPage.eachGroupShouldBeExpanded();
    });

    it(`should include expected check id's`, () => {
      checksCatalogPage.eachGroupHasExpectedCheckIds();
    });

    it('should include the correct number of icons for each target type', () => {
      checksCatalogPage.expandAllGroups();
      checksCatalogPage.expectedTargetTypeClusterIconsAreDisplayed();
      checksCatalogPage.expectedTargetTypeHostIconsAreDisplayed();
    });
  });

  describe('Individual checks data is expanded', () => {
    it('should expand check data when clicked', () => {
      checksCatalogPage.checkPanelIsNotVisible();
      checksCatalogPage.clickFirstCheckRow();
      checksCatalogPage.checkPanelHasTheExpectedText();
    });
  });

  describe('Filtering', () => {
    it('expected query is issued for AWS provider', () => {
      const expectedRequestQuery = 'provider=aws';

      checksCatalogPage
        .selectFromProvidersDropdown('AWS')
        .then((endpointUrl) =>
          expect(endpointUrl).to.include(expectedRequestQuery)
        );
    });

    it('expected query is issued for AWS provider & Cluster Target Type', () => {
      const expectedRequestQuery = 'provider=aws&target_type=cluster';

      checksCatalogPage.selectFromProvidersDropdown('AWS');
      checksCatalogPage
        .selectFromTargetsSelectionDropdown('Clusters')
        .then((endpointUrl) =>
          expect(endpointUrl).to.include(expectedRequestQuery)
        );
    });

    it('expected query is issued for AWS provider & Cluster Target Type & HANA Scale Up Perf. Opt.', () => {
      const expectedRequestQuery =
        'provider=aws&target_type=cluster&cluster_type=hana_scale_up&hana_scenario=performance_optimized';

      checksCatalogPage.selectFromProvidersDropdown('AWS');
      checksCatalogPage.selectFromTargetsSelectionDropdown('Clusters');
      checksCatalogPage
        .selectFromClusterTypesSelectionDropdown('HANA Scale Up Perf. Opt.')
        .then((endpointUrl) =>
          expect(endpointUrl).to.include(expectedRequestQuery)
        );
    });

    it('expected query is issued for AWS provider & Cluster Target Type & HANA Scale Up Cost Opt.', () => {
      const expectedRequestQuery =
        'provider=aws&target_type=cluster&cluster_type=hana_scale_up&hana_scenario=cost_optimized';

      checksCatalogPage.selectFromProvidersDropdown('AWS');
      checksCatalogPage.selectFromTargetsSelectionDropdown('Clusters');
      checksCatalogPage
        .selectFromClusterTypesSelectionDropdown('HANA Scale Up Cost Opt.')
        .then((endpointUrl) =>
          expect(endpointUrl).to.include(expectedRequestQuery)
        );
    });
  });

  describe('Catalog error', () => {
    it('should show an error notification if the catalog cannot be obtained', () => {
      checksCatalogPage.interceptChecksCatalogEndpointWithError();
      checksCatalogPage.refresh();
      checksCatalogPage.networkErrorLabelIsDisplayed();
      checksCatalogPage.tryAgainButtonIsDisplayed();
    });
  });
});
