import * as checksSelectionPage from '../pageObject/checks_customization_po';

context('Checks customization', () => {
  before(() => {
    checksSelectionPage.preloadTestData();
  });

  beforeEach(() => {
    checksSelectionPage.resetAllChecks();
    checksSelectionPage.interceptCatalogRequest();
    checksSelectionPage.interceptLastExecutionRequest();
  });

  after(() => {
    checksSelectionPage.resetAllChecks();
  });

  describe('Checks customization should be possible for a cluster target', () => {
    beforeEach(() => {
      checksSelectionPage.visitChecksSelectionCluster();
      checksSelectionPage.clickOnCheckSelectionButton();
    });

    it('should customize and reset a check successfully', () => {
      // User opens check customization for Corosync Checks
      checksSelectionPage.corosyncCategoryClick();
      checksSelectionPage.openCustomizationModalFirstCheck();

      // validate if inital check customization modal has the correct values
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
      checksSelectionPage.checkCustomizationToastIsShown();
      // check customization modal should close

      // Validate check was modified
      checksSelectionPage.customizedCheckShouldHaveModifiedPill();
      checksSelectionPage.openCustomizationModalFirstCheckAfterCustomization();
      checksSelectionPage.validateCustomizedValue();
      // Reset check in the modal
      checksSelectionPage.userClickResetModalButton();
      checksSelectionPage.userClickResetButton();
      // Validate if check was reset in overview
      checksSelectionPage.checkCustomizationResetToastIsShown();
      checksSelectionPage.customizedCheckShouldNotHaveModifiedPill();
      checksSelectionPage.resetIconShouldNotExistInOverview();
      // Great check was customized and reseted correctly
    });

    it('should customize check values in the check customization modal and reset check in checks category overview', () => {
      // open checks category
      checksSelectionPage.corosyncCategoryClick();
      checksSelectionPage.openCustomizationModalFirstCheck();
      // user interacts with modal
      checksSelectionPage.userClickOnWarningCheckbox();
      checksSelectionPage.userInputCustomCheckValue();
      checksSelectionPage.userClickModalSaveButton();
      // user resets check in overview
      checksSelectionPage.userResetCustomizedCheck();
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
      checksSelectionPage.userClickOnWarningCheckbox();
      checksSelectionPage.modalWarningCheckBoxShouldBeChecked();
      checksSelectionPage.userInputInvalidCheckValue();
      checksSelectionPage.modalSaveButtonShouldBeEnabled();
      checksSelectionPage.userClickModalSaveButton();

      // check that the modal is still open
      checksSelectionPage.userInputValidationErrorShouldBeDisplayed();
      checksSelectionPage.checkCustomizationErrorToastIsShown();
      checksSelectionPage.modalSaveButtonShouldBeEnabled();
      checksSelectionPage.modalResetCheckButtonShouldBeDisabled();
      checksSelectionPage.modalCloseButtonShouldBeEnabled();

      checksSelectionPage.userInputCustomCheckValue();
      checksSelectionPage.modalSaveButtonShouldBeEnabled();
      checksSelectionPage.userClickModalSaveButton();
      checksSelectionPage.checkCustomizationToastIsShown();
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
      // Check if input was validated
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
