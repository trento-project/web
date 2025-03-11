export * from './base_po.js';
import * as basePage from './base_po.js';

import { userFactory } from '@lib/test-utils/factories/users';

const url = '/users';
export const PASSWORD = 'password';
export const USER = userFactory.build({ username: 'e2etest' });

// UI Element Selectors
const createUserButton = 'button:contains("Create User")';
const adminUserName = 'tbody tr:nth-child(1) a';
const newUserName = 'tbody tr:nth-child(2) a:nth-child(1)';
const newUserEmail = 'tbody tr:nth-child(2) p:nth-child(1)';
const newUserDeleteButton =
  'tbody tr:nth-child(2) td button:contains("Delete")';
const confirmDeleteUserButton =
  'div[id*="dialog-panel"]  button:contains("Delete")';
const usersTableRows = 'tbody tr';
const changePasswordButton = 'button:contains("Change Password")';
const fullNameInputField = 'input[aria-label="fullname"]';
const emailInputField = 'input[aria-label="email"]';
const userNameInputField = 'input[aria-label="username"]';
const currentPasswordInputField = 'input[aria-label="current_password"]';
const passwordInputField = 'input[aria-label="password"]';
const passwordConfirmationInputField =
  'input[aria-label^="password"][aria-label*="confirmation"]';
const saveNewPasswordButton = 'div[id*="panel"] button:contains("Save")';
const generatePasswordButton = 'div[class*="grid"] button[class*="green"]';
const submitUserCreationButton = 'button:contains("Create")';
const cancelUserCreationButton = 'button:contains("Cancel")';
const saveChangesButton = 'button:contains("Save")';
const authenticatorAppSwitch = 'button[role="switch"]';
const newTotpCodeIssuedMessage = 'div:contains("Your new TOTP secret is:")';
const totpSecret = `${newTotpCodeIssuedMessage} + div[class*="bold"]`;
const newTotpCodeInputField = 'input[placeholder="TOTP code"]';
const verifyTotpButton = 'button:contains("Verify")';
const confirmDisableTotpButton =
  'div[id*="headlessui-dialog-panel"] button:contains("Disable")';
const editUserTotpDropdown = 'button.totp-selection-dropdown';
const enableUserTotpOption = `${editUserTotpDropdown} + div div:contains("Enabled")`;

// Toaster Messages
const userAlreadyUpdatedWarning =
  'p:contains("Information has been updated by another user")';
const userCreatedSuccessfullyToaster =
  'div:contains("User created successfully")';
const userEditedSuccessfullyToaster =
  'div:contains("User edited successfully")';
const profileChangesSavedToaster = 'div:contains("Profile changes saved!")';
const passwordChangeToaster = 'p:contains("Password change is recommended.")';
const totpEnabledToaster = 'div:contains("TOTP Enabled")';
const userDeletedSuccesfullyToaster =
  'div:contains("User deleted successfully")';

// Error Messages
const requiredFieldsErrors = 'p[class*="text-red"]';
const usernameAlreadyTakenError = 'p:contains("Has already been taken")';
const invalidPasswordErrorLabel = 'p:contains("Is invalid")';
const totpEnrollmentErrorLabel =
  'p:contains("Totp code not valid for the enrollment procedure.")';

export const visit = (_url = url) => cy.visit(_url);

export const validateUrl = (_url = url) => {
  return cy.url().should('include', _url);
};

export const clickCreateUserButton = () => {
  return cy.get(createUserButton).click();
};

export const clickNewUserDeleteButton = () => {
  return cy.get(newUserDeleteButton).click();
};

export const clickConfirmDeleteUserButton = () => {
  return cy.get(confirmDeleteUserButton).click();
};

export const clickSaveNewPasswordButton = () => {
  return cy.get(saveNewPasswordButton).click();
};

export const clickAuthenticatorAppSwitch = () => {
  return cy.get(authenticatorAppSwitch).click();
};

export const clickGeneratePassword = () => {
  return cy.get(generatePasswordButton).click();
};

export const clickSubmitUserCreationButton = () => {
  return cy.get(submitUserCreationButton).click();
};

export const clickCancelUserCreation = () => {
  return cy.get(cancelUserCreationButton).click();
};

export const clickNewUser = () => {
  return cy.get(newUserName).click();
};

export const clickEditUserSaveButton = () => {
  return cy.get(saveChangesButton).click();
};

export const clickAdminUserName = () => {
  return cy.get(adminUserName).click();
};

export const clickChangePasswordButton = () => {
  return cy.get(changePasswordButton).click();
};

export const clickVerifyTotpButton = () => {
  return cy.get(verifyTotpButton).click();
};

export const clickDisableTotpButton = () => {
  return cy.get(confirmDisableTotpButton).click();
};

export const clickTotpDropdown = () => {
  return cy.get(editUserTotpDropdown).click();
};

export const typeUserFullName = (userFullName = USER.fullname) => {
  return cy.get(fullNameInputField).clear().type(userFullName);
};

export const typeUserEmail = (emailAddress = USER.email) => {
  return cy.get(emailInputField).type(emailAddress);
};

export const typeUserName = () => {
  return cy.get(userNameInputField).type(USER.username);
};

export const typeCurrentPassword = (currentPassword = PASSWORD) => {
  return cy.get(currentPasswordInputField).type(currentPassword);
};

export const typeUserPassword = (password = PASSWORD) => {
  return cy.get(passwordInputField).type(password);
};

export const typeUserPasswordConfirmation = (password = PASSWORD) => {
  return cy.get(passwordConfirmationInputField).type(password);
};

export const selectFromTotpDropdown = (choice) => {
  return basePage.selectFromDropdown(editUserTotpDropdown, choice);
};

export const getTotpSecret = () => {
  return cy.get(totpSecret).then((element) => element.text());
};

export const typeUserTotpCode = (totpSecret) =>
  basePage.typeNextGeneratedTotpCode(totpSecret, newTotpCodeInputField);

export const getSecretAndTypeTotpCode = () => {
  getTotpSecret().then((totpSecret) => {
    typeUserTotpCode(totpSecret);
  });
};

export const typeInvalidUserTotpCode = () => {
  return cy.get(newTotpCodeInputField).clear().type('invalid');
};

export const apiGetProfileInfo = (
  username = USER.username,
  password = PASSWORD
) => {
  return basePage.apiLogin(username, password).then(({ accessToken }) => {
    return cy
      .request({
        url: '/api/v1/profile',
        method: 'GET',
        auth: { bearer: accessToken },
        body: {},
      })
      .then(({ body: profile }) => {
        return profile;
      });
  });
};

export const apiDisableUser = () => {
  return apiGetProfileInfo().then(({ id }) => {
    apiPatchUser(id, { enabled: false });
  });
};

export const apiApplyAllUsersPermission = () => {
  return apiGetProfileInfo().then(({ id }) => {
    apiPatchUser(id, {
      abilities: [{ id: 2, name: 'all', resource: 'users', label: 'test' }],
    });
  });
};

export const apiCreateUser = () => {
  return basePage.apiLogin().then(({ accessToken }) => {
    const body = {
      fullname: USER.fullname,
      email: USER.email,
      enabled: true,
      username: USER.username,
      password: PASSWORD,
      password_confirmation: PASSWORD,
      abilities: [],
    };
    return cy.request({
      url: '/api/v1/users',
      method: 'POST',
      auth: { bearer: accessToken },
      body,
    });
  });
};

export const apiPatchUser = (id, payload) => {
  return basePage.apiLogin().then(({ accessToken }) =>
    cy
      .request({
        url: `/api/v1/users/${id}`,
        method: 'GET',
        auth: { bearer: accessToken },
      })
      .then(({ headers: { etag } }) => {
        cy.request({
          url: `/api/v1/users/${id}`,
          method: 'PATCH',
          auth: { bearer: accessToken },
          body: payload,
          headers: { 'if-match': etag },
        });
      })
  );
};

export const apiModifyUserFullName = () => {
  return getUserIdFromPath().then((id) =>
    apiPatchUser(id, { fullname: 'new_name' })
  );
};

export const getUserIdFromPath = () => {
  return cy.location().then(({ pathname }) => pathname.split('/')[2]);
};

export const deletedUserNameIsNotDisplayed = () => {
  return cy.get(newUserName).should('not.exist');
};

export const userDeletedSuccesfullyToasterIsDisplayed = () => {
  return cy.get(userDeletedSuccesfullyToaster).should('be.visible');
};

export const invalidCurrentPasswordErrorIsDisplayed = () => {
  return cy.get(invalidPasswordErrorLabel).should('be.visible');
};

export const validateRequiredFieldsErrors = () => {
  return cy.get(requiredFieldsErrors).should('have.length', 5);
};

export const invalidEmailErrorIsDisplayed = () => {
  return cy
    .contains(requiredFieldsErrors, 'Is not a valid email')
    .should('have.length', 1);
};

export const weakPasswordErrorIsDisplayed = () => {
  return cy
    .contains(requiredFieldsErrors, 'Should be at least 8 character(s)')
    .should('have.length', 1);
};

export const usernameAlreadyTakenErrorIsDisplayed = () => {
  return cy.get(usernameAlreadyTakenError).should('be.visible');
};

export const userCreatedSuccessfullyToasterIsDisplayed = () => {
  return cy.get(userCreatedSuccessfullyToaster).should('be.visible');
};

export const passwordChangeToasterIsDisplayed = () => {
  return cy.get(passwordChangeToaster).should('be.visible');
};

export const passwordChangeToasterIsNotDisplayed = () => {
  return cy.get(passwordChangeToaster).should('not.exist');
};

export const userWithModifiedNameIsDisplayed = (username) => {
  return cy.get(`p:contains("${username}")`).should('be.visible');
};

export const newUserIsDisplayed = (username, email) => {
  cy.get(usersTableRows).should('have.length', 2);
  cy.get(newUserName).contains(username);
  return cy.get(newUserEmail).contains(email);
};

export const saveButtonIsDisabled = () => {
  return cy.get(saveChangesButton).should('be.disabled');
};

export const userAlreadyUpdatedWarningIsDisplayed = () => {
  return cy.get(userAlreadyUpdatedWarning).should('be.visible');
};

export const userAlreadyUpdatedWarningIsNotDisplayed = () => {
  return cy.get(userAlreadyUpdatedWarning).should('not.exist');
};

export const userEditedSuccessfullyToasterIsDisplayed = () => {
  return cy.get(userEditedSuccessfullyToaster).should('be.visible');
};

export const changePasswordButtonIsDisabled = () => {
  return cy.get(changePasswordButton).should('be.disabled');
};

export const emailInputFieldHasExpectedValue = (email = USER.email) => {
  return cy.get(emailInputField).should('have.value', email);
};

export const usernameInputFieldHasExpectedValue = (
  username = USER.username
) => {
  return cy.get(userNameInputField).should('have.value', username);
};

export const profileChangesSavedToasterIsDisplayed = () => {
  return cy.get(profileChangesSavedToaster).should('be.visible');
};

export const newTotpCodeIssuedMessageIsDisplayed = () => {
  return cy.get(newTotpCodeIssuedMessage).should('be.visible');
};

export const totpEnrollmentErrorIsDisplayed = () => {
  return cy.get(totpEnrollmentErrorLabel).should('be.visible');
};

export const authenticatorAppSwitchIsEnabled = () => {
  return cy.get(authenticatorAppSwitch).should('be.enabled');
};

export const totpEnabledToasterIsDisplayed = () => {
  return cy.get(totpEnabledToaster).should('be.visible');
};

export const enableTotpOptionIsDisabled = () => {
  return cy
    .get(enableUserTotpOption)
    .invoke('attr', 'aria-disabled')
    .should('eq', 'true');
};

export const newIssuedTotpSecretIsDifferent = (originalTotpSecret) => {
  getTotpSecret().then((newTotpSecret) => {
    expect(
      newTotpSecret === originalTotpSecret,
      'New issued TOTP secret is different'
    ).to.be.false;
  });
};
