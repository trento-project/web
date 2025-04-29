import * as checksSelectionPage from '../pageObject/checks_customization_po';

const COROSYN_MAX_MESSAGES_CHECK_ID = '00081D';
const CHECK_COROSYNC_TOKEN_TIMEOUT = '156F64';
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
      checksSelectionPage.clickCorosyncCategory();
    });

    it('should customize and reset a check through the modal successfully', () => {
      checksSelectionPage.openCheckCustomizationModal(
        COROSYN_MAX_MESSAGES_CHECK_ID
      );
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
      checksSelectionPage.inputCustomCheckValue();
      checksSelectionPage.modalSaveButtonShouldBeEnabled();
      checksSelectionPage.clickModalSaveButton();
      checksSelectionPage.checkCustomizationSuccessToastIsShown();
      // Validate if check was customized
      checksSelectionPage.customizedCheckShouldHaveModifiedPill();
      checksSelectionPage.openCheckCustomizationModal(
        COROSYN_MAX_MESSAGES_CHECK_ID
      );
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
      checksSelectionPage.openCheckCustomizationModal(
        COROSYN_MAX_MESSAGES_CHECK_ID
      );
      // User interacts with modal
      checksSelectionPage.clickOnWarningCheckbox();
      checksSelectionPage.inputCustomCheckValue();
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
      checksSelectionPage.openCheckCustomizationModal(
        CHECK_COROSYNC_TOKEN_TIMEOUT
      );
      // User interact with modal
      checksSelectionPage.validateSecondCheckId();
      checksSelectionPage.clickOnWarningCheckbox();
      checksSelectionPage.modalWarningCheckBoxShouldBeChecked();
      checksSelectionPage.inputInvalidCheckValue();
      checksSelectionPage.modalSaveButtonShouldBeEnabled();
      checksSelectionPage.clickModalSaveButton();
      checksSelectionPage.inputValidationErrorShouldBeDisplayed();
      checksSelectionPage.checkCustomizationErrorToastIsShown();
      checksSelectionPage.modalSaveButtonShouldBeDisabled();
      checksSelectionPage.modalResetCheckButtonShouldBeDisabled();
      checksSelectionPage.modalCloseButtonShouldBeEnabled();
      checksSelectionPage.inputCustomCheckValue();
      checksSelectionPage.modalSaveButtonShouldBeEnabled();
      checksSelectionPage.clickModalSaveButton();
      // Validate overview
      checksSelectionPage.checkCustomizationSuccessToastIsShown();
      checksSelectionPage.customizedCheckShouldHaveModifiedPill();
    });

    it('should not customize check values if the user input is invalid', () => {
      checksSelectionPage.openCheckCustomizationModal(
        CHECK_COROSYNC_TOKEN_TIMEOUT
      );
      // User interact with modal
      checksSelectionPage.clickOnWarningCheckbox();
      checksSelectionPage.modalWarningCheckBoxShouldBeChecked();
      checksSelectionPage.inputInvalidCheckValue();
      checksSelectionPage.modalSaveButtonShouldBeEnabled();
      checksSelectionPage.clickModalSaveButton();
      checksSelectionPage.inputValidationErrorShouldBeDisplayed();
      checksSelectionPage.checkCustomizationErrorToastIsShown();
      checksSelectionPage.modalSaveButtonShouldBeDisabled();
      checksSelectionPage.modalResetCheckButtonShouldBeDisabled();
      // User closes modal
      checksSelectionPage.clickCloseButton();
      // Check that the overview does not show any modified elements
      checksSelectionPage.secondCustomizedCheckShouldNotHaveModifiedPill();
      checksSelectionPage.resetIconShouldNotExistInOverview();
    });

  });

  describe('Execution with customized check values', () => {
    it('should run a checks execution with customized check values', () => {
      checksSelectionPage.openCheckCustomizationModal(
        COROSYN_MAX_MESSAGES_CHECK_ID
      );
      checksSelectionPage.clickOnWarningCheckbox();
      checksSelectionPage.inputCustomCheckValue();
      checksSelectionPage.clickModalSaveButton();
      checksSelectionPage.clickCorosyncSelectionToggle();
      checksSelectionPage.clickSaveChecksSelectionButton();
      checksSelectionPage.clickStartExecutionButton();
      checksSelectionPage.waitForCustomizedCheckElements();
      checksSelectionPage.clickOnCustomizedCheckDescription();
      checksSelectionPage.clickModifiedCheckExpectations();
      checksSelectionPage.validateCheckStatus();
      checksSelectionPage.validateEvaluationResultsDescription();
      checksSelectionPage.validateEvaluationResultsModifiedPill();
      checksSelectionPage.validateCusomValue();
      checksSelectionPage.vailidateGatheredFactsValue();
    })
  
    after(() => {
      checksSelectionPage.resetCorosyncCheckSelection();
    });
  });
});
