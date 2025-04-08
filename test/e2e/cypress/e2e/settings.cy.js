import * as settingsPage from '../pageObject/settings_po';

import { validCertificate } from '../fixtures/suma_credentials/certificates';
import { createUserRequestFactory } from '@lib/test-utils/factories';

context('Settings page', () => {
  beforeEach(() => {
    settingsPage.visit();
    settingsPage.waitForRequest('settingsEndpoint');
  });

  after(() => settingsPage.updateApiKeyExpiration(null));

  describe('Api key display', () => {
    it('should display the api key with the copy button', () => {
      settingsPage.updateApiKeyExpiration(null);
      settingsPage.refresh();
      settingsPage.keyExpirationLabelIsDisplayed();
      settingsPage.apiKeyCodeIsNotEmpty();
      settingsPage.copyToClipboardButtonIsDisplayed();
    });
  });

  describe('Api Key generation', () => {
    it('should generate a new api key', () => {
      settingsPage.clickGenerateApiKeyButton();
      settingsPage.setApiKeyExpiration(2);
      settingsPage.clickGenerateApiKeyButtonFromModal();
      settingsPage.clickGenerateApiKeyConfirmationButton();
      settingsPage.modalShowsNewGeneratedApiKey();
      settingsPage.modalCopyApiKeyButtonIsDisplayed();
      settingsPage.modalExpirationDateLabelIsDisplayed();
      settingsPage.clickModalCloseButton();
    });
  });

  describe('Api key expiration notifications', () => {
    it('should show api key expired notification when first loading the page, when the api key is expired', () => {
      settingsPage.setExpiredApiKey();
      settingsPage.refresh();
      settingsPage.expiredApiKeyToasterIsDisplayed();
    });

    it('should show api is going to expire notification, when first loadng the page if api key expires in less than 30 days', () => {
      settingsPage.setCloseToExpireApiKey();
      settingsPage.refresh();
      settingsPage.closeToExpireApiKeyToasterIsDisplayed();
    });
  });

  describe('Suse Manager Settings Management', () => {
    const URL_INPUT = 'suma-url-input';
    const CA_CERT_INPUT = 'suma-cacert-input';
    const USERNAME_INPUT = 'suma-username-input';
    const PASSWORD_INPUT = 'suma-password-input';

    const sumaUrl = 'https://valid';
    const sumaUsername = 'admin';
    const sumaPassword = 'adminpassword';

    beforeEach(() => {
      settingsPage.clearSUMASettings();
      settingsPage.refresh();
    });

    it('should show empty settings', () => {
      settingsPage.sumaUrlHasExpectedValue('https://');
      settingsPage.sumaCaCertUploadDateHasExpectedValue('-');
      settingsPage.sumaUsernameHasExpectedValue('.....');
      settingsPage.sumaPasswordHasExpectedValue('.....');
    });

    describe('Saving Settings', () => {
      it('should show empty settings edit form', () => {
        settingsPage.clickSumaEditSettingsButton();
        settingsPage.sumaUrlInputIsEmpty();
        settingsPage.sumaCaCertIsEmpty();
        settingsPage.sumaRemoveCaCertButtonIsNotDisplayed();
        settingsPage.sumaUsernameInputIsEmpty();
        settingsPage.sumaPasswordInputIsEmpty();
        settingsPage.sumaRemovePasswordButtonIsNotDisplayed();
        settingsPage.clickModalCancelButton();
      });

      describe('Saving Settings Validation', () => {
        it('should show validation errors on invalid input', () => {
          settingsPage.expectedSavingValidationsAreDisplayed();
        });
      });

      describe('Successfully Saving Settings', () => {
        it('should save settings', () => {
          settingsPage.eachSaveSettingsScenarioWorkAsExpected();
        });
      });
    });

    describe('Changing Settings', () => {
      it('should show settings edit form', () => {
        settingsPage.editFormIsDisplayedAsExpected();
      });

      describe('Changing Settings Validation', () => {
        it('should show validation errors on invalid inputs', () => {
          settingsPage.changingSettingsValidationsWorkAsExpected();
        });
      });

      describe('Successfully Changing Settings', () => {
        it('should change settings', () => {
          settingsPage.sumaSettingsAreCorrectlyChanged();
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
        cy.intercept('GET', '/api/v1/settings/suse_manager').as('getSettings');
        cy.wait('@getSettings');

        cy.get('[aria-label="suma-url"]').should('contain', sumaUrl);
        cy.get('[aria-label="suma-cacert-upload-date"]').should(
          'contain',
          'Certificate Uploaded'
        );
        cy.get('[aria-label="suma-username"]').should('contain', sumaUsername);
        cy.get('[aria-label="suma-password"]').should('contain', '•••••');

        cy.intercept('DELETE', '/api/v1/settings/suse_manager').as(
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

        cy.intercept('GET', '/api/v1/settings/suse_manager').as('getSettings');
        cy.wait('@getSettings');

        cy.get('[aria-label="suma-url"]').should('have.text', 'https://');
        cy.get('[aria-label="suma-cacert-upload-date"]').should('contain', '-');
        cy.get('[aria-label="suma-username"]').should('contain', '.....');
        cy.get('[aria-label="suma-password"]').should('contain', '.....');

        cy.intercept('DELETE', '/api/v1/settings/suse_manager').as(
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
          cy.intercept('POST', '/api/v1/settings/suse_manager/test', {
            statusCode: 200,
          }).as('testConnection');

          cy.get('[aria-label="test-suma-connection"]').click();
          cy.wait('@testConnection');
          cy.get('body').should('contain', 'Connection succeeded!');
        });

        it('should fail', () => {
          cy.intercept('POST', '/api/v1/settings/suse_manager/test', {
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
      cy.contains('h2', 'SUSE Multi-Linux Manager Config')
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
      cy.contains('h2', 'SUSE Multi-Linux Manager Config')
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
