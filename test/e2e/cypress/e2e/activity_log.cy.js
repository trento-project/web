import * as activityLogPage from '../pageObject/activity_log_po';
import * as basePage from '../pageObject/base_po';

const defaultSeverity = 'severity=info&severity=warning&severity=critical';

context('Activity Log page', () => {
  before(() => activityLogPage.preloadTestData());
  beforeEach(() => activityLogPage.interceptActivityLogEndpoint());

  describe('Navigation', () => {
    it('should navigate to Activity Log page', () => {
      basePage.visit();
      basePage.clickActivityLogNavigationItem();
      activityLogPage.validateUrl(`/activity_log?${defaultSeverity}`);
      activityLogPage.pageTitleIsCorrectlyDisplayed('Activity Log');
      activityLogPage.activityLogEndpointIsCalledOnlyOnce();
    });

    it('should not load the page twice', () => {
      basePage.visit();
      basePage.clickActivityLogNavigationItem5Times();
      activityLogPage.activityLogEndpointIsCalledOnlyOnce();
    });

    it('should reset querystring when reloading the page from navigation menu', () => {
      const queryString =
        '?search=foo+bar&from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&refreshRate=5000';
      activityLogPage.visit(queryString);
      activityLogPage.refreshRateFilterHasTheExpectedValue('5s');
      activityLogPage.filteredActionsAreTheExpectedOnes(
        'Login Attempt, Tag Added'
      );
      basePage.clickActivityLogNavigationItem();
      activityLogPage.refreshRateFilterHasTheExpectedValue('Off');
      activityLogPage.filterTypeHasNothingSelected();
      activityLogPage.validateUrl(`/activity_log?${defaultSeverity}`);
    });
  });

  describe('Filtering', () => {
    it('should render without selected filters', () => {
      activityLogPage.visit();
      activityLogPage.filterTypeHasNothingSelected();
      activityLogPage.filterOlderThanHasNothingSelected();
      activityLogPage.filterNewerThanHasNothingSelected();
      activityLogPage.metadataSearchHasTheExpectedPlaceholder();
      activityLogPage.activityLogRequestHasExpectedStatusCode(200);
    });

    it('should render with selected filters from querystring', () => {
      const toDate = '2024-08-13T10%3A21%3A00.000Z';
      const fromDate = '2024-08-14T10%3A21%3A00.000Z';

      const queryString = `?search=foo+bar&from_date=custom&from_date=${fromDate}&to_date=custom&to_date=${toDate}&type=login_attempt&type=resource_tagging`;
      activityLogPage.visit(queryString);
      activityLogPage.filteredActionsAreTheExpectedOnes(
        'Login Attempt, Tag Added'
      );
      activityLogPage.filterNewerThanHasTheExpectedValue(toDate);
      activityLogPage.filterOlderThanHasTheExpectedValue(fromDate);

      activityLogPage.metadataSearchHasTheExpectedValue('foo bar');
      activityLogPage.activityLogRequestHasExpectedStatusCode(200);
    });

    it('should update querystring when filters are selected', () => {
      const toDate = '2024-08-13T10:21';
      const fromDate = '2024-08-14T10:21';

      activityLogPage.visit(`?${defaultSeverity}`);

      activityLogPage.clickFilterOlderThanButton();
      activityLogPage.typeFilterOlderThanInputField(fromDate);

      activityLogPage.clickFilterNewerThanButton();
      activityLogPage.typeFilterNewerThanInputField(toDate);

      activityLogPage.clickFilterTypeButton();
      activityLogPage.selectFilterTypeOption('Login Attempt');
      activityLogPage.selectFilterTypeOption('Tag Added');

      activityLogPage.typeMetadataFilter('foo bar');
      activityLogPage.clickApplyFiltersButton();

      const toDateQueryString =
        activityLogPage.formatEncodedDateForQueryString(toDate);
      const fromDateQueryString =
        activityLogPage.formatEncodedDateForQueryString(fromDate);

      const expectedUrl = `/activity_log?${defaultSeverity}&from_date=custom&from_date=${fromDateQueryString}&to_date=custom&to_date=${toDateQueryString}&type=login_attempt&type=resource_tagging&search=foo+bar&first=20`;
      activityLogPage.validateUrl(expectedUrl);
    });

    it('should reset filters', () => {
      const queryString = `?${defaultSeverity}&from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&search=foo+bar`;
      activityLogPage.visit(queryString);
      activityLogPage.clickResetFiltersButton();
      activityLogPage.filterTypeHasNothingSelected();
      activityLogPage.filterOlderThanHasNothingSelected();
      activityLogPage.filterNewerThanHasNothingSelected();
      activityLogPage.metadataSearchHasTheExpectedPlaceholder();
      activityLogPage.activityLogRequestHasExpectedStatusCode(200);
    });

    it('should refresh content based on currently applied filters', () => {
      const queryString = `?${defaultSeverity}&from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&search=foo+bar`;
      activityLogPage.visit(queryString);
      activityLogPage.waitForActivityLogRequest();
      activityLogPage.clickRefreshButton();
      activityLogPage.waitForActivityLogRequest();
      activityLogPage.validateUrl(`/activity_log${queryString}`);
    });
  });

  describe('Pagination', () => {
    it('should paginate data', () => {
      activityLogPage.visit(`?${defaultSeverity}`);
      activityLogPage.waitForActivityLogRequest().then(({ response }) => {
        activityLogPage.paginationPropertiesAreTheExpected(response);
        activityLogPage.validateUrl(`/activity_log?${defaultSeverity}`);
        activityLogPage.clickNextPageButton();
        activityLogPage.activityLogRequestHasExpectedStatusCode(200);
        const expectedUrl = `/activity_log?first=20&after=${response.body.pagination.end_cursor}&${defaultSeverity}`;
        activityLogPage.validateUrl(expectedUrl);
      });
    });

    it('should paginate data with filters', () => {
      const queryString =
        '?type=sles_subscriptions_updated&search=x86_64&severity=debug';
      activityLogPage.visit(queryString);
      activityLogPage.waitForActivityLogRequest().then(({ response }) => {
        activityLogPage.paginationPropertiesAreTheExpected(response);
        let expectedUrl = `/activity_log?type=sles_subscriptions_updated&search=x86_64&severity=debug`;
        activityLogPage.validateUrl(expectedUrl);
        activityLogPage.clickNextPageButton();
        activityLogPage.activityLogRequestHasExpectedStatusCode(200);
        expectedUrl = `/activity_log?first=20&after=${response.body.pagination.end_cursor}&type=sles_subscriptions_updated&search=x86_64&severity=debug`;
        activityLogPage.validateUrl(expectedUrl);
      });
    });

    it('should reset pagination when filters are changed', () => {
      activityLogPage.visit(`?${defaultSeverity}`);
      activityLogPage.waitForActivityLogRequest().then(({ response }) => {
        activityLogPage.paginationPropertiesAreTheExpected(response);
        let expectedUrl = `/activity_log?first=20&after=${response.body.pagination.end_cursor}&${defaultSeverity}`;
        activityLogPage.clickNextPageButton();
        activityLogPage.validateUrl(expectedUrl);
      });
      activityLogPage.clickFilterTypeButton();
      activityLogPage.selectFilterTypeOption('Login Attempt');
      activityLogPage.clickApplyFiltersButton();
      const expectedUrl = `/activity_log?${defaultSeverity}&type=login_attempt&first=20`;
      activityLogPage.validateUrl(expectedUrl);
    });

    it('should select correct date filter when changing page', () => {
      const toDate = '2024-08-14T10%3A21%3A00.000Z';
      const queryString = `?to_date=custom&to_date=${toDate}`;
      activityLogPage.visit(queryString);
      activityLogPage.filterNewerThanHasTheExpectedValue(toDate);
      activityLogPage.waitForActivityLogRequest().then(({ response }) => {
        activityLogPage.clickNextPageButton();
        activityLogPage.activityLogRequestHasExpectedStatusCode(200);
        activityLogPage.filterNewerThanHasTheExpectedValue(toDate);
        const expectedUrl = `/activity_log?first=20&after=${response.body.pagination.end_cursor}&to_date=custom&to_date=${toDate}`;
        activityLogPage.validateUrl(expectedUrl);
      });
    });

    it('should change items per page', () => {
      activityLogPage.visit();
      activityLogPage.validateResponsePagination(20);
      activityLogPage.selectPagination(50);
      activityLogPage.validateResponsePagination(50);
    });

    it('should persist items per page when changing page', () => {
      activityLogPage.visit();
      activityLogPage.validateResponsePagination(20);
      activityLogPage.selectPagination(10);
      activityLogPage.validateResponsePagination(10);
      activityLogPage.clickNextPageButton();
      activityLogPage.validateResponsePagination(10);
      activityLogPage.selectPaginationButtonHasTheExpectedValue(10);
    });

    it('should navigate backwards', () => {
      activityLogPage.visit();
      activityLogPage
        .waitForActivityLogRequest()
        .then(({ response: firstPageResponse }) => {
          activityLogPage.paginationPropertiesAreTheExpected(firstPageResponse);
          activityLogPage.clickNextPageButton();
          activityLogPage
            .waitForActivityLogRequest()
            .then(({ response: secondPageResponse }) => {
              activityLogPage.paginationPropertiesAreTheExpected(
                secondPageResponse
              );
              activityLogPage.clickPreviousPageButton();
              activityLogPage.responseMatchesFirstPageContent(
                firstPageResponse
              );
            });
        });
    });

    it('should go to first page', () => {
      const queryString = '?type=host_registered';
      activityLogPage.visit(queryString);
      activityLogPage.waitForActivityLogRequest();
      activityLogPage.clickNextPageButton();
      activityLogPage.waitForActivityLogRequest();
      activityLogPage.clickFirstPageButton();
      activityLogPage.waitForActivityLogRequest();
      const expectedUrl = '/activity_log?first=20&type=host_registered';
      activityLogPage.validateUrl(expectedUrl);
    });

    it('should go to last page', () => {
      const queryString = '?type=host_registered';
      activityLogPage.visit(queryString);
      activityLogPage.waitForActivityLogRequest();
      activityLogPage.clickLastPageButton();
      activityLogPage.waitForActivityLogRequest();
      const expectedUrl = '/activity_log?last=20&type=host_registered';
      activityLogPage.validateUrl(expectedUrl);
    });
  });

  describe('Autorefresh', () => {
    it('should have autorefresh turned off by default', () => {
      activityLogPage.visit();
      activityLogPage.autoRefreshIntervalButtonHasTheExpectedValue('Off');
    });

    it('should allow changing autorefresh interval only on first page', () => {
      activityLogPage.visit();
      activityLogPage.waitForActivityLogRequest();
      activityLogPage.autoRefreshButtonIsEnabled();

      activityLogPage.clickNextPageButton();
      activityLogPage.waitForActivityLogRequest();
      activityLogPage.autoRefreshIntervalButtonIsDisabled();

      activityLogPage.clickNextPageButton();
      activityLogPage.waitForActivityLogRequest();
      activityLogPage.autoRefreshIntervalButtonIsDisabled();

      activityLogPage.clickFirstPageButton();
      activityLogPage.waitForActivityLogRequest();
      activityLogPage.autoRefreshButtonIsEnabled();
    });

    it('should ignore refresh rate query string param in API call', () => {
      const refreshRateQueryString = '&refreshRate=5000';
      const queryString = `?search=foo+bar&from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging${refreshRateQueryString}`;
      activityLogPage.visit(queryString);
      activityLogPage.apiCallDoesNotContainRefreshRate(refreshRateQueryString);
      activityLogPage.autoRefreshIntervalButtonHasTheExpectedValue('5s');
    });

    it('should ignore an invalid refresh rate in query string param', () => {
      const queryString =
        '?search=foo+bar&from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&refreshRate=00Invalid';
      activityLogPage.visit(queryString);
      activityLogPage.autoRefreshIntervalButtonHasTheExpectedValue('Off');
    });

    it('should not reset refresh rate when resetting filters', () => {
      const queryString =
        '?from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&search=foo+bar&refreshRate=10000';
      activityLogPage.visit(queryString);
      activityLogPage.autoRefreshIntervalButtonHasTheExpectedValue('10s');
      activityLogPage.clickResetFiltersButton();
      activityLogPage.autoRefreshIntervalButtonHasTheExpectedValue('10s');
      const expectedUrl = `/activity_log?${defaultSeverity}&first=20&refreshRate=10000`;
      activityLogPage.validateUrl(expectedUrl);
    });

    // eslint-disable-next-line mocha/no-exclusive-tests
    it.only('should change refresh rate', () => {
      activityLogPage.visit();
      activityLogPage.expectedRefreshRatesAreAvailable();
      const changingRefreshRateScenarios =
        activityLogPage.buildChangingRefreshRateScenarios();

      changingRefreshRateScenarios.forEach(
        ({ currentRefreshRate, expectedRefreshRate }) => {
          activityLogPage.autoRefreshIntervalButtonHasTheExpectedValue(
            currentRefreshRate
          );
          activityLogPage.selectNextRefreshRate();
          const expectedUrl = `/activity_log${
            expectedRefreshRate ? `?refreshRate=${expectedRefreshRate}` : ''
          }`;
          activityLogPage.validateUrl(expectedUrl);
        }
      );
    });

    it('should start autorefresh ticker', () => {
      activityLogPage.spyActivityLogRequest();
      activityLogPage.visit();
      activityLogPage.expectedAggregateAmountOfRequests(1);
      activityLogPage.selectRefreshRate('5s');
      activityLogPage.expectedAggregateAmountOfRequests(2);
      activityLogPage.advanceTimeBy(5);
      activityLogPage.expectedAggregateAmountOfRequests(3);
      activityLogPage.advanceTimeBy(10);
      activityLogPage.expectedAggregateAmountOfRequests(5);
    });

    it(`should update querystring when filters are selected`, () => {
      activityLogPage.visit(`?${defaultSeverity}&refreshRate=5000`);
      activityLogPage.clickFilterTypeButton();
      activityLogPage.selectFilterTypeOption('Login Attempt');
      activityLogPage.selectFilterTypeOption('Tag Added');
      activityLogPage.typeMetadataFilter('foo bar');
      activityLogPage.clickApplyFiltersButton();
      const expectedUrl = `/activity_log?${defaultSeverity}&refreshRate=5000&type=login_attempt&type=resource_tagging&search=foo+bar&first=20`;
      activityLogPage.validateUrl(expectedUrl);
    });
  });
});
