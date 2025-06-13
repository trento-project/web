import * as settingsPage from '../pageObject/settings_po';

describe('Alerting settings from DB', () => {
  before(function () {
    if (!Cypress.env('ALERTING_DB_TESTS')) {
      this.skip();
    }
  });

  beforeEach(() => {
    settingsPage.resetAlertingSettingsDB();
    settingsPage.visit();
    settingsPage.waitForRequest('alertingSettingsEndpoint');
  });

  describe('when not previously set', () => {
    it('should be displayed with their placeholder values', () => {
      settingsPage.alertingConfigDisplaysPlaceholderValues();
    });

    it('should show empty fields when edit modal is opened', () => {
      settingsPage.clickAlertingEditButton();
      settingsPage.alertingEditFormDisplaysEmptyFields();
    });

    it('should be created successfully', () => {
      settingsPage.clickAlertingEditButton();
      settingsPage.enterAlertingInitialSettings();
      settingsPage.alertingConfigDisplaysInitialValues();
    });
  });

  describe('when previously set', () => {
    beforeEach(() => {
      settingsPage.saveInitialAlertingSettings();
      settingsPage.refresh();
      settingsPage.waitForRequest('alertingSettingsEndpoint');
    });

    it('should display their current values', () => {
      settingsPage.alertingConfigDisplaysInitialValues();
    });

    it('should show current values when edit modal is opened', () => {
      settingsPage.clickAlertingEditButton();
      settingsPage.alertingEditFormDisplaysInitialSettings();
    });

    it('should be updated successfully without password', () => {
      settingsPage.clickAlertingEditButton();
      settingsPage.enterAlertingUpdateSettingsWithoutPassword();
      settingsPage.alertingConfigDisplaysUpdateValues();
    });

    it('should update successfully with password', () => {
      settingsPage.clickAlertingEditButton();
      settingsPage.enterAlertingUpdateSettingsWithPassword();
      settingsPage.alertingConfigDisplaysUpdateValues();
    });
  });

  describe('validation', () => {
    settingsPage.alertingErrorScenarios.forEach(
      ({
        name,
        valueConf: { values, removePasswordProtection },
        errorConf,
      }) => {
        it(`should fail when ${name}`, () => {
          settingsPage.clickAlertingEditButton();
          settingsPage.enterAlertingSettings(values, removePasswordProtection);
          settingsPage.showExpectedErrors(errorConf);
        });
      }
    );
  });

  describe('access control', () => {
    beforeEach(() => {
      settingsPage.apiDeleteAllUsers();
      settingsPage.logout();
    });

    it('should enable edit button if the user has the correct abilities', () => {
      settingsPage.apiCreateUserWithSettingsAbilities();
      settingsPage.loginWithAbilities();
      settingsPage.visit();
      settingsPage.alertingEditButtonIsEnabled();
    });

    it('should disable edit button if the user has no abilities', () => {
      settingsPage.apiCreateUserWithoutAbilities();
      settingsPage.loginWithAbilities();
      settingsPage.visit();
      settingsPage.alertingEditButtonIsDisabled();
    });
  });
});
