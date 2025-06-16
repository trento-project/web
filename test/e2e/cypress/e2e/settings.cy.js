import * as settingsPage from '../pageObject/settings_po';

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
        settingsPage.saveDefaultSUMAsettings();
        settingsPage.refresh();
        settingsPage.waitForRequest('settingsEndpoint');

        settingsPage.sumaUrlHasExpectedValue();
        settingsPage.sumaCaCertUploadDateHasExpectedValue();
        settingsPage.sumaUsernameHasExpectedValue();
        settingsPage.sumaPasswordHasExpectedValue('•••••');

        settingsPage.clearSumaSettings();
        settingsPage.waitForRequest('settingsEndpoint');

        settingsPage.sumaUrlHasExpectedValue('https://');
        settingsPage.sumaCaCertUploadDateHasExpectedValue('-');
        settingsPage.sumaUsernameHasExpectedValue('.....');
        settingsPage.sumaPasswordHasExpectedValue('.....');
      });

      it('should succeed even though settings do not exist', () => {
        settingsPage.clearSUMASettings();
        settingsPage.refresh();
        settingsPage.waitForRequest('settingsEndpoint');

        settingsPage.sumaUrlHasExpectedValue('https://');
        settingsPage.sumaCaCertUploadDateHasExpectedValue('-');
        settingsPage.sumaUsernameHasExpectedValue('.....');
        settingsPage.sumaPasswordHasExpectedValue('.....');

        settingsPage.clearSumaSettings();
        settingsPage.waitForRequest('settingsEndpoint');

        settingsPage.sumaUrlHasExpectedValue('https://');
        settingsPage.sumaCaCertUploadDateHasExpectedValue('-');
        settingsPage.sumaUsernameHasExpectedValue('.....');
        settingsPage.sumaPasswordHasExpectedValue('.....');
      });
    });

    describe('Testing Connection', () => {
      it('should be disabled when there are no settings', () => {
        settingsPage.clearSUMASettings();
        settingsPage.refresh();
        settingsPage.waitForRequest('settingsEndpoint');
        settingsPage.sumaConnectionButtonIsDisabled();
      });

      describe('Testing against saved settings', () => {
        beforeEach(() => {
          settingsPage.saveDefaultSUMAsettings();
          settingsPage.refresh();
        });

        it('should succeed', () => {
          settingsPage.interceptTestSUMASettingsRequest(200);
          settingsPage.clickSumaConnectionTestButton();
          settingsPage.showExpectedToasterAfterTestingSUMA('succeeded');
        });

        it('should fail', () => {
          settingsPage.interceptTestSUMASettingsRequest(422);
          settingsPage.clickSumaConnectionTestButton();
          settingsPage.showExpectedToasterAfterTestingSUMA('failed');
        });
      });
    });
  });

  describe('Alerting Settings', () => {
    describe('enforced from env', () => {
      before(function () {
        if (Cypress.env('ALERTING_DB_TESTS')) {
          this.skip();
        }
      });

      it('should be displayed correctly', () => {
        settingsPage.getAlertingEnabled().should('have.text', 'Enabled');
        settingsPage.getAlertingServer().should('have.text', 'localhost');
        settingsPage.getAlertingPort().should('have.text', '1025');
        settingsPage.getAlertingUsername().should('have.text', 'trentouser');
        settingsPage.getAlertingPassword().should('have.text', '•••••');
        settingsPage
          .getAlertingSender()
          .should('have.text', 'alerts@trento-project.io');
        settingsPage
          .getAlertingRecipient()
          .should('have.text', 'admin@trento-project.io');
      });

      it('should have an edit button that is disabled', () => {
        settingsPage.getAlertingEditButton().should('be.disabled');
      });
    });

    describe('from DB', () => {
      before(function () {
        if (!Cypress.env('ALERTING_DB_TESTS')) {
          this.skip();
        }
      });

      const initialAlertingSettings = {
        enabled: true,
        smtp_server: 'https://test-smtp-server.com',
        smtp_port: 587,
        smtp_username: 'testuser',
        smtp_password: 'testpass',
        sender_email: 'adm@trento-project.io',
        recipient_email: 'rcv@trento-project.io',
      };

      beforeEach(() => {
        settingsPage.resetAlertingSettingsDB();
        settingsPage.refresh();
        settingsPage.waitForRequest('alertingSettingsEndpoint');
      });

      it('should be displayed with their placeholder values when not explicitly set', () => {
        settingsPage.alertingEnabled().should('have.text', 'Disabled');
        settingsPage.alertingServer().should('have.text', 'https://.....');
        settingsPage.alertingPort().should('have.text', '587');
        settingsPage.alertingUsername().should('have.text', '.....');
        settingsPage.alertingPassword().should('have.text', '•••••');
        settingsPage.alertingSender().should('have.text', '...@...');
        settingsPage.alertingRecipient().should('have.text', '...@...');
      });

      it('should display their current values when previously set', () => {
        settingsPage.saveAlertingSettings(initialAlertingSettings);
        settingsPage.refresh();
        settingsPage.waitForRequest('alertingSettingsEndpoint');

        settingsPage
          .alertingEnabled()
          .should(
            'have.text',
            initialAlertingSettings.enabled ? 'Enabled' : 'Disabled'
          );
        settingsPage
          .alertingServer()
          .should('have.text', initialAlertingSettings.smtp_server);
        settingsPage
          .alertingPort()
          .should('have.text', String(initialAlertingSettings.smtp_port));
        settingsPage
          .alertingUsername()
          .should('have.text', initialAlertingSettings.smtp_username);
        settingsPage.alertingPassword().should('have.text', '•••••');
        settingsPage
          .alertingSender()
          .should('have.text', initialAlertingSettings.sender_email);
        settingsPage
          .alertingRecipient()
          .should('have.text', initialAlertingSettings.recipient_email);
      });

      it('should show empty fields when edit modal is opened with no previous settings set', () => {
        settingsPage.clickAlertingEditButton();

        settingsPage
          .alertingModalEnabled()
          .should('have.attr', 'aria-checked', 'false');
        settingsPage.alertingModalServer().should('have.value', '');
        settingsPage.alertingModalPort().should('have.value', '');
        settingsPage.alertingModalUsername().should('have.value', '');
        settingsPage.alertingModalPassword().should('have.value', '');
        settingsPage.alertingModalPasswordDisplay().should('not.exist');
        settingsPage.alertingModalRemovePasswordButton().should('not.exist');
        settingsPage.alertingModalSender().should('have.value', '');
        settingsPage.alertingModalRecipient().should('have.value', '');
      });

      it('test create');

      it('should shows previous values when edit modal is opened when previous settings set', () => {
        settingsPage.saveAlertingSettings(initialAlertingSettings);
        settingsPage.refresh();
        settingsPage.waitForRequest('alertingSettingsEndpoint');

        settingsPage.clickAlertingEditButton();
        settingsPage
          .alertingModalEnabled()
          .should('have.attr', 'aria-checked', 'true');
        settingsPage
          .alertingModalServer()
          .should('have.value', initialAlertingSettings.smtp_server);
        settingsPage
          .alertingModalPort()
          .should('have.value', String(initialAlertingSettings.smtp_port));
        settingsPage
          .alertingModalUsername()
          .should('have.value', initialAlertingSettings.smtp_username);
        settingsPage.alertingModalPassword().should('not.exist');
        settingsPage
          .alertingModalPasswordDisplay()
          .should('have.text', '•••••');
        settingsPage.alertingModalRemovePasswordButton().should('be.visible');
        settingsPage
          .alertingModalSender()
          .should('have.value', initialAlertingSettings.sender_email);
        settingsPage
          .alertingModalRecipient()
          .should('have.value', initialAlertingSettings.recipient_email);
      });

      it('test update');

      it('test update with password');
    });
  });

  describe('Activity log', () => {
    describe('Changing Settings', () => {
      it('should change retention time', () => {
        settingsPage.clickEditActivityLogSettingsButton();
        settingsPage.waitForRequest('activityLogSettingsEndpoint');
        settingsPage.typeRetentionTime(6);
        settingsPage.clickActivityLogSettingsSaveButton();
        settingsPage.retentionTimeIsTheExpected('6 months');
      });

      it('should not change settings when cancelling operation', () => {
        settingsPage.getCurrentRetentionTime().then((currentRetentionTime) => {
          settingsPage.clickEditActivityLogSettingsButton();
          settingsPage.typeRetentionTime(999);
          settingsPage.clickActivityLogSettingsCancelButton();
          settingsPage.activityLogSettingsModalIsNotDisplayed();
          settingsPage.retentionTimeIsTheExpected(currentRetentionTime);
          settingsPage.changeSettingsEndpointIsNotCalled();
        });
      });

      it('should return validation error on invalid input', () => {
        settingsPage.getCurrentRetentionTime().then((currentRetentionTime) => {
          settingsPage.clickEditActivityLogSettingsButton();
          settingsPage.typeRetentionTime('invalid');
          settingsPage.clickActivityLogSettingsSaveButton();
          settingsPage.clickActivityLogSettingsCancelButton();
          settingsPage.retentionTimeIsTheExpected(currentRetentionTime);
        });
      });
    });
  });

  describe('Forbidden actions', () => {
    beforeEach(() => {
      settingsPage.saveDefaultSUMAsettings();
      settingsPage.apiDeleteAllUsers();
      settingsPage.logout();
    });

    it('should enable settings buttons if the user has the correct abilities', () => {
      settingsPage.saveDefaultSUMAsettings();
      settingsPage.apiCreateUserWithSettingsAbilities();
      settingsPage.loginWithAbilities();
      settingsPage.visit();
      settingsPage.generateApiKeyButtonIsEnabled();
      settingsPage.sumaConnectionTestButtonIsEnabled();
      settingsPage.sumaEditSettingsButtonIsEnabled();
      settingsPage.sumaClearSettingsButtonIsEnabled();
      settingsPage.activityLogsEditButtonIsEnabled();
    });

    it('should disable settings buttons if the user has no abilities', () => {
      settingsPage.apiCreateUserWithoutAbilities();
      settingsPage.loginWithAbilities();
      settingsPage.visit();
      settingsPage.generateApiKeyButtonIsDisabled();
      settingsPage.sumaConnectionTestButtonIsEnabled();
      settingsPage.sumaEditSettingsButtonIsDisabled();
      settingsPage.sumaClearSettingsButtonIsDisabled();
      settingsPage.activityLogsEditButtonIsDisabled();
    });
  });
});
