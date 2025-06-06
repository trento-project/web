import * as settingsPage from '../pageObject/settings_po';

context('Settings page', () => {
  beforeEach(() => {
    Cypress.on('uncaught:exception', (err) => {
      cy.log(err.message);
      return true;
    });
    cy.log('initial before Each');
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
      cy.log('SUMA settings beforeEach');
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
          cy.log('Testint saved settings beforeEach');
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
      cy.log('Forbidden actions  beforeEach');
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
