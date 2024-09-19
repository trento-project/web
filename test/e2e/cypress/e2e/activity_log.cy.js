const NEXT = /^>$/;
const PREV = /^<$/;
const FIRST = /^<<$/;
const LAST = /^>>$/;

context('Activity Log page', () => {
  before(() => {
    cy.loadScenario('healthy-27-node-SAP-cluster');
  });

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
        '/activity_log?from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging'
      );

      cy.contains('Login Attempt, Tag Added').should('be.visible');

      cy.get('nav').contains('Activity Log').click();

      cy.get('body').should('not.include.text', 'Login Attempt, Tag Added');
      cy.url().should('eq', `${Cypress.config().baseUrl}/activity_log`);
    });
  });

  describe('Filtering', () => {
    it('should render without selected filters', () => {
      cy.intercept({
        url: '/api/v1/activity_log?first=20',
      }).as('data');
      cy.visit('/activity_log');

      cy.contains('Filter Resource type', { matchCase: false }).should(
        'be.visible'
      );
      cy.contains('Filter older than', { matchCase: false }).should(
        'be.visible'
      );
      cy.contains('Filter newer than', { matchCase: false }).should(
        'be.visible'
      );

      cy.wait('@data').its('response.statusCode').should('eq', 200);
    });

    it('should render with selected filters from querystring', () => {
      cy.intercept({
        url: '/api/v1/activity_log?first=20&from_date=2024-08-14T10:21:00.000Z&to_date=2024-08-13T10:21:00.000Z&type[]=login_attempt&type[]=resource_tagging',
      }).as('data');

      cy.visit(
        '/activity_log?from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging'
      );

      cy.contains('Login Attempt, Tag Added').should('be.visible');
      cy.contains('08/14/2024 10:21:00 AM').should('be.visible');
      cy.contains('08/13/2024 10:21:00 AM').should('be.visible');

      cy.wait('@data').its('response.statusCode').should('eq', 200);
    });

    it('should update querystring when filters are selected', () => {
      cy.visit('/activity_log');

      cy.contains('Filter older than').click();
      cy.get('input[type="datetime-local"]:first').type('2024-08-14T10:21');

      cy.contains('Filter newer than').click();
      cy.get('input[type="datetime-local"]:first').type('2024-08-13T10:21');

      cy.contains('Filter Resource type').click();
      cy.contains('Login Attempt').click();
      cy.contains('Tag Added').click();

      cy.contains('Apply').click();

      cy.url().should(
        'eq',
        `${
          Cypress.config().baseUrl
        }/activity_log?from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&first=20`
      );
    });

    it('should reset filters', () => {
      cy.intercept({
        url: '/api/v1/activity_log?first=20',
      }).as('data');

      cy.visit(
        '/activity_log?from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging'
      );

      cy.contains('Reset').click();

      cy.contains('Filter Resource type', { matchCase: false }).should(
        'be.visible'
      );
      cy.contains('Filter older than', { matchCase: false }).should(
        'be.visible'
      );
      cy.contains('Filter newer than', { matchCase: false }).should(
        'be.visible'
      );

      cy.wait('@data').its('response.statusCode').should('eq', 200);
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

        cy.contains(PREV).click();

        cy.url().should('eq', `${Cypress.config().baseUrl}/activity_log`);

        cy.intercept({
          url: `/api/v1/activity_log?first=20&after=${after}`,
        }).as('secondPage');
        cy.contains(NEXT).click();

        cy.wait('@secondPage').its('response.statusCode').should('eq', 200);

        cy.url().should(
          'eq',
          `${Cypress.config().baseUrl}/activity_log?first=20&after=${after}`
        );
      });
    });

    it('should paginate data with filters', () => {
      cy.intercept({
        url: `/api/v1/activity_log?first=20&type[]=sles_subscriptions_updated`,
      }).as('firstPage');

      cy.visit('/activity_log?type=sles_subscriptions_updated');

      cy.wait('@firstPage').then(({ response }) => {
        expect(response.body).to.have.property('pagination');
        expect(response.body.pagination).to.have.property('end_cursor');
        expect(response.body.pagination.end_cursor).not.to.be.undefined;
        expect(response.body.pagination).to.have.property('has_next_page');
        expect(response.body.pagination.has_next_page).to.be.true;

        const after = response.body.pagination.end_cursor;

        cy.contains(PREV).click();

        cy.url().should(
          'eq',
          `${
            Cypress.config().baseUrl
          }/activity_log?type=sles_subscriptions_updated`
        );

        cy.intercept({
          url: `/api/v1/activity_log?first=20&after=${after}&type[]=sles_subscriptions_updated`,
        }).as('secondPage');
        cy.contains(NEXT).click();

        cy.wait('@secondPage').its('response.statusCode').should('eq', 200);

        cy.url().should(
          'eq',
          `${
            Cypress.config().baseUrl
          }/activity_log?first=20&after=${after}&type=sles_subscriptions_updated`
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

        cy.contains(NEXT).click();

        cy.url().should(
          'eq',
          `${Cypress.config().baseUrl}/activity_log?first=20&after=${after}`
        );
      });

      cy.contains('Filter Resource type').click();
      cy.contains('Login Attempt').click();
      cy.contains('Apply').click();

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

        cy.contains(NEXT).click();

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

      cy.get('button').contains('20').click();
      cy.get('li').contains('50').click();

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

      cy.get('button').contains('20').click();
      cy.get('li').contains('10').click();

      cy.wait('@data10').its('response.body.pagination.first').should('eq', 10);

      cy.contains(NEXT).click();

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

        cy.contains(NEXT).click();

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

          cy.contains(PREV).click();

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

      cy.contains(NEXT).click();

      cy.wait('@secondPage');

      cy.intercept({
        url: `/api/v1/activity_log?first=20&type[]=host_registered`,
      }).as('firstPage2');

      cy.contains(FIRST).click();

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

      cy.contains(LAST).click();

      cy.wait('@lastPage');

      cy.url().should(
        'eq',
        `${Cypress.config().baseUrl}/activity_log?last=20&type=host_registered`
      );
    });
  });
});
