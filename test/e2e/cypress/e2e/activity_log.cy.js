const NEXT = '[aria-label="next-page"]';
const PREV = '[aria-label="prev-page"]';
const FIRST = '[aria-label="first-page"]';
const LAST = '[aria-label="last-page"]';

context('Activity Log page', () => {
  describe('Navigation', () => {
    it('should navigate to Activity Log page', () => {
      cy.visit('/');

      cy.get('nav').contains('Activity Log').click();

      cy.url().should('eq', `${Cypress.config().baseUrl}/activity_log`);
      cy.get('h1').contains('Activity Log').should('be.visible');
    });

    it('should not load the page twice', () => {
      cy.visit('/');

      cy.intercept({
        url: '/api/v1/activity_log*',
      }).as('data');

      for (let i = 0; i < 5; i++) {
        cy.get('nav').contains('Activity Log').click();
      }

      cy.wait('@data');
      cy.get('@data.all').should('have.length', 1);
    });

    it('should reset querystring when reloading the page from navigation menu', () => {
      cy.visit(
        '/activity_log?search=foo+bar&from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&refreshRate=5000'
      );

      cy.contains('Login Attempt, Tag Added').should('be.visible');
      cy.contains('5s').should('be.visible');

      cy.get('nav').contains('Activity Log').click();

      cy.get('body').should('not.include.text', 'Login Attempt, Tag Added');
      cy.get('body').should('not.include.text', '5s');

      cy.url().should('eq', `${Cypress.config().baseUrl}/activity_log`);
    });
  });

  describe('Filtering', () => {
    it('should render without selected filters', () => {
      cy.intercept({
        url: '/api/v1/activity_log?first=20',
      }).as('data');
      cy.visit('/activity_log');

      cy.contains('Filter Type', { matchCase: false }).should('be.visible');
      cy.contains('Filter older than', { matchCase: false }).should(
        'be.visible'
      );
      cy.contains('Filter newer than', { matchCase: false }).should(
        'be.visible'
      );

      cy.get('input[name="metadata-search"]')
        .should('have.attr', 'placeholder', 'Filter by metadata')
        .should('be.visible');

      cy.wait('@data').its('response.statusCode').should('eq', 200);
    });

    it('should render with selected filters from querystring', () => {
      cy.intercept({
        url: '/api/v1/activity_log?first=20&search=foo+bar&from_date=2024-08-14T10:21:00.000Z&to_date=2024-08-13T10:21:00.000Z&type[]=login_attempt&type[]=resource_tagging',
      }).as('data');

      cy.visit(
        '/activity_log?search=foo+bar&from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging'
      );

      cy.contains('Login Attempt, Tag Added').should('be.visible');
      cy.contains('08/14/2024 10:21:00 AM').should('be.visible');
      cy.contains('08/13/2024 10:21:00 AM').should('be.visible');
      cy.get('input[name="metadata-search"]')
        .should('have.value', 'foo bar')
        .should('be.visible');

      cy.wait('@data').its('response.statusCode').should('eq', 200);
    });

    it('should update querystring when filters are selected', () => {
      cy.visit('/activity_log');

      cy.contains('Filter older than').click();
      cy.get('input[type="datetime-local"]:first').type('2024-08-14T10:21');

      cy.contains('Filter newer than').click();
      cy.get('input[type="datetime-local"]:first').type('2024-08-13T10:21');

      cy.contains('Filter Type').click();
      cy.contains('Login Attempt').click();
      cy.contains('Tag Added').click();

      cy.get('input[name="metadata-search"]').type('foo bar');

      cy.contains('Apply Filters').click();

      cy.url().should(
        'eq',
        `${
          Cypress.config().baseUrl
        }/activity_log?from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&search=foo+bar&first=20`
      );
    });

    it('should reset filters', () => {
      cy.intercept({
        url: '/api/v1/activity_log?first=20',
      }).as('data');

      cy.visit(
        '/activity_log?from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&search=foo+bar'
      );

      cy.contains('Reset Filters').click();

      cy.contains('Filter Type', { matchCase: false }).should('be.visible');
      cy.contains('Filter older than', { matchCase: false }).should(
        'be.visible'
      );
      cy.contains('Filter newer than', { matchCase: false }).should(
        'be.visible'
      );
      cy.get('input[name="metadata-search"]')
        .should('have.attr', 'placeholder', 'Filter by metadata')
        .should('be.visible');

      cy.wait('@data').its('response.statusCode').should('eq', 200);
    });

    it('should refresh content based on currently applied filters', () => {
      const apiUrl =
        '/api/v1/activity_log?first=20&from_date=2024-08-14T10:21:00.000Z&to_date=2024-08-13T10:21:00.000Z&type[]=login_attempt&type[]=resource_tagging&search=foo+bar';
      const pageUrl =
        '/activity_log?from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&search=foo+bar';

      cy.intercept({ url: apiUrl }).as('initialDataLoad');

      cy.visit(pageUrl);

      cy.wait('@initialDataLoad');

      cy.intercept({ url: apiUrl }).as('refreshedDataLoad');
      cy.contains('Refresh').click();
      cy.wait('@refreshedDataLoad');

      cy.url().should('eq', `${Cypress.config().baseUrl}${pageUrl}`);
    });
  });

  describe('Pagination', () => {
    it('should paginate data', () => {
      cy.intercept({
        url: `/api/v1/activity_log?first=20`,
      }).as('firstPage');

      cy.visit('/activity_log');

      cy.wait('@firstPage').then(({ response }) => {
        expect(response.body).to.have.property('pagination');
        expect(response.body.pagination).to.have.property('end_cursor');
        expect(response.body.pagination.end_cursor).not.to.be.undefined;
        expect(response.body.pagination).to.have.property('has_next_page');
        expect(response.body.pagination.has_next_page).to.be.true;

        const after = response.body.pagination.end_cursor;

        cy.url().should('eq', `${Cypress.config().baseUrl}/activity_log`);

        cy.intercept({
          url: `/api/v1/activity_log?first=20&after=${after}`,
        }).as('secondPage');
        cy.get(NEXT).click();

        cy.wait('@secondPage').its('response.statusCode').should('eq', 200);

        cy.url().should(
          'eq',
          `${Cypress.config().baseUrl}/activity_log?first=20&after=${after}`
        );
      });
    });

    it('should paginate data with filters', () => {
      cy.intercept({
        url: `/api/v1/activity_log?first=20&type[]=sles_subscriptions_updated&search=x86_64`,
      }).as('firstPage');

      cy.visit('/activity_log?type=sles_subscriptions_updated&search=x86_64');

      cy.wait('@firstPage').then(({ response }) => {
        expect(response.body).to.have.property('pagination');
        expect(response.body.pagination).to.have.property('end_cursor');
        expect(response.body.pagination.end_cursor).not.to.be.undefined;
        expect(response.body.pagination).to.have.property('has_next_page');
        expect(response.body.pagination.has_next_page).to.be.true;

        const after = response.body.pagination.end_cursor;

        cy.url().should(
          'eq',
          `${
            Cypress.config().baseUrl
          }/activity_log?type=sles_subscriptions_updated&search=x86_64`
        );

        cy.intercept({
          url: `/api/v1/activity_log?first=20&after=${after}&type[]=sles_subscriptions_updated&search=x86_64`,
        }).as('secondPage');
        cy.get(NEXT).click();

        cy.wait('@secondPage').its('response.statusCode').should('eq', 200);

        cy.url().should(
          'eq',
          `${
            Cypress.config().baseUrl
          }/activity_log?first=20&after=${after}&type=sles_subscriptions_updated&search=x86_64`
        );
      });
    });

    it('should reset pagination when filters are changed', () => {
      cy.visit('/activity_log');

      cy.intercept({
        url: `/api/v1/activity_log?first=20`,
      }).as('firstPage');

      cy.wait('@firstPage').then(({ response }) => {
        expect(response.body).to.have.property('pagination');
        expect(response.body.pagination).to.have.property('end_cursor');
        expect(response.body.pagination.end_cursor).not.to.be.undefined;
        expect(response.body.pagination).to.have.property('has_next_page');
        expect(response.body.pagination.has_next_page).to.be.true;

        const after = response.body.pagination.end_cursor;

        cy.get(NEXT).click();

        cy.url().should(
          'eq',
          `${Cypress.config().baseUrl}/activity_log?first=20&after=${after}`
        );
      });

      cy.contains('Filter Type').click();
      cy.contains('Login Attempt').click();
      cy.contains('Apply Filters').click();

      cy.url().should(
        'eq',
        `${Cypress.config().baseUrl}/activity_log?type=login_attempt&first=20`
      );
    });

    it('should select correct date filter when changing page', () => {
      cy.intercept({
        url: '/api/v1/activity_log?first=20&to_date=2024-08-14T10:21:00.000Z',
      }).as('firstPage');

      cy.visit(
        '/activity_log?to_date=custom&to_date=2024-08-14T10%3A21%3A00.000Z'
      );

      cy.contains('08/14/2024 10:21:00 AM').should('be.visible');

      cy.wait('@firstPage').then(({ response }) => {
        const after = response.body.pagination.end_cursor;

        cy.intercept({
          url: `/api/v1/activity_log?first=20&after=${after}&to_date=2024-08-14T10:21:00.000Z`,
        }).as('secondPage');

        cy.get(NEXT).click();

        cy.wait('@secondPage').its('response.statusCode').should('eq', 200);
        cy.contains('08/14/2024 10:21:00 AM').should('be.visible');
      });
    });

    it('should change items per page', () => {
      cy.intercept({
        url: '/api/v1/activity_log?first=20',
      }).as('data20');

      cy.intercept({
        url: '/api/v1/activity_log?first=50',
      }).as('data50');

      cy.visit('/activity_log');

      cy.wait('@data20').its('response.body.pagination.first').should('eq', 20);

      cy.get('[data-testid="pagination"]').contains('20').click();
      cy.get('[data-testid="pagination"]').contains('50').click();

      cy.wait('@data50').its('response.body.pagination.first').should('eq', 50);
    });

    it('should persist items per page when changing page', () => {
      cy.intercept({
        url: '/api/v1/activity_log?first=20',
      }).as('data20');

      cy.intercept({
        url: '/api/v1/activity_log?first=10',
      }).as('data10');

      cy.intercept({
        url: '/api/v1/activity_log?first=10&after=*',
      }).as('data10-after');

      cy.visit('/activity_log');

      cy.wait('@data20').its('response.body.pagination.first').should('eq', 20);

      cy.get('[data-testid="pagination"]').contains('20').click();
      cy.get('[data-testid="pagination"]').contains('10').click();

      cy.wait('@data10').its('response.body.pagination.first').should('eq', 10);

      cy.get(NEXT).click();

      cy.wait('@data10-after')
        .its('response.body.pagination.first')
        .should('eq', 10);

      cy.get('button').contains('10').should('be.visible');
    });

    it('should navigate backward', () => {
      cy.intercept({
        url: '/api/v1/activity_log?first=20',
      }).as('firstPage');

      cy.visit('/activity_log');

      cy.wait('@firstPage').then(({ response: firstPageResponse }) => {
        expect(firstPageResponse.body.pagination).to.have.property('first', 20);
        expect(firstPageResponse.body.pagination).to.have.property(
          'end_cursor'
        );

        cy.intercept({
          url: `/api/v1/activity_log?first=20&after=*`,
        }).as('secondPage');

        cy.get(NEXT).click();

        cy.wait('@secondPage').then(({ response: secondPageResponse }) => {
          expect(secondPageResponse.body.pagination).to.have.property(
            'first',
            20
          );
          expect(secondPageResponse.body.pagination).to.have.property(
            'end_cursor'
          );
          expect(secondPageResponse.body.pagination).to.have.property(
            'has_next_page'
          );
          expect(secondPageResponse.body.pagination.has_next_page).to.be.true;

          cy.intercept({
            url: `/api/v1/activity_log?last=20&before=*`,
          }).as('firstPage-back');

          cy.get(PREV).click();

          cy.wait('@firstPage-back').then(({ response }) => {
            expect(response.body.pagination).to.have.property('last', 20);
            firstPageResponse.body.data.forEach((element, i) => {
              expect(element.id).to.eq(response.body.data[i].id);
            });
          });
        });
      });
    });

    it('should go to first page', () => {
      cy.intercept({
        url: '/api/v1/activity_log?first=20&type[]=host_registered',
      }).as('firstPage');

      cy.intercept({
        url: `/api/v1/activity_log?first=20&after=**&type[]=host_registered`,
      }).as('secondPage');

      cy.visit('/activity_log?type=host_registered');

      cy.wait('@firstPage');

      cy.get(NEXT).click();

      cy.wait('@secondPage');

      cy.intercept({
        url: `/api/v1/activity_log?first=20&type[]=host_registered`,
      }).as('firstPage2');

      cy.get(FIRST).click();

      cy.wait('@firstPage2');

      cy.url().should(
        'eq',
        `${Cypress.config().baseUrl}/activity_log?first=20&type=host_registered`
      );
    });

    it('should go to last page', () => {
      cy.intercept({
        url: '/api/v1/activity_log?first=20&type[]=host_registered',
      }).as('firstPage');

      cy.visit('/activity_log?type=host_registered');

      cy.wait('@firstPage');

      cy.intercept({
        url: `/api/v1/activity_log?last=20&type[]=host_registered`,
      }).as('lastPage');

      cy.get(LAST).click();

      cy.wait('@lastPage');

      cy.url().should(
        'eq',
        `${Cypress.config().baseUrl}/activity_log?last=20&type=host_registered`
      );
    });
  });

  describe('Autorefresh', () => {
    it('should have autorefresh turned off by default', () => {
      cy.visit('/activity_log');

      cy.contains('Off').should('be.visible');
    });

    it('should allow changing autorefresh interval only on first page', () => {
      const firstPageApiUrl = `/api/v1/activity_log?first=20`;
      const nextPageRegex = /\/api\/v1\/activity_log\?first=20&after=.*/;

      cy.intercept(firstPageApiUrl).as('firstPage');
      cy.visit('/activity_log');
      cy.wait('@firstPage');
      cy.contains('Off').should('be.enabled');

      cy.intercept(nextPageRegex).as('secondPage');
      cy.get(NEXT).click();
      cy.wait('@secondPage');
      cy.contains('Off').should('be.disabled');

      cy.intercept(nextPageRegex).as('thirdPage');
      cy.get(NEXT).click();
      cy.wait('@thirdPage');
      cy.contains('Off').should('be.disabled');

      cy.intercept(firstPageApiUrl).as('backToFirstPage');
      cy.get(FIRST).click();
      cy.wait('@backToFirstPage');
      cy.contains('Off').should('be.enabled');
    });

    it('should ignore refresh rate query string param in API call', () => {
      cy.intercept(
        '/api/v1/activity_log?first=20&search=foo+bar&from_date=2024-08-14T10:21:00.000Z&to_date=2024-08-13T10:21:00.000Z&type[]=login_attempt&type[]=resource_tagging'
      );

      cy.visit(
        '/activity_log?search=foo+bar&from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&refreshRate=5000'
      );

      cy.contains('5s').should('be.visible');
    });

    it('should ignore an invalid refresh rate in query string param', () => {
      cy.visit(
        '/activity_log?search=foo+bar&from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&refreshRate=00Invalid'
      );

      cy.contains('Off').should('be.visible');
    });

    it('should not reset refresh rate when resetting filters', () => {
      cy.visit(
        '/activity_log?from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&search=foo+bar&refreshRate=10000'
      );

      cy.contains('10s').should('be.visible');

      cy.contains('Reset Filters').click();

      cy.contains('10s').should('be.visible');
      cy.url().should(
        'eq',
        `${Cypress.config().baseUrl}/activity_log?first=20&refreshRate=10000`
      );
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
