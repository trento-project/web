import * as checksSelectionPage from '../pageObject/checks_customization_po';

context('Checks customization', () => {
  before(() => {
    checksSelectionPage.preloadTestData();
  });

  beforeEach(() => {
    checksSelectionPage.resetAllChecks();
  });

  after(() => {
    checksSelectionPage.resetAllChecks();
  });

  describe('Checks customization should be possible for a cluster target', () => {
    beforeEach(() => {
      checksSelectionPage.visitChecksSelectionCluster();
      checksSelectionPage.clickOnCheckSelectionButton();
    });

    it('should customize and reset a check through the modal successfully', () => {
      // User opens check customization for corosync checks
      checksSelectionPage.corosyncCategoryClick();
      checksSelectionPage.openCustomizationModalFirstCheck();

      // validate if initial check customization modal has the correct values
      checksSelectionPage.validateFirstCheckId();
      checksSelectionPage.validateFirstCheckDescription();
      checksSelectionPage.modalWarningCheckBoxShouldNotBeChecked();
      checksSelectionPage.validateWarningMessage();
      checksSelectionPage.validateFirstCheckValueNameAndDefaultValue();
      checksSelectionPage.validateCurrentValueFromWandaFirstCheck();
      checksSelectionPage.validateProvider();
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

      // Validate check was modified
      checksSelectionPage.customizedCheckShouldHaveModifiedPill();
      checksSelectionPage.openCustomizationModalFirstCheckAfterCustomization();
      checksSelectionPage.validateCustomizedValue();
      // Reset check in the modal
      checksSelectionPage.userClickResetModalButton();
      checksSelectionPage.validateResetWarningText();
      checksSelectionPage.userClickResetButton();
      // Validate if check was reset in overview
      checksSelectionPage.checkCustomizationResetToastIsShown();
      checksSelectionPage.customizedCheckShouldNotHaveModifiedPill();
      checksSelectionPage.resetIconShouldNotExistInOverview();
      // Great check was customized and reset correctly
    });

    it('should customize check values in the check customization modal and reset check in checks category overview', () => {
      // open checks category
      checksSelectionPage.corosyncCategoryClick();
      checksSelectionPage.openCustomizationModalFirstCheck();
      // user interacts with modal
      checksSelectionPage.userClickOnWarningCheckbox();
      checksSelectionPage.userInputCustomCheckValue();
      checksSelectionPage.userClickModalSaveButton();
      checksSelectionPage.checkCustomizationSuccessToastIsShown();
      // user resets check in overview
      checksSelectionPage.userClickResetCustomizedCheck();
      checksSelectionPage.userClickResetButton();
      // validate if check was reset
      checksSelectionPage.checkCustomizationResetToastIsShown();
      checksSelectionPage.customizedCheckShouldNotHaveModifiedPill();
      checksSelectionPage.resetIconShouldNotExistInOverview();
    });

    it('should customize check values after fixing wrong user input', () => {
      // User opens check customization for Corosync Checks
      checksSelectionPage.corosyncCategoryClick();
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
      checksSelectionPage.checkCustomizationSuccessToastIsShown();
      checksSelectionPage.customizedCheckShouldHaveModifiedPill();
    });

    it('should not customize check values if the user input is invalid', () => {
      // User opens check customization for Corosync Checks
      checksSelectionPage.corosyncCategoryClick();
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
