import { userFactory } from '@lib/test-utils/factories/users';

const PASSWORD = 'password';
const USER = userFactory.build({ username: 'e2etest' });

const getUserIdFromPath = () =>
  cy.location().then(({ pathname }) => {
    return pathname.split('/')[2];
  });

const deleteAllUsers = () => {
  cy.apiLogin().then(({ accessToken }) =>
    cy
      .request({
        url: '/api/v1/users',
        method: 'GET',
        auth: { bearer: accessToken },
        body: {},
      })
      .then(({ body: users }) => {
        users.forEach(({ id }) => {
          if (id === 1) {
            return;
          }
          cy.request({
            url: `/api/v1/users/${id}`,
            method: 'DELETE',
            auth: { bearer: accessToken },
            body: {},
          });
        });
      })
  );
};

const patchUser = (id, payload) => {
  cy.apiLogin().then(({ accessToken }) =>
    cy
      .request({
        url: `/api/v1/users/${id}`,
        method: 'GET',
        auth: { bearer: accessToken },
        body: {},
      })
      .then(({ headers: { etag } }) => {
        cy.request({
          url: `/api/v1/users/${id}`,
          method: 'PATCH',
          auth: { bearer: accessToken },
          body: payload,
          headers: { 'if-match': etag },
        });
      })
  );
};

const getProfile = (username, password) => {
  return cy.apiLogin(username, password).then(({ accessToken }) => {
    return cy
      .request({
        url: '/api/v1/profile',
        method: 'GET',
        auth: { bearer: accessToken },
        body: {},
      })
      .then(({ body: profile }) => {
        return profile;
      });
  });
};

const expectLoginFails = (username, password) => {
  cy.request({
    method: 'POST',
    url: '/api/session',
    body: {
      username,
      password,
    },
    failOnStatusCode: false,
  }).then((response) => {
    expect(response.status).to.eq(401);
  });
};

describe('Users', () => {
  before(() => {
    deleteAllUsers();
    cy.visit('/users');
    cy.url().should('include', '/users');
  });

  describe('Create user', () => {
    it('should redirect to user creation form', () => {
      cy.contains('button', 'Create User').click();
      cy.get('h1').should('contain', 'Create User');
    });

    it('should fail if required fields are missing', () => {
      cy.contains('button', 'Create').click();
      cy.get('p:contains("Required field")').should('have.length', 5);
    });

    it('should fail if email value is wrong', () => {
      cy.get('input').each(($el) => cy.wrap($el).clear());

      cy.get('input[placeholder="Enter full name"]').type(USER.fullname);
      cy.get('input[placeholder="Enter email address"]').type('address');
      cy.get('input[placeholder="Enter username"]').type(USER.username);

      cy.contains('button', 'Generate Password').click();

      cy.contains('button', 'Create').click();
      cy.get('p:contains("Is not a valid email")').should('have.length', 1);
    });

    it('should fail if password is weak', () => {
      cy.get('input').each(($el) => cy.wrap($el).clear());

      cy.get('input[placeholder="Enter full name"]').type(USER.fullname);
      cy.get('input[placeholder="Enter email address"]').type(USER.email);
      cy.get('input[placeholder="Enter username"]').type(USER.username);
      cy.get('input[placeholder="Enter password"]').type('weak');
      cy.get('input[placeholder="Re-enter password"]').type('weak');

      cy.contains('button', 'Create').click();
      cy.get('p:contains("Should be at least 8 character(s)")').should(
        'have.length',
        1
      );
    });

    it('should create user properly', () => {
      cy.get('input').each(($el) => cy.wrap($el).clear());

      cy.get('input[placeholder="Enter full name"]').type(USER.fullname);
      cy.get('input[placeholder="Enter email address"]').type(USER.email);
      cy.get('input[placeholder="Enter username"]').type(USER.username);
      cy.get('input[placeholder="Enter password"]').type(PASSWORD);
      cy.get('input[placeholder="Re-enter password"]').type(PASSWORD);

      cy.contains('button', 'Create').click();
      cy.get('div').contains('User created successfully');

      cy.get('h1').should('contain', 'Users');
      cy.get('a').contains(USER.username);
      cy.get('p').contains(USER.fullname);
    });

    it('should not allow creating the user with the same data', () => {
      cy.contains('button', 'Create User').click();
      cy.get('h1').should('contain', 'Create User');

      cy.get('input[placeholder="Enter full name"]').type(USER.fullname);
      cy.get('input[placeholder="Enter email address"]').type(USER.email);
      cy.get('input[placeholder="Enter username"]').type(USER.username);

      cy.contains('button', 'Generate Password').click();

      cy.contains('button', 'Create').click();
      cy.get('p').contains('Has already been taken');
      cy.contains('button', 'Cancel').click();
    });
  });

  describe('Edit user', () => {
    it('should not allow saving edited admin user', () => {
      cy.contains('a', 'admin').click();
      cy.contains('button', 'Save').should('be.disabled');
      cy.contains('button', 'Cancel').click();
    });

    it('should redirect to user edition form', () => {
      cy.contains('a', USER.username).click();
      cy.get('h1').should('contain', 'Edit User');
    });

    it('should show changed by other user warning', () => {
      const { fullname: fullname1 } = userFactory.build();

      getUserIdFromPath().then((id) => patchUser(id, { fullname: fullname1 }));

      const { fullname: fullname2 } = userFactory.build();
      cy.get('input[placeholder="Enter full name"]').clear();
      cy.get('input[placeholder="Enter full name"]').type(fullname2);
      cy.contains('button', 'Save').click();

      cy.get('span').contains('Information has been updated by another user');
      cy.reload();
      cy.contains('Information has been updated by another user').should(
        'not.exist'
      );
    });

    it('should edit full name properly', () => {
      const { fullname } = userFactory.build();
      cy.get('input[placeholder="Enter full name"]').clear();
      cy.get('input[placeholder="Enter full name"]').type(fullname);
      cy.contains('button', 'Save').click();
      cy.get('div').contains('User edited successfully');
      cy.get('h1').should('contain', 'Users');
      cy.get('p').contains(fullname);
    });
  });

  describe('Admin user profile', () => {
    it('should not allow editing admin user profile', () => {
      cy.contains('span', 'admin', { exact: true }).click();
      cy.contains('a', 'Profile').click();
      cy.contains('button', 'Save').should('be.disabled');
      cy.contains('button', 'Change Password').should('be.disabled');
    });
  });

  describe('User profile', () => {
    before(() => {
      cy.logout();
    });

    it('should login with the new user', () => {
      cy.login(USER.username, PASSWORD);
      cy.visit('/');
      cy.url().should('include', '/');
      cy.get('button').contains(USER.username);
    });

    it('should not see Users entry in the sidebar', () => {
      cy.contains('Users').should('not.exist');
    });

    it('should get a forbidden messages for user related pages', () => {
      cy.visit('/users');
      cy.get('div').contains('Access to this page is forbidden');
    });

    it('should see password change suggestion toast', () => {
      cy.get('p').contains('Password change is recommended.');
    });

    it('should have a proper user data in the profile view', () => {
      cy.contains('a', 'Profile').click();
      cy.get('input[placeholder="Enter email address"]').should(
        'have.value',
        USER.email
      );
      cy.get('input[aria-label="username"]').should(
        'have.value',
        USER.username
      );
    });

    it('should edit full name properly from the profile view', () => {
      const { fullname } = userFactory.build();
      cy.get('input[placeholder="Enter full name"]').clear();
      cy.get('input[placeholder="Enter full name"]').type(fullname);
      cy.contains('button', 'Save').click();
      cy.get('div').contains('Profile changes saved!');
    });

    it('should fail editing user password if current password is wrong', () => {
      cy.contains('button', 'Change Password').click();
      cy.get('input').eq(4).type('wrong');
      cy.get('input').eq(5).type(PASSWORD);
      cy.get('input').eq(6).type(PASSWORD);
      cy.get('button:contains("Save")').eq(1).click();
      cy.get('p').contains('Is invalid');
    });

    it('should edit the user password', () => {
      cy.get('input').eq(4).clear();
      cy.get('input').eq(5).clear();
      cy.get('input').eq(6).clear();

      cy.get('input').eq(4).type(PASSWORD);
      cy.get('input').eq(5).type(PASSWORD);
      cy.get('input').eq(6).type(PASSWORD);
      cy.get('button:contains("Save")').eq(1).click();
      cy.get('div').contains('Profile changes saved!');
      cy.contains('Password change is recommended.').should('not.exist');
    });

    it('should see Users entry in sidebar when the all:users ability is given', () => {
      getProfile(USER.username, PASSWORD).then(({ id }) => {
        patchUser(id, {
          abilities: [{ id: 2, name: 'all', resource: 'users' }],
        });
      });
      cy.contains('Users');
    });

    it('should logout the user when an admin disables the user', () => {
      getProfile(USER.username, PASSWORD).then(({ id }) => {
        patchUser(id, { enabled: false });
      });
      cy.get('h2').should('contain', 'Login to Trento');
    });

    it('should not be able to login with locked user', () => {
      expectLoginFails(USER.username, PASSWORD);
    });
  });

  describe('Delete user', () => {
    before(() => {
      cy.logout();
      cy.login();
      cy.visit('/users');
    });

    it('should delete the user properly', () => {
      cy.get('button:contains("Delete")').eq(1).click();

      cy.get('button:contains("Delete")').eq(2).click();
      cy.contains(USER.username).should('not.exist');
    });

    it('should be able to create a new user with deleted user username and email', () => {
      cy.contains('button', 'Create User').click();
      cy.get('h1').should('contain', 'Create User');

      cy.get('input[placeholder="Enter full name"]').type(USER.fullname);
      cy.get('input[placeholder="Enter email address"]').type(USER.email);
      cy.get('input[placeholder="Enter username"]').type(USER.username);

      cy.contains('button', 'Generate Password').click();

      cy.contains('button', 'Create').click();
      cy.get('div').contains('User created successfully');

      cy.get('h1').should('contain', 'Users');
      cy.get('a').contains(USER.username);
      cy.get('p').contains(USER.fullname);
    });

    it('should not be able to login with deleted user', () => {
      expectLoginFails(USER.username, PASSWORD);
    });
  });
});
