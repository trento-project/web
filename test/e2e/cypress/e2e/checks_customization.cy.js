import * as checksSelectionPage from '../pageObject/checks_customization_po';

context('Checks customization', () => {
  before(() => {
    checksSelectionPage.preloadTestData();
  });

  beforeEach(() => {
    checksSelectionPage.apiResetAllChecks();
  });

  after(() => {
    checksSelectionPage.apiResetAllChecks();
  });

  describe('Checks customization should be possible for a cluster target', () => {
    beforeEach(() => {
      checksSelectionPage.visitChecksSelectionCluster();
      checksSelectionPage.clickOnCheckSelectionButton();
      checksSelectionPage.corosyncCategoryClick();
    });

    it('should customize and reset a check through the modal successfully', () => {
      checksSelectionPage.openCustomizationModalFirstCheck();
      // Validate if initial check customization modal has the correct values
      checksSelectionPage.validateFirstCheckId();
      checksSelectionPage.validateFirstCheckDescription();
      checksSelectionPage.modalWarningCheckBoxShouldNotBeChecked();
      checksSelectionPage.validateWarningMessage();
      checksSelectionPage.validateFirstCheckValueNameAndDefaultValue();
      checksSelectionPage.validateCurrentValueFromWandaFirstCheck();
      checksSelectionPage.validateProviderLabel();
      checksSelectionPage.validateProviderValue();
      checksSelectionPage.providerIconShouldBeDisplayed();
      // Check default button status of an non customized check
      checksSelectionPage.modalSaveButtonShouldBeDisabled();
      checksSelectionPage.modalResetCheckButtonShouldBeDisabled();
      checksSelectionPage.modalCloseButtonShouldBeEnabled();
      // User interacts with modal
      checksSelectionPage.userClickOnWarningCheckbox();
      checksSelectionPage.modalWarningCheckBoxShouldBeChecked();
      checksSelectionPage.userInputCustomCheckValue();
      checksSelectionPage.modalSaveButtonShouldBeEnabled();
      checksSelectionPage.userClickModalSaveButton();
      checksSelectionPage.checkCustomizationSuccessToastIsShown();
      // Validate if check was customized
      checksSelectionPage.customizedCheckShouldHaveModifiedPill();
      checksSelectionPage.openCustomizationModalFirstCheck();
      checksSelectionPage.validateCustomizedValue();
      // Reset check in the modal
      checksSelectionPage.userClickResetCheckModalButton();
      checksSelectionPage.validateResetModalTitle();
      checksSelectionPage.validateResetModalWarningText();
      checksSelectionPage.userClickResetModalButton();
      // Validate if check was reset in overview
      checksSelectionPage.checkCustomizationResetToastIsShown();
      checksSelectionPage.customizedCheckShouldNotHaveModifiedPill();
      checksSelectionPage.resetIconShouldNotExistInOverview();
      // Great check was customized and reset correctly
    });

    it('should customize check values in the check customization modal and reset check in checks category overview', () => {
      checksSelectionPage.openCustomizationModalFirstCheck();
      // User interacts with modal
      checksSelectionPage.userClickOnWarningCheckbox();
      checksSelectionPage.userInputCustomCheckValue();
      checksSelectionPage.userClickModalSaveButton();
      checksSelectionPage.checkCustomizationSuccessToastIsShown();
      // User resets check in overview
      checksSelectionPage.userClickResetCustomizedCheck();
      checksSelectionPage.userClickResetButton();
      // Validate if check was reset
      checksSelectionPage.checkCustomizationResetToastIsShown();
      checksSelectionPage.customizedCheckShouldNotHaveModifiedPill();
      checksSelectionPage.resetIconShouldNotExistInOverview();
    });

    it('should customize check values after fixing wrong user input', () => {
      checksSelectionPage.openCustomizationModalSecondCheck();
      // User interact with modal
      checksSelectionPage.validateSecondCheckId();
      checksSelectionPage.userClickOnWarningCheckbox();
      checksSelectionPage.modalWarningCheckBoxShouldBeChecked();
      checksSelectionPage.userInputInvalidCheckValue();
      checksSelectionPage.modalSaveButtonShouldBeEnabled();
      checksSelectionPage.userClickModalSaveButton();
      checksSelectionPage.userInputValidationErrorShouldBeDisplayed();
      checksSelectionPage.checkCustomizationErrorToastIsShown();
      checksSelectionPage.modalSaveButtonShouldBeDisabled();
      checksSelectionPage.modalResetCheckButtonShouldBeDisabled();
      checksSelectionPage.modalCloseButtonShouldBeEnabled();
      checksSelectionPage.userInputCustomCheckValue();
      checksSelectionPage.modalSaveButtonShouldBeEnabled();
      checksSelectionPage.userClickModalSaveButton();
      // Validate overview
      checksSelectionPage.checkCustomizationSuccessToastIsShown();
      checksSelectionPage.customizedCheckShouldHaveModifiedPill();
    });

    it('should not customize check values if the user input is invalid', () => {
      checksSelectionPage.openCustomizationModalSecondCheck();
      // User interact with modal
      checksSelectionPage.userClickOnWarningCheckbox();
      checksSelectionPage.modalWarningCheckBoxShouldBeChecked();
      checksSelectionPage.userInputInvalidCheckValue();
      checksSelectionPage.modalSaveButtonShouldBeEnabled();
      checksSelectionPage.userClickModalSaveButton();
      checksSelectionPage.userInputValidationErrorShouldBeDisplayed();
      checksSelectionPage.checkCustomizationErrorToastIsShown();
      checksSelectionPage.modalSaveButtonShouldBeDisabled();
      checksSelectionPage.modalResetCheckButtonShouldBeDisabled();
      // User closes modal
      checksSelectionPage.userClickCloseButton();
      // Check that the overview does not show any modified elements
      checksSelectionPage.secondCustomizedCheckShouldNotHaveModifiedPill();
      checksSelectionPage.resetIconShouldNotExistInOverview();
    });
  });
});
