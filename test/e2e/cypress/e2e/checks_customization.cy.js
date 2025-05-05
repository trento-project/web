import * as checksSelectionPage from '../pageObject/checks_customization_po';

context('Checks customization', () => {
  before(() => {
    checksSelectionPage.preloadTestData();
  });

  beforeEach(() => {
    checksSelectionPage.apiResetAllChecks();
    checksSelectionPage.apiResetCheckSelection();
    checksSelectionPage.visitChecksSelectionCluster();
    checksSelectionPage.clickCorosyncCategory();
  });

  after(() => {
    checksSelectionPage.apiResetAllChecks();
  });

  describe('Checks customization should be possible for a cluster target', () => {
    it('should customize and reset a check through the modal successfully', () => {
      checksSelectionPage.openCheckCustomizationModal('00081D');
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
      // Check default button status of a non customized check
      checksSelectionPage.modalSaveButtonShouldBeDisabled();
      checksSelectionPage.modalResetCheckButtonShouldBeDisabled();
      checksSelectionPage.modalCloseButtonShouldBeEnabled();
      // User interacts with modal
      checksSelectionPage.clickOnWarningCheckbox();
      checksSelectionPage.modalWarningCheckBoxShouldBeChecked();
      checksSelectionPage.inputCheckValue('expected_max_messages', '100');
      checksSelectionPage.modalSaveButtonShouldBeEnabled();
      checksSelectionPage.clickModalSaveButton();
      checksSelectionPage.checkCustomizationSuccessToastIsShown();
      // Validate if check was customized
      checksSelectionPage.customizedCheckShouldHaveModifiedPill();
      checksSelectionPage.openCheckCustomizationModal('00081D');
      checksSelectionPage.validateCustomizedValue();
      // Reset check in the modal
      checksSelectionPage.clickResetCheckModalButton();
      checksSelectionPage.validateResetModalTitle();
      checksSelectionPage.validateResetModalWarningText();
      checksSelectionPage.clickResetModalButton();
      // Validate if check was reset in overview
      checksSelectionPage.checkCustomizationResetToastIsShown();
      checksSelectionPage.customizedCheckShouldNotHaveModifiedPill();
      checksSelectionPage.resetIconShouldNotExistInOverview();
    });

    it('should customize check values in the check customization modal and reset check in checks category overview', () => {
      checksSelectionPage.openCheckCustomizationModal('00081D');
      // User interacts with modal
      checksSelectionPage.clickOnWarningCheckbox();
      checksSelectionPage.inputCheckValue('expected_max_messages', '100');
      checksSelectionPage.clickModalSaveButton();
      checksSelectionPage.checkCustomizationSuccessToastIsShown();
      // User resets check in overview
      checksSelectionPage.clickResetCustomizedCheck();
      checksSelectionPage.clickResetButton();
      // Validate if check was reset
      checksSelectionPage.checkCustomizationResetToastIsShown();
      checksSelectionPage.customizedCheckShouldNotHaveModifiedPill();
      checksSelectionPage.resetIconShouldNotExistInOverview();
    });

    it('should customize check values after fixing wrong user input', () => {
      checksSelectionPage.openCheckCustomizationModal('156F64');
      // User interact with modal
      checksSelectionPage.validateSecondCheckId();
      checksSelectionPage.clickOnWarningCheckbox();
      checksSelectionPage.modalWarningCheckBoxShouldBeChecked();
      checksSelectionPage.inputCheckValue('expected_token_timeout', '30000a');
      checksSelectionPage.modalSaveButtonShouldBeEnabled();
      checksSelectionPage.clickModalSaveButton();
      checksSelectionPage.inputValidationErrorShouldBeDisplayed();
      checksSelectionPage.checkCustomizationErrorToastIsShown();
      checksSelectionPage.modalSaveButtonShouldBeDisabled();
      checksSelectionPage.modalResetCheckButtonShouldBeDisabled();
      checksSelectionPage.modalCloseButtonShouldBeEnabled();
      checksSelectionPage.inputCheckValue('expected_token_timeout', '30000');
      checksSelectionPage.modalSaveButtonShouldBeEnabled();
      checksSelectionPage.clickModalSaveButton();
      // Validate overview
      checksSelectionPage.checkCustomizationSuccessToastIsShown();
      checksSelectionPage.customizedCheckShouldHaveModifiedPill();
    });

    it('should not customize check values if the user input is invalid', () => {
      checksSelectionPage.openCheckCustomizationModal('156F64');
      // User interact with modal
      checksSelectionPage.clickOnWarningCheckbox();
      checksSelectionPage.modalWarningCheckBoxShouldBeChecked();
      checksSelectionPage.inputCheckValue('expected_token_timeout', '30000a');
      checksSelectionPage.modalSaveButtonShouldBeEnabled();
      checksSelectionPage.clickModalSaveButton();
      checksSelectionPage.inputValidationErrorShouldBeDisplayed();
      checksSelectionPage.checkCustomizationErrorToastIsShown();
      checksSelectionPage.modalSaveButtonShouldBeDisabled();
      checksSelectionPage.modalResetCheckButtonShouldBeDisabled();
      // User closes modal
      checksSelectionPage.clickCloseButton();
      // Check that the overview does not show any modified elements
      checksSelectionPage.customizedCheckShouldNotHaveModifiedPill();
      checksSelectionPage.resetIconShouldNotExistInOverview();
    });
  });

  describe('Execution with customized check values', () => {
    it('should run a checks execution with customized check values', () => {
      checksSelectionPage.openCheckCustomizationModal('00081D');
      checksSelectionPage.clickOnWarningCheckbox();
      checksSelectionPage.inputCheckValue('expected_max_messages', '100');
      checksSelectionPage.clickModalSaveButton();
      checksSelectionPage.clickCorosyncSelectionToggle();
      checksSelectionPage.clickSaveChecksSelectionButton();
      checksSelectionPage.clickStartExecutionButton();
      checksSelectionPage.waitForCustomizedCheckElements();
      checksSelectionPage.clickOnCheckResultDescription();
      checksSelectionPage.clickModifiedCheckExpectations();
      checksSelectionPage.validateCheckStatus();
      checksSelectionPage.validateEvaluationResultsDescription();
      checksSelectionPage.validateEvaluationResultsModifiedPill();
      checksSelectionPage.validateCusomValue();
      checksSelectionPage.vailidateGatheredFactsValue();
    });
  });
});
