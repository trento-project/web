import * as hanaClusterDetailsPage from '../pageObject/hana_cluster_details_po';

context('HANA scale-up checks', () => {
  const realEnvClusterID = 'd2522281-2c76-52dc-8500-10bdf2cc6664';
  const testEnvClusterID = '7965f822-0254-5858-abca-f6e8b4c27714';

  const clusterID = Cypress.env('REAL_CLUSTER_TESTS')
    ? realEnvClusterID
    : testEnvClusterID;

  const PASSING = 'fill-jungle-green-500';
  const WARNING = 'fill-yellow-500';
  const CRITICAL = 'fill-red-500';

  const realEnvExpectedCheckResults = [
    ['00081D', PASSING],
    ['156F64', PASSING],
    ['15F7A8', PASSING],
    ['21FCA6', PASSING],
    ['24ABCB', PASSING],
    ['32CFC6', WARNING],
    ['33403D', PASSING],
    ['53D035', PASSING],
    ['6E9B82', PASSING],
    ['7E0221', PASSING],
    ['822E47', PASSING],
    ['845CC9', PASSING],
    ['A1244C', PASSING],
    ['C620DC', PASSING],
    ['D78671', PASSING],
    ['DA114A', WARNING],
    ['FB0E0D', PASSING],
    ['205AF7', PASSING],
    ['373DB8', CRITICAL],
    ['790926', WARNING],
    ['9FAAD0', PASSING],
    ['9FEFB0', PASSING],
    ['CAEFF1', PASSING],
    ['D028B9', PASSING],
    ['DC5429', PASSING],
    ['F50AF5', PASSING],
  ];

  const demoEnvExpectedChecksResults = [
    ['DE74B2', CRITICAL],
    ['6E0DEC', CRITICAL],
    ['A1244C', PASSING],
    ['C620DC', CRITICAL],
    ['24ABCB', PASSING],
    ['845CC9', PASSING],
    ['21FCA6', PASSING],
    ['156F64', PASSING],
    ['33403D', PASSING],
    ['6E9B82', CRITICAL],
    ['DA114A', PASSING],
    ['822E47', PASSING],
    ['15F7A8', PASSING],
    ['7E0221', PASSING],
    ['FB0E0D', PASSING],
    ['00081D', PASSING],
    ['32CFC6', PASSING],
    ['53D035', PASSING],
    ['D78671', CRITICAL],
    ['BA215C', PASSING],
    ['438525', WARNING],
    ['790926', PASSING],
    ['DC5429', PASSING],
    ['DF8328', CRITICAL],
    ['82A031', CRITICAL],
    ['BC9DF9', CRITICAL],
    ['0B0F87', CRITICAL],
    ['53D33E', CRITICAL],
    ['CAEFF1', PASSING],
    ['D028B9', PASSING],
    ['9FAAD0', PASSING],
    ['9FEFB0', PASSING],
    ['F50AF5', PASSING],
    ['ABA3CA', CRITICAL],
    ['31BDCB', CRITICAL],
    ['C3166E', PASSING],
    ['222A57', PASSING],
    ['373DB8', CRITICAL],
    ['205AF7', PASSING],
    ['B3DA7E', CRITICAL],
    ['481552', WARNING],
    ['61451E', WARNING],
    ['68626E', PASSING],
    ['816815', CRITICAL],
    ['B089BE', CRITICAL],
    ['0B6DB2', PASSING],
    ['49591F', PASSING],
    ['3A59DC', CRITICAL],
    ['3A9890', WARNING],
    ['3AA381', CRITICAL],
    ['3AD734', CRITICAL],
  ];

  const expectedCheckResults = Cypress.env('REAL_CLUSTER_TESTS')
    ? realEnvExpectedCheckResults
    : demoEnvExpectedChecksResults;

  before(() => {
    hanaClusterDetailsPage.preloadTestData();
    hanaClusterDetailsPage.visit(clusterID, false);
  });

  describe('Run checks', () => {
    it('should run checks with expected results', () => {
      hanaClusterDetailsPage.clickCheckSelectionButton();
      hanaClusterDetailsPage.clickAllUncheckedCategorySwitches();
      hanaClusterDetailsPage.clickSaveChecksSelectionButton();
      hanaClusterDetailsPage.clickStartExecutionButtonWithoutForce();
      hanaClusterDetailsPage.validateExpectedCheckResults(expectedCheckResults);
    });
  });
});
