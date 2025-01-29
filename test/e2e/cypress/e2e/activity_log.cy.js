import * as activityLogPage from '../pageObject/activity-log-po.js';
import * as basePage from '../pageObject/base-po.js';

context('Activity Log page', () => {
  // before(() => activityLogPage.preloadTestData());

  beforeEach(() => {
    activityLogPage.interceptActivityLogEndpoint();
    basePage.visit();
  });

  describe('Navigation', () => {
    it('should navigate to Activity Log page', () => {
      basePage.clickActivityLogNavigationItem();
      activityLogPage.validateUrl('/activity_log');
      activityLogPage.pageTitleIsCorrectlyDisplayed('Activity Log');
    });

    it('should not load the page twice', () => {
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
      activityLogPage.validateUrl('/activity_log');
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
      const queryString =
        '?search=foo+bar&from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging';
      activityLogPage.visit(queryString);
      activityLogPage.filteredActionsAreTheExpectedOnes(
        'Login Attempt, Tag Added'
      );
      activityLogPage.filterNewerThanHasTheExpectedValue(
        '08/13/2024 10:21:00 AM'
      );
      activityLogPage.filterOlderThanHasTheExpectedValue(
        '08/14/2024 10:21:00 AM'
      );
      activityLogPage.metadataSearchHasTheExpectedValue('foo bar');
      activityLogPage.activityLogRequestHasExpectedStatusCode(200);
    });

    it('should update querystring when filters are selected', () => {
      activityLogPage.visit();

      activityLogPage.clickFilterOlderThanButton();
      activityLogPage.typeFilterOlderThanInputField('2024-08-14T10:21');

      activityLogPage.clickFilterNewerThanButton();
      activityLogPage.typeFilterNewerThanInputField('2024-08-13T10:21');

      activityLogPage.clickFilterTypeButton();
      activityLogPage.selectFilterTypeOption('Login Attempt');
      activityLogPage.selectFilterTypeOption('Tag Added');

      activityLogPage.typeMetadataFilter('foo bar');
      activityLogPage.clickApplyFiltersButton();

      const expectedUrl =
        '/activity_log?from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&search=foo+bar&first=20';
      activityLogPage.validateUrl(expectedUrl);
    });

    it('should reset filters', () => {
      const queryString =
        '?from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&search=foo+bar';
      activityLogPage.visit(queryString);
      activityLogPage.clickResetFiltersButton();
      activityLogPage.filterTypeHasNothingSelected();
      activityLogPage.filterOlderThanHasNothingSelected();
      activityLogPage.filterNewerThanHasNothingSelected();
      activityLogPage.metadataSearchHasTheExpectedPlaceholder();
      activityLogPage.activityLogRequestHasExpectedStatusCode(200);
    });

    it('should refresh content based on currently applied filters', () => {
      const queryString =
        '?from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&search=foo+bar';
      activityLogPage.visit(queryString);
      activityLogPage.waitForActivityLogRequest();
      activityLogPage.interceptActivityLogEndpoint();
      activityLogPage.clickRefreshButton();
      activityLogPage.waitForActivityLogRequest();
      activityLogPage.validateUrl(`/activity_log${queryString}`);
    });
  });

  describe('Pagination', () => {
    it('should paginate data', () => {
      activityLogPage.visit();
      activityLogPage.waitForActivityLogRequest().then(({ response }) => {
        activityLogPage.paginationPropertiesAreTheExpected(response);
        activityLogPage.validateUrl('/activity_log');
        activityLogPage.interceptActivityLogEndpoint();
        activityLogPage.clickNextPageButton();
        activityLogPage.activityLogRequestHasExpectedStatusCode(200);
        const expectedUrl = `/activity_log?first=20&after=${response.body.pagination.end_cursor}`;
        activityLogPage.validateUrl(expectedUrl);
      });
    });

    it('should paginate data with filters', () => {
      const queryString = '?type=sles_subscriptions_updated&search=x86_64';
      activityLogPage.visit(queryString);
      activityLogPage.waitForActivityLogRequest().then(({ response }) => {
        activityLogPage.paginationPropertiesAreTheExpected(response);
        let expectedUrl = `/activity_log?type=sles_subscriptions_updated&search=x86_64`;
        activityLogPage.validateUrl(expectedUrl);
        activityLogPage.clickNextPageButton();
        activityLogPage.activityLogRequestHasExpectedStatusCode(200);
        expectedUrl = `/activity_log?first=20&after=${response.body.pagination.end_cursor}&type=sles_subscriptions_updated&search=x86_64`;
        activityLogPage.validateUrl(expectedUrl);
      });
    });

    it('should reset pagination when filters are changed', () => {
      activityLogPage.visit();
      activityLogPage.waitForActivityLogRequest().then(({ response }) => {
        activityLogPage.paginationPropertiesAreTheExpected(response);
        let expectedUrl = `/activity_log?first=20&after=${response.body.pagination.end_cursor}`;
        activityLogPage.clickNextPageButton();
        activityLogPage.validateUrl(expectedUrl);
      });
      activityLogPage.clickFilterTypeButton();
      activityLogPage.selectFilterTypeOption('Login Attempt');
      activityLogPage.clickApplyFiltersButton();
      const expectedUrl = `/activity_log?type=login_attempt&first=20`;
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
      const expectedUrl = '/activity_log?first=20&refreshRate=10000';
      activityLogPage.validateUrl(expectedUrl);
    });

    const allRefreshRates = ['Off', '5s', '10s', '30s', '1m', '5m', '30m'];

    const changingRefreshRateScenarios = [
      {
        currentRefreshRate: 'Off',
        newRefreshRate: '5s',
        expectedRefreshRate: 5000,
      },
      {
        currentRefreshRate: '5s',
        newRefreshRate: '10s',
        expectedRefreshRate: 10000,
      },
      {
        currentRefreshRate: '10s',
        newRefreshRate: '30s',
        expectedRefreshRate: 30000,
      },
      {
        currentRefreshRate: '30s',
        newRefreshRate: '1m',
        expectedRefreshRate: 60000,
      },
      {
        currentRefreshRate: '1m',
        newRefreshRate: '5m',
        expectedRefreshRate: 300000,
      },
      {
        currentRefreshRate: '5m',
        newRefreshRate: '30m',
        expectedRefreshRate: 1800000,
      },
      {
        currentRefreshRate: '30m',
        newRefreshRate: 'Off',
        expectedRefreshRate: null,
      },
    ];

    it('should change refresh rate', () => {
      cy.intercept({
        url: '/api/v1/activity_log?first=20',
      }).as('data');

      cy.visit('/activity_log');

      changingRefreshRateScenarios.forEach(
        ({ currentRefreshRate, newRefreshRate, expectedRefreshRate }) => {
          cy.contains(currentRefreshRate).should('be.visible');

          allRefreshRates
            .filter((rate) => rate !== currentRefreshRate)
            .forEach((hiddenRate) =>
              cy.get('body').should('not.include.text', hiddenRate)
            );

          cy.contains(currentRefreshRate).click();
          cy.contains(newRefreshRate).click();

          if (expectedRefreshRate) {
            cy.url().should(
              'eq',
              `${
                Cypress.config().baseUrl
              }/activity_log?refreshRate=${expectedRefreshRate}`
            );
          } else {
            cy.url().should('eq', `${Cypress.config().baseUrl}/activity_log`);
          }
        }
      );
    });

    it('should start autorefresh ticker', () => {
      cy.clock();

      cy.intercept('/api/v1/activity_log?first=20', cy.spy().as('data'));

      cy.visit('/activity_log');

      // First call on page load
      cy.get('@data').should('have.been.calledOnce');

      cy.contains('Off').click();
      cy.contains('5s').click();
      // Second call when changing refresh rate
      cy.get('@data').should('have.been.calledTwice');

      // third call after 5 seconds
      cy.tick(5000);
      cy.get('@data').should('have.been.calledThrice');

      // plus 2 other calls after 10 seconds
      cy.tick(5000 * 2);
      cy.get('@data').its('callCount').should('equal', 5);
    });

    it(`should update querystring when filters are selected`, () => {
      cy.visit(`/activity_log?refreshRate=5000`);

      cy.contains('Filter Type').click();
      cy.contains('Login Attempt').click();
      cy.contains('Tag Added').click();

      cy.get('input[name="metadata-search"]').type('foo bar');

      cy.contains('Apply Filters').click();

      cy.url().should(
        'eq',
        `${
          Cypress.config().baseUrl
        }/activity_log?refreshRate=5000&type=login_attempt&type=resource_tagging&search=foo+bar&first=20`
      );
    });
  });
});
