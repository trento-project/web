/* eslint-disable cypress/no-unnecessary-waiting */
import { subDays, addDays } from 'date-fns';
import {
  validCertificate,
  anotherValidCertificate,
  expiredCertificate,
} from '../fixtures/suma_credentials/certificates';
import { createUserRequestFactory } from '@lib/test-utils/factories';

context('Settings page', () => {
  before(() => {
    cy.visit('/settings');
  });

  after(() => {
    cy.updateApiKeyExpiration(null);
  });

  describe('Api key display', () => {
    it('should display the api key with the copy button', () => {
      cy.updateApiKeyExpiration(null);

      cy.reload();

      cy.get('body').should('contain', 'Key will never expire');
      cy.get('code').should('not.be.empty');
      cy.get('[aria-label="copy to clipboard"]').should('be.visible');
    });
  });

  describe('Api Key generation', () => {
    it('should generate a new api key', () => {
      cy.get('button').contains('Generate Key').click();
      cy.get('.rc-input-number-input').as('quantityInput');
      cy.get('.generate-api-key').as('generateButton');

      cy.get('@quantityInput').type('2');
      cy.get('@generateButton').click();

      cy.get('.generate-api-confirmation').as('confirmationGenerateButton');
      cy.get('@confirmationGenerateButton').click();

      cy.get(':nth-child(1) > .w-full > code').as('generatedApiKey');
      cy.get('@generatedApiKey').should('not.be.empty');

      cy.get('.flex-col > :nth-child(1) > button').as('copyApiKey');
      cy.get('@copyApiKey').should('be.visible');

      cy.get('.flex-col > :nth-child(2) > .text-gray-600').as('expirationDate');

      cy.get('@expirationDate').should('contain', 'Key will expire');
      cy.get('button').contains('Close').click();
    });
  });

  describe('Api key expiration notifications', () => {
    it('should show api key expired notification when first loading the page, when the api key is expired', () => {
      cy.updateApiKeyExpiration(subDays(new Date(), 1));

      cy.reload();

      cy.wait(3000);
      cy.get('body').should(
        'contain',
        'API Key has expired. Go to Settings to issue a new key'
      );
    });

    it('should show api is going to expire notification, when first loadng the page if api key expires in less than 30 days', () => {
      cy.updateApiKeyExpiration(addDays(new Date(), 10));

      cy.reload();

      cy.wait(3000);
      cy.get('body').should('contain', 'API Key expires in 9 days');
    });
  });

  describe('SUMA Credentials Management', () => {
    const URL_INPUT = 'suma-url-input';
    const CA_CERT_INPUT = 'suma-cacert-input';
    const USERNAME_INPUT = 'suma-username-input';
    const PASSWORD_INPUT = 'suma-password-input';

    const sumaUrl = 'https://valid';
    const sumaUsername = 'admin';
    const sumaPassword = 'adminpassword';

    before(() => {
      cy.clearSUMASettings();
      cy.reload();
    });

    it('should show empty settings', () => {
      cy.get('[aria-label="suma-url"]').should('have.text', 'https://');
      cy.get('[aria-label="suma-cacert-upload-date"]').should('contain', '-');
      cy.get('[aria-label="suma-username"]').should('contain', '.....');
      cy.get('[aria-label="suma-password"]').should('contain', '.....');
    });

    describe('Saving Settings', () => {
      it('should show empty settings edit form', () => {
        cy.get('button').contains('Edit Settings').click();

        cy.get(`[name="${URL_INPUT}"]`).should('have.value', '');
        cy.get(`[name="${CA_CERT_INPUT}"]`).should('have.value', '');
        cy.get(`[aria-label="remove-suma-cacert"]`).should('not.exist');

        cy.get(`[name="${USERNAME_INPUT}"]`).should('have.value', '');
        cy.get(`[name="${PASSWORD_INPUT}"]`).should('have.value', '');
        cy.get(`[aria-label="remove-suma-password"]`).should('not.exist');

        cy.get('button').contains('Cancel').click();
      });

      describe('Saving Settings Validation', () => {
        const savingValidationScenarios = [
          {
            name: 'missing fields',
            values: [],
            expectedErrors: [
              { name: URL_INPUT, error: 'Missing field: url' },
              { name: CA_CERT_INPUT, error: null },
              { name: USERNAME_INPUT, error: 'Missing field: username' },
              { name: PASSWORD_INPUT, error: 'Missing field: password' },
            ],
          },
          {
            name: 'blank fields',
            values: [
              { name: URL_INPUT, value: ' ' },
              { name: CA_CERT_INPUT, value: ' ' },
              { name: USERNAME_INPUT, value: ' ' },
              { name: PASSWORD_INPUT, value: ' ' },
            ],
            expectedErrors: [
              { name: URL_INPUT, error: "Can't be blank" },
              { name: CA_CERT_INPUT, error: "Can't be blank" },
              { name: USERNAME_INPUT, error: "Can't be blank" },
              { name: PASSWORD_INPUT, error: "Can't be blank" },
            ],
          },
          {
            name: 'invalid url and certificate',
            values: [
              { name: URL_INPUT, value: 'invalid' },
              { name: CA_CERT_INPUT, value: 'foobar' },
              { name: USERNAME_INPUT, value: 'admin' },
              { name: PASSWORD_INPUT, value: 'adminpassword' },
            ],
            expectedErrors: [
              { name: URL_INPUT, error: 'Can only be an https url' },
              {
                name: CA_CERT_INPUT,
                error: 'Unable to parse x.509 certificate',
              },
            ],
          },
          {
            name: 'http url and invalid certificate',
            values: [
              { name: URL_INPUT, value: 'http://invalid' },
              {
                name: CA_CERT_INPUT,
                value:
                  '-----BEGIN CERTIFICATE-----\nfoobar\n-----END CERTIFICATE-----',
              },
              { name: USERNAME_INPUT, value: 'admin' },
              { name: PASSWORD_INPUT, value: 'adminpassword' },
            ],
            expectedErrors: [
              { name: URL_INPUT, error: 'Can only be an https url' },
              {
                name: CA_CERT_INPUT,
                error: 'Unable to parse x.509 certificate',
              },
            ],
          },
          {
            name: 'expired certificate',
            values: [
              { name: URL_INPUT, value: 'http://invalid' },
              {
                name: CA_CERT_INPUT,
                value: expiredCertificate,
              },
              { name: USERNAME_INPUT, value: 'admin' },
              { name: PASSWORD_INPUT, value: 'adminpassword' },
            ],
            expectedErrors: [
              { name: URL_INPUT, error: 'Can only be an https url' },
              {
                name: CA_CERT_INPUT,
                error: 'The x.509 certificate is not valid',
              },
            ],
          },
        ];

        before(() => {
          cy.reload();
          cy.intercept('GET', '/api/v1/settings/suma_credentials').as(
            'getSettings'
          );
          cy.wait('@getSettings');
        });

        savingValidationScenarios.forEach(
          ({ name, values, expectedErrors }) => {
            it(`should show validation errors on invalid input: ${name}`, () => {
              cy.get('button').contains('Edit Settings').click();
              values.forEach(({ name, value }) => {
                cy.get(`[name="${name}"]`).type(value, { delay: 0 });
              });

              cy.intercept('POST', '/api/v1/settings/suma_credentials').as(
                'saveSettings'
              );
              cy.get('button').contains('Save Settings').click();
              cy.wait('@saveSettings');

              expectedErrors.forEach(({ name, error }) => {
                const errorRef = `[aria-label="${name}-error"]`;
                error
                  ? cy.get(errorRef).should('contain', error)
                  : cy.get(errorRef).should('not.exist');
              });
              cy.get('button').contains('Cancel').click();

              cy.get('[aria-label="suma-url"]').should('have.text', 'https://');
              cy.get('[aria-label="suma-cacert-upload-date"]').should(
                'contain',
                '-'
              );
              cy.get('[aria-label="suma-username"]').should('contain', '.....');
              cy.get('[aria-label="suma-password"]').should('contain', '.....');
            });
          }
        );
      });

      describe('Successfully Saving Settings', () => {
        const defaultInputValues = [
          { name: URL_INPUT, value: sumaUrl },
          { name: USERNAME_INPUT, value: sumaUsername },
          { name: PASSWORD_INPUT, value: sumaPassword },
        ];

        const savingScenarios = [
          {
            name: 'without certificate',
            values: defaultInputValues,
            expectCertUploadDate: false,
          },
          {
            name: 'with certificate',
            values: [
              ...defaultInputValues,
              {
                name: CA_CERT_INPUT,
                value: validCertificate,
              },
            ],
            expectCertUploadDate: true,
          },
        ];

        savingScenarios.forEach(({ name, values, expectCertUploadDate }) => {
          it(`should save settings ${name}`, () => {
            cy.get('button').contains('Edit Settings').click();
            values.forEach(({ name, value }) => {
              cy.get(`[name="${name}"]`).type(value, { delay: 0 });
            });

            cy.intercept('POST', '/api/v1/settings/suma_credentials').as(
              'saveSettings'
            );
            cy.get('button').contains('Save Settings').click();
            cy.wait('@saveSettings');

            cy.get('[aria-label="suma-url"]').should('contain', sumaUrl);
            cy.get('[aria-label="suma-cacert-upload-date"]').should(
              'contain',
              expectCertUploadDate ? 'Certificate Uploaded' : '-'
            );
            cy.get('[aria-label="suma-username"]').should(
              'contain',
              sumaUsername
            );
            cy.get('[aria-label="suma-password"]').should('contain', '•••••');

            cy.clearSUMASettings();
            cy.reload();
          });
        });
      });
    });

    describe('Changing Settings', () => {
      const baseInitialSettings = {
        url: sumaUrl,
        username: sumaUsername,
        password: sumaPassword,
      };

      const initialEditFormScenarios = [
        {
          name: 'without cert',
          settings: baseInitialSettings,
        },
        {
          name: 'with certificate',
          settings: { ...baseInitialSettings, ca_cert: validCertificate },
        },
      ];

      initialEditFormScenarios.forEach(({ name, settings }) => {
        it(`should show settings edit form. Scenario: ${name}`, () => {
          cy.saveSUMASettings(settings);
          cy.reload();
          cy.intercept('GET', '/api/v1/settings/suma_credentials').as(
            'getSettings'
          );
          cy.wait('@getSettings');

          const { url, username, ca_cert } = settings;
          cy.get('button').contains('Edit Settings').click();

          cy.get(`[name="${URL_INPUT}"]`).should('have.value', url);
          if (ca_cert) {
            cy.get(`[name="${CA_CERT_INPUT}"]`).should('not.exist');
            cy.get(`[aria-label="remove-suma-cacert"]`).should('exist');
          } else {
            cy.get(`[name="${CA_CERT_INPUT}"]`).should('have.value', '');
            cy.get(`[aria-label="remove-suma-cacert"]`).should('not.exist');
          }
          cy.get(`[name="${USERNAME_INPUT}"]`).should('have.value', username);
          cy.get(`[name="${PASSWORD_INPUT}"]`).should('not.exist');
          cy.get(`[aria-label="remove-suma-password"]`).should('exist');
          cy.get('button').contains('Cancel').click();
          cy.clearSUMASettings();
        });
      });

      describe('Changing Settings Validation', () => {
        const changingValidationScenarios = [
          {
            name: 'blank fields',
            newValues: [
              { name: URL_INPUT, value: ' ' },
              { name: USERNAME_INPUT, value: '   ' },
            ],
            expectedErrors: [
              { name: URL_INPUT, error: "Can't be blank" },
              { name: USERNAME_INPUT, error: "Can't be blank" },
            ],
          },
          {
            name: 'invalid certificate and blank password',
            withInitialCert: true,
            changeInitialPassword: true,
            newValues: [
              {
                name: CA_CERT_INPUT,
                value:
                  '-----BEGIN CERTIFICATE-----\nfoobar\n-----END CERTIFICATE-----',
              },
              { name: PASSWORD_INPUT, value: ' ' },
            ],
            expectedErrors: [
              {
                name: CA_CERT_INPUT,
                error: 'Unable to parse x.509 certificate',
              },
              { name: PASSWORD_INPUT, error: "Can't be blank" },
            ],
          },
          {
            name: 'expired certificate and invalid url',
            withInitialCert: true,
            newValues: [
              { name: URL_INPUT, value: 'invalid' },
              {
                name: CA_CERT_INPUT,
                value: expiredCertificate,
              },
            ],
            expectedErrors: [
              { name: URL_INPUT, error: 'Can only be an https url' },
              {
                name: CA_CERT_INPUT,
                error: 'The x.509 certificate is not valid',
              },
            ],
          },
        ];

        changingValidationScenarios.forEach(
          ({
            name,
            withInitialCert = false,
            changeInitialPassword = false,
            newValues,
            expectedErrors,
          }) => {
            it(`should show validation errors on invalid input: ${name}`, () => {
              const initialSettings = {
                ...baseInitialSettings,
                ...(withInitialCert && { ca_cert: validCertificate }),
              };
              cy.saveSUMASettings(initialSettings);
              cy.reload();
              cy.intercept('GET', '/api/v1/settings/suma_credentials').as(
                'getSettings'
              );
              cy.wait('@getSettings');

              cy.get('button').contains('Edit Settings').click();

              withInitialCert &&
                cy.get(`[aria-label="remove-suma-cacert"]`).click();
              changeInitialPassword &&
                cy.get(`[aria-label="remove-suma-password"]`).click();

              newValues.forEach(({ name, value }) => {
                cy.get(`[name="${name}"]`).clear().type(value, { delay: 0 });
              });
              cy.intercept('PATCH', '/api/v1/settings/suma_credentials').as(
                'changeSettings'
              );
              cy.get('button').contains('Save Settings').click();
              cy.wait('@changeSettings');

              expectedErrors.forEach(({ name, error }) => {
                const errorRef = `[aria-label="${name}-error"]`;

                error
                  ? cy.get(errorRef).should('contain', error)
                  : cy.get(errorRef).should('not.exist');
              });
              cy.get('button').contains('Cancel').click();

              cy.get('[aria-label="suma-url"]').should(
                'contain',
                baseInitialSettings.url
              );
              cy.get('[aria-label="suma-cacert-upload-date"]').should(
                'contain',
                withInitialCert ? 'Certificate Uploaded' : '-'
              );
              cy.get('[aria-label="suma-username"]').should(
                'contain',
                baseInitialSettings.username
              );
              cy.get('[aria-label="suma-password"]').should('contain', '•••••');
              cy.clearSUMASettings();
            });
          }
        );
      });

      describe('Successfully Changing Settings', () => {
        const newUrl = 'https://new-valid-url';
        const newUsername = 'newuser';
        const newPassword = 'newpassword';

        const changingSettingsScenarios = [
          {
            name: 'no changes applied',
            withInitialCert: true,
            newValues: [],
            expectNewUrl: false,
            expectNewUsername: false,
            expectCertUploadDate: true,
          },
          {
            name: 'changing url, username and password',
            withInitialCert: false,
            changeInitialPassword: true,
            newValues: [
              { name: URL_INPUT, value: newUrl },
              { name: USERNAME_INPUT, value: newUsername },
              { name: PASSWORD_INPUT, value: newPassword },
            ],
            expectNewUrl: true,
            expectNewUsername: true,
            expectCertUploadDate: false,
          },
          {
            name: 'changing certificate',
            withInitialCert: true,
            changeInitialPassword: true,
            changeInitialCaCert: true,
            newValues: [
              { name: URL_INPUT, value: newUrl },
              { name: USERNAME_INPUT, value: newUsername },
              { name: PASSWORD_INPUT, value: newPassword },
              {
                name: CA_CERT_INPUT,
                value: anotherValidCertificate,
              },
            ],
            expectNewUrl: true,
            expectNewUsername: true,
            expectCertUploadDate: true,
          },
          {
            name: 'removing certificate',
            withInitialCert: true,
            changeInitialCaCert: true,
            expectNewUrl: false,
            expectNewUsername: false,
            expectCertUploadDate: false,
          },
        ];

        changingSettingsScenarios.forEach((scenario) => {
          const {
            name,
            withInitialCert = false,
            changeInitialPassword = false,
            changeInitialCaCert = false,
            newValues = [],
            expectNewUrl = false,
            expectNewUsername = false,
            expectCertUploadDate = false,
          } = scenario;

          const initialSettings = {
            ...baseInitialSettings,
            ...(withInitialCert && { ca_cert: validCertificate }),
          };

          it(`should change settings: ${name}`, () => {
            cy.saveSUMASettings(initialSettings);
            cy.reload();
            cy.intercept('GET', '/api/v1/settings/suma_credentials').as(
              'getSettings'
            );
            cy.wait('@getSettings');

            cy.get('button').contains('Edit Settings').click();

            changeInitialCaCert &&
              cy.get(`[aria-label="remove-suma-cacert"]`).click();
            changeInitialPassword &&
              cy.get(`[aria-label="remove-suma-password"]`).click();

            newValues.forEach(({ name, value }) => {
              cy.get(`[name="${name}"]`).clear().type(value, { delay: 0 });
            });
            cy.intercept('PATCH', '/api/v1/settings/suma_credentials').as(
              'changeSettings'
            );
            cy.get('button').contains('Save Settings').click();
            cy.wait('@changeSettings');

            cy.get('[aria-label="suma-url"]').should(
              'contain',
              expectNewUrl ? newUrl : baseInitialSettings.url
            );
            cy.get('[aria-label="suma-cacert-upload-date"]').should(
              'contain',
              expectCertUploadDate ? 'Certificate Uploaded' : '-'
            );
            cy.get('[aria-label="suma-username"]').should(
              'contain',
              expectNewUsername ? newUsername : baseInitialSettings.username
            );
            cy.get('[aria-label="suma-password"]').should('contain', '•••••');
            cy.clearSUMASettings();
          });
        });
      });
    });

    describe('Clearing Settings', () => {
      it('should clear existing settings', () => {
        cy.saveSUMASettings({
          url: sumaUrl,
          username: sumaUsername,
          password: sumaPassword,
          ca_cert: validCertificate,
        });
        cy.reload();
        cy.intercept('GET', '/api/v1/settings/suma_credentials').as(
          'getSettings'
        );
        cy.wait('@getSettings');

        cy.get('[aria-label="suma-url"]').should('contain', sumaUrl);
        cy.get('[aria-label="suma-cacert-upload-date"]').should(
          'contain',
          'Certificate Uploaded'
        );
        cy.get('[aria-label="suma-username"]').should('contain', sumaUsername);
        cy.get('[aria-label="suma-password"]').should('contain', '•••••');

        cy.intercept('DELETE', '/api/v1/settings/suma_credentials').as(
          'deleteSUMASettings'
        );
        cy.get('[aria-label="clear-suma-settings"]').click();
        cy.get('[aria-label="confirm-clear-suma-settings"]').click();
        cy.wait('@deleteSUMASettings');

        cy.get('[aria-label="suma-url"]').should('have.text', 'https://');
        cy.get('[aria-label="suma-cacert-upload-date"]').should('contain', '-');
        cy.get('[aria-label="suma-username"]').should('contain', '.....');
        cy.get('[aria-label="suma-password"]').should('contain', '.....');
      });

      it('should succeed even though settings do not exist', () => {
        cy.clearSUMASettings();
        cy.reload();

        cy.intercept('GET', '/api/v1/settings/suma_credentials').as(
          'getSettings'
        );
        cy.wait('@getSettings');

        cy.get('[aria-label="suma-url"]').should('have.text', 'https://');
        cy.get('[aria-label="suma-cacert-upload-date"]').should('contain', '-');
        cy.get('[aria-label="suma-username"]').should('contain', '.....');
        cy.get('[aria-label="suma-password"]').should('contain', '.....');

        cy.intercept('DELETE', '/api/v1/settings/suma_credentials').as(
          'deleteSUMASettings'
        );
        cy.get('[aria-label="clear-suma-settings"]').click();
        cy.get('[aria-label="confirm-clear-suma-settings"]').click();
        cy.wait('@deleteSUMASettings');

        cy.get('[aria-label="suma-url"]').should('have.text', 'https://');
        cy.get('[aria-label="suma-cacert-upload-date"]').should('contain', '-');
        cy.get('[aria-label="suma-username"]').should('contain', '.....');
        cy.get('[aria-label="suma-password"]').should('contain', '.....');
      });
    });

    describe('Testing Connection', () => {
      it('should be disabled when there are no settings', () => {
        cy.clearSUMASettings();
        cy.reload();
        cy.get('[aria-label="test-suma-connection"]').should('be.disabled');
      });

      describe('Testing against saved settings', () => {
        before(() => {
          cy.saveSUMASettings({
            url: sumaUrl,
            username: sumaUsername,
            password: sumaPassword,
            ca_cert: validCertificate,
          });
          cy.reload();
          cy.get('[aria-label="test-suma-connection"]').should('be.enabled');
        });

        it('should succeed', () => {
          cy.intercept('POST', '/api/v1/settings/suma_credentials/test', {
            statusCode: 200,
          }).as('testConnection');

          cy.get('[aria-label="test-suma-connection"]').click();
          cy.wait('@testConnection');
          cy.get('body').should('contain', 'Connection succeeded!');
        });

        it('should fail', () => {
          cy.intercept('POST', '/api/v1/settings/suma_credentials/test', {
            statusCode: 422,
          }).as('testConnection');

          cy.get('[aria-label="test-suma-connection"]').click();
          cy.wait('@testConnection');
          cy.get('body').should('contain', 'Connection failed!');
        });
      });
    });
  });

  describe('Activity log', () => {
    // Elements must be filtered to match only the ones relate to the Activity Logs.
    // Readable texts is contained by the section,
    // while inputs are contained by the modal.
    // The use of helpers instead of Cypress alias avoid problems with the React rendering,
    // as the alias is not updated when the component is re-rendered.
    const section = () => cy.contains('Activity Logs').parents('section');
    const modal = () =>
      cy.contains('Enter Activity Logs Settings').parents('div').first();

    before(() => {
      cy.reload();
    });

    beforeEach(() => {
      // Read the initial retention time to compare with the new value
      // Also, it checks the retention time is displayed correctly
      section()
        .get('[aria-label="retention-time"]')
        .invoke('text')
        .as('initialRetentionTime');
    });

    describe('Changing Settings', () => {
      it('should change retention time', () => {
        // the initial retention time is read before the settings are changed
        cy.get('@initialRetentionTime').then((text) =>
          section()
            .get('[aria-label="retention-time"]')
            .should('have.text', text)
        );

        // Open the modal to change the settings
        section().within(() => {
          cy.get('button').contains('Edit Settings').click();
        });

        // Write the new retention time in the number selector
        modal().get('input[role="spinbutton"]').clear().type('5', { delay: 0 });

        // Save the new settings and wait for the response
        cy.intercept('PUT', '/api/v1/settings/activity_log').as(
          'changeSettings'
        );
        modal().get('button').contains('Save Settings').click();
        cy.wait('@changeSettings');

        // Check the new retention time is displayed correctly
        section()
          .get('[aria-label="retention-time"]')
          .should('have.text', '5 months');
      });

      it('should not change settings when cancelling operation', () => {
        // the initial retention time is read before the settings are changed
        cy.get('@initialRetentionTime').then((text) =>
          section()
            .get('[aria-label="retention-time"]')
            .should('have.text', text)
        );

        // Open the modal to change the settings
        section().within(() => {
          cy.get('button').contains('Edit Settings').click();
        });

        // Write some random value
        modal()
          .get('input[role="spinbutton"]')
          .clear()
          .type('999', { delay: 0 });

        // Abort the operation
        cy.intercept(
          'PUT',
          '/api/v1/settings/activity_log',
          cy.spy().as('changeSettings')
        );
        modal().get('button').contains('Cancel').click();

        // Check the modal is closed
        cy.get('h3').should('not.have.text', 'Enter Activity Logs Settings');

        // Check the data is not changed
        cy.get('@initialRetentionTime').then((text) =>
          section()
            .get('[aria-label="retention-time"]')
            .should('have.text', text)
        );
        cy.get('@changeSettings').should('not.have.been.called');
      });

      it('should return validation error on invalid input', () => {
        // the initial retention time is read before the settings are changed
        cy.get('@initialRetentionTime').then((text) =>
          section()
            .get('[aria-label="retention-time"]')
            .should('have.text', text)
        );

        // Open the modal to change the settings
        section().within(() => {
          cy.get('button').contains('Edit Settings').click();
        });

        // Write some random value
        modal()
          .get('input[role="spinbutton"]')
          .clear()
          .type('invalid', { delay: 0 });

        // Try to save data
        modal().get('button').contains('Save Settings').click();

        // Check we still show the modal

        // Close the modal
        modal().get('button').contains('Cancel').click();

        // Check the data is not changed
        cy.get('@initialRetentionTime').then((text) =>
          section()
            .get('[aria-label="retention-time"]')
            .should('have.text', text)
        );
      });
    });
  });

  describe('Forbidden actions', () => {
    const password = 'password';

    beforeEach(() => {
      cy.deleteAllUsers();
      cy.logout();
      const user = createUserRequestFactory.build({
        password,
        password_confirmation: password,
      });
      cy.wrap(user).as('user');
    });

    it('should enable settings buttons if the user has the correct abilities', () => {
      const userAbilites = [
        { name: 'all', resource: 'activity_logs_settings' },
        { name: 'all', resource: 'api_key_settings' },
        { name: 'all', resource: 'suma_settings' },
      ];
      cy.get('@user').then((user) => {
        cy.createUserWithAbilities(user, userAbilites);
        cy.login(user.username, password);
      });
      cy.visit(`/settings`);
      // API Key settings button
      cy.contains('button', 'Generate Key')
        .should('be.visible')
        .and('be.enabled');
      // SUSE Manager config settings button
      cy.contains('button', 'Test Connection').should('be.enabled');
      cy.contains('h2', 'SUSE Manager Config')
        .next()
        .contains('button', 'Edit Settings')
        .should('be.enabled');
      cy.contains('button', 'Clear Settings').should('be.enabled');
      // Activity Logs settings button
      cy.contains('h2', 'Activity Logs')
        .next()
        .contains('button', 'Edit Settings')
        .should('be.enabled');
    });

    it('should disable settings buttons if the user has no abilities', () => {
      cy.get('@user').then((user) => {
        cy.createUserWithAbilities(user, []);
        cy.login(user.username, password);
      });
      cy.visit(`/settings`);
      // API Key settings button
      cy.contains('button', 'Generate Key').should('have.class', 'opacity-50');
      cy.contains('button', 'Generate Key').should('be.disabled');
      // SUSE Manager config settings button
      cy.contains('button', 'Test Connection').should('be.enabled');
      cy.contains('h2', 'SUSE Manager Config')
        .next()
        .contains('button', 'Edit Settings')
        .should('be.disabled');
      cy.contains('button', 'Clear Settings').should('be.disabled');
      // Activity Logs settings button
      cy.contains('h2', 'Activity Logs')
        .next()
        .contains('button', 'Edit Settings')
        .should('be.disabled');
    });
  });
});
