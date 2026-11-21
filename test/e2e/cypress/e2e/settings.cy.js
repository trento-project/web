// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import * as settingsPage from '../pageObject/settings_po';

context('Settings page', () => {
  beforeEach(() => {
    settingsPage.interceptInitialDataFetch();
    settingsPage.visit();
    settingsPage.waitForSettingsPageRequests();
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

  describe('SUSE Multi-Linux Manager Settings Management', () => {
    beforeEach(() => {
      settingsPage.clearSMLMSettings();
      settingsPage.refresh();
    });

    it('should show empty settings', () => {
      settingsPage.smlmUrlHasExpectedValue('https://');
      settingsPage.smlmCaCertUploadDateHasExpectedValue('-');
      settingsPage.smlmUsernameHasExpectedValue('.....');
      settingsPage.smlmPasswordHasExpectedValue('.....');
    });

    describe('Saving Settings', () => {
      it('should show empty settings edit form', () => {
        settingsPage.clickSmlmEditSettingsButton();
        settingsPage.smlmUrlInputIsEmpty();
        settingsPage.smlmCaCertIsEmpty();
        settingsPage.smlmRemoveCaCertButtonIsNotDisplayed();
        settingsPage.smlmUsernameInputIsEmpty();
        settingsPage.smlmPasswordInputIsEmpty();
        settingsPage.smlmRemovePasswordButtonIsNotDisplayed();
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
          settingsPage.smlmSettingsAreCorrectlyChanged();
        });
      });
    });

    describe('Clearing Settings', () => {
      it('should clear existing settings', () => {
        settingsPage.saveDefaultSMLMSettings();
        settingsPage.refresh();
        settingsPage.waitForRequest('smlmSettingsEndpoint');

        settingsPage.smlmUrlHasExpectedValue();
        settingsPage.smlmCaCertUploadDateHasExpectedValue();
        settingsPage.smlmUsernameHasExpectedValue();
        settingsPage.smlmPasswordHasExpectedValue('•••••');

        settingsPage.clearSmlmSettings();
        settingsPage.waitForRequest('smlmSettingsEndpoint');

        settingsPage.smlmUrlHasExpectedValue('https://');
        settingsPage.smlmCaCertUploadDateHasExpectedValue('-');
        settingsPage.smlmUsernameHasExpectedValue('.....');
        settingsPage.smlmPasswordHasExpectedValue('.....');
      });

      it('should succeed even though settings do not exist', () => {
        settingsPage.clearSMLMSettings();
        settingsPage.refresh();
        settingsPage.waitForRequest('smlmSettingsEndpoint');

        settingsPage.smlmUrlHasExpectedValue('https://');
        settingsPage.smlmCaCertUploadDateHasExpectedValue('-');
        settingsPage.smlmUsernameHasExpectedValue('.....');
        settingsPage.smlmPasswordHasExpectedValue('.....');

        settingsPage.clearSmlmSettings();
        settingsPage.waitForRequest('smlmSettingsEndpoint');

        settingsPage.smlmUrlHasExpectedValue('https://');
        settingsPage.smlmCaCertUploadDateHasExpectedValue('-');
        settingsPage.smlmUsernameHasExpectedValue('.....');
        settingsPage.smlmPasswordHasExpectedValue('.....');
      });
    });

    describe('Testing Connection', () => {
      it('should be disabled when there are no settings', () => {
        settingsPage.clearSMLMSettings();
        settingsPage.refresh();
        settingsPage.waitForRequest('smlmSettingsEndpoint');
        settingsPage.smlmConnectionButtonIsDisabled();
      });

      describe('Testing against saved settings', () => {
        beforeEach(() => {
          settingsPage.saveDefaultSMLMSettings();
          settingsPage.refresh();
        });

        it('should succeed', () => {
          settingsPage.interceptTestSMLMSettingsRequest(200);
          settingsPage.clickSmlmConnectionTestButton();
          settingsPage.showExpectedToasterAfterTestingSMLM('succeeded');
        });

        it('should fail', () => {
          settingsPage.interceptTestSMLMSettingsRequest(422);
          settingsPage.clickSmlmConnectionTestButton();
          settingsPage.showExpectedToasterAfterTestingSMLM('failed');
        });
      });
    });
  });

  describe('Alerting Settings enforced from env', () => {
    before(function () {
      settingsPage.getAlertingSettings().then((resp) => {
        if (!resp.body.enforced_from_env) {
          // alerting settings are not enforced from env in this environment
          this.skip();
        }
      });
    });

    it('should be displayed correctly', () => {
      settingsPage.alertingConfigDisplaysDevEnvValues();
    });

    it('should have an edit button that is disabled', () => {
      settingsPage.alertingEditButtonIsDisabled();
    });
  });

  describe('Activity log', () => {
    describe('Changing Settings', () => {
      it('should change retention time', () => {
        settingsPage.clickEditActivityLogSettingsButton();
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

  describe('Check executions settings', () => {
    before(() => settingsPage.apiSetDefaultChecksFrequencySettings());

    afterEach(() => settingsPage.apiSetDefaultChecksFrequencySettings());

    it('should show the default frequency', () => {
      settingsPage.checksFrequencyIsTheExpected('Every 5 mins');
    });

    it('should change the frequency', () => {
      settingsPage.clickChecksFrequencyEditButton();
      settingsPage.selectChecksFrequency(6, 'Hours');
      settingsPage.clickChecksFrequencySaveButton();
      settingsPage.checksFrequencySettingsModalIsNotDisplayed();
      settingsPage.checksFrequencyIsTheExpected('Every 6 hours');
      settingsPage.refresh();
      settingsPage.checksFrequencyIsTheExpected('Every 6 hours');
    });

    it('should keep the frequency while the periodic checks are disabled', () => {
      settingsPage.clickChecksFrequencyEditButton();
      settingsPage.selectChecksFrequency(6, 'Hours');
      settingsPage.toggleChecksFrequencyEnabled();
      settingsPage.clickChecksFrequencySaveButton();
      settingsPage.checksFrequencyIsTheExpected('Disabled');
      settingsPage.refresh();
      settingsPage.checksFrequencyIsTheExpected('Disabled');
      settingsPage.clickChecksFrequencyEditButton();
      settingsPage.toggleChecksFrequencyEnabled();
      settingsPage.clickChecksFrequencySaveButton();
      settingsPage.checksFrequencyIsTheExpected('Every 6 hours');
    });

    it('should not change the settings when closing the modal', () => {
      settingsPage.clickChecksFrequencyEditButton();
      settingsPage.selectChecksFrequency(6, 'Hours');
      settingsPage.toggleChecksFrequencyEnabled();
      settingsPage.clickChecksFrequencyCloseButton();
      settingsPage.checksFrequencySettingsModalIsNotDisplayed();
      settingsPage.checksFrequencyIsTheExpected('Every 5 mins');
      settingsPage.changeChecksFrequencySettingsEndpointIsNotCalled();
      settingsPage.clickChecksFrequencyEditButton();
      settingsPage.checksFrequencyFormShows({
        enabled: true,
        value: 5,
        unit: 'Minutes',
      });
    });

    it('should show an error when the settings cannot be saved', () => {
      settingsPage.interceptChecksFrequencySettingsUpdateWithServerError();
      settingsPage.clickChecksFrequencyEditButton();
      settingsPage.selectChecksFrequency(6, 'Hours');
      settingsPage.clickChecksFrequencySaveButton();
      settingsPage.checksFrequencySettingsErrorIsDisplayed(
        'Something went wrong.'
      );
      settingsPage.clickChecksFrequencyCloseButton();
      settingsPage.checksFrequencyIsTheExpected('Every 5 mins');
    });

    it('should reload the settings after a connection error', () => {
      settingsPage.interceptChecksFrequencySettingsFetchWithNetworkError();
      settingsPage.refresh();
      settingsPage.checksFrequencyLoadingErrorIsDisplayed();
      settingsPage.clickChecksFrequencyReloadButton();
      settingsPage.checksFrequencyIsTheExpected('Every 5 mins');
    });
  });

  describe('Page reload after refresh token flow', () => {
    it('should reload all settings data after refresh token flow', () => {
      settingsPage.waitForInitialDataFetch();

      settingsPage.goNavigationMenuItem('Dashboard');
      settingsPage.clearAccessTokenFromStorage();
      settingsPage.interceptRefreshTokenRequest();
      settingsPage.goNavigationMenuItem('Settings');

      settingsPage.checkSettingsEndpointsRequestsAreForbidden(true);
      settingsPage.waitForRefreshRequest();
      // repeat check to see the requests are retried but not forbidden again
      settingsPage.checkSettingsEndpointsRequestsAreForbidden(false);
      // check only one refresh token request is done
      settingsPage.checkRefreshRequestCount(1);
    });
  });

  describe('Forbidden actions', () => {
    beforeEach(() => {
      settingsPage.saveDefaultSMLMSettings();
      settingsPage.apiDeleteAllUsers();
      settingsPage.logout();
    });

    it('should enable settings buttons if the user has the correct abilities', () => {
      settingsPage.saveDefaultSMLMSettings();
      settingsPage.apiCreateUserWithSettingsAbilities();
      settingsPage.apiAcceptAnalyticsEula();
      settingsPage.loginWithAbilities();
      settingsPage.visit();
      settingsPage.generateApiKeyButtonIsEnabled();
      settingsPage.smlmConnectionTestButtonIsEnabled();
      settingsPage.smlmEditSettingsButtonIsEnabled();
      settingsPage.smlmClearSettingsButtonIsEnabled();
      settingsPage.activityLogsEditButtonIsEnabled();
      settingsPage.checksFrequencyEditButtonIsEnabled();
      settingsPage.alertingTestEmailButtonIsEnabled();
    });

    it('should disable settings buttons if the user has no abilities', () => {
      settingsPage.apiCreateUserWithoutAbilities();
      settingsPage.apiAcceptAnalyticsEula();
      settingsPage.loginWithAbilities();
      settingsPage.visit();
      settingsPage.generateApiKeyButtonIsDisabled();
      settingsPage.smlmConnectionTestButtonIsEnabled();
      settingsPage.smlmEditSettingsButtonIsDisabled();
      settingsPage.smlmClearSettingsButtonIsDisabled();
      settingsPage.activityLogsEditButtonIsDisabled();
      settingsPage.checksFrequencyEditButtonIsDisabled();
      settingsPage.alertingTestEmailButtonIsDisabled();
    });
  });
});
