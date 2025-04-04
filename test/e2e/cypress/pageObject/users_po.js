export * from './base_po.js';
import * as basePage from './base_po.js';

import { userFactory } from '@lib/test-utils/factories/users';

// Test data
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
const usersListAdminUser = `a:contains("${basePage.adminUser.username}")`;
const usersListPlainUser = `a:contains("${basePage.plainUser.username}")`;
const permissionsDropdown = 'label:contains("Permissions") + div';
const statusDropdown = 'button.status-selection-dropdown';
const removePermissionButton = 'div[aria-label*="Remove"] svg';
const permissionsInputField =
  'label:contains("Permissions") + div span div div:eq(0)';

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

// UI Interactions

export const visit = (_url = url) => cy.visit(_url);

export const validateUrl = (_url = url) => cy.url().should('include', _url);

export const clickCreateUserButton = () => cy.get(createUserButton).click();

export const clickNewUserDeleteButton = () =>
  cy.get(newUserDeleteButton).click();

export const clickConfirmDeleteUserButton = () =>
  cy.get(confirmDeleteUserButton).click();

export const clickSaveNewPasswordButton = () =>
  cy.get(saveNewPasswordButton).click();

export const clickAuthenticatorAppSwitch = () =>
  cy.get(authenticatorAppSwitch).click();

export const clickGeneratePassword = () =>
  cy.get(generatePasswordButton).click();

export const clickSubmitUserCreationButton = () =>
  cy.get(submitUserCreationButton).click();

export const clickCancelUserCreation = () =>
  cy.get(cancelUserCreationButton).click();

export const clickNewUser = () => cy.get(newUserName).click();

export const clickEditUserSaveButton = () => cy.get(saveChangesButton).click();

export const clickSaveUserButton = () => cy.get(saveChangesButton).click();

export const clickAdminUserName = () => cy.get(adminUserName).click();

export const clickChangePasswordButton = () =>
  cy.get(changePasswordButton).click();

export const clickVerifyTotpButton = () => cy.get(verifyTotpButton).click();

export const clickDisableTotpButton = () =>
  cy.get(confirmDisableTotpButton).click();

export const clickTotpDropdown = () => cy.get(editUserTotpDropdown).click();

export const typeUserFullName = (userFullName = USER.fullname) =>
  cy.get(fullNameInputField).clear().type(userFullName);

export const typeUserEmail = (emailAddress = USER.email) =>
  cy.get(emailInputField).type(emailAddress);

export const typeUserName = () =>
  cy.get(userNameInputField).type(USER.username);

export const typeCurrentPassword = (currentPassword = PASSWORD) =>
  cy.get(currentPasswordInputField).type(currentPassword);

export const typeUserPassword = (password = PASSWORD) =>
  cy.get(passwordInputField).type(password);

export const typeUserPasswordConfirmation = (password = PASSWORD) =>
  cy.get(passwordConfirmationInputField).type(password);

export const selectFromTotpDropdown = (choice) =>
  basePage.selectFromDropdown(editUserTotpDropdown, choice);

export const getTotpSecret = () =>
  cy.get(totpSecret).then((element) => element.text());

export const typeUserTotpCode = (totpSecret) =>
  basePage.typeNextGeneratedTotpCode(totpSecret, newTotpCodeInputField);

export const getSecretAndTypeTotpCode = () =>
  getTotpSecret().then((totpSecret) => {
    typeUserTotpCode(totpSecret);
  });

export const typeInvalidUserTotpCode = () =>
  cy.get(newTotpCodeInputField).clear().type('invalid');

export const clickPlainUserInList = () => cy.get(usersListPlainUser).click();

export const clickPermissionsDropdown = () =>
  cy.get(permissionsDropdown).click();

export const selectPermission = (permission) =>
  cy.get(`span:contains("${permission}")`).click();

export const clickRemovePermissionButton = () =>
  cy.get(removePermissionButton).click();

// UI Validations

export const deletedUserNameIsNotDisplayed = () =>
  cy.get(newUserName).should('not.exist');

export const userDeletedSuccesfullyToasterIsDisplayed = () =>
  cy.get(userDeletedSuccesfullyToaster).should('be.visible');

export const invalidCurrentPasswordErrorIsDisplayed = () =>
  cy.get(invalidPasswordErrorLabel).should('be.visible');

export const validateRequiredFieldsErrors = () =>
  cy.get(requiredFieldsErrors).should('have.length', 5);

export const invalidEmailErrorIsDisplayed = () =>
  cy
    .contains(requiredFieldsErrors, 'Is not a valid email')
    .should('have.length', 1);

export const weakPasswordErrorIsDisplayed = () =>
  cy
    .contains(requiredFieldsErrors, 'Should be at least 8 character(s)')
    .should('have.length', 1);

export const usernameAlreadyTakenErrorIsDisplayed = () =>
  cy.get(usernameAlreadyTakenError).should('be.visible');

export const userCreatedSuccessfullyToasterIsDisplayed = () =>
  cy.get(userCreatedSuccessfullyToaster).should('be.visible');

export const passwordChangeToasterIsDisplayed = () =>
  cy.get(passwordChangeToaster).should('be.visible');

export const passwordChangeToasterIsNotDisplayed = () =>
  cy.get(passwordChangeToaster).should('not.exist');

export const userWithModifiedNameIsDisplayed = (username) =>
  cy.get(`p:contains("${username}")`).should('be.visible');

export const newUserIsDisplayed = (username, email) => {
  cy.get(usersTableRows).should('have.length', 2);
  cy.get(newUserName).contains(username);
  return cy.get(newUserEmail).contains(email);
};

export const saveButtonIsDisabled = () =>
  cy.get(saveChangesButton).should('be.disabled');

export const userAlreadyUpdatedWarningIsDisplayed = () =>
  cy.get(userAlreadyUpdatedWarning).should('be.visible');

export const userAlreadyUpdatedWarningIsNotDisplayed = () =>
  cy.get(userAlreadyUpdatedWarning).should('not.exist');

export const userEditedSuccessfullyToasterIsDisplayed = () =>
  cy.get(userEditedSuccessfullyToaster).should('be.visible');

export const changePasswordButtonIsDisabled = () =>
  cy.get(changePasswordButton).should('be.disabled');

export const emailInputFieldHasExpectedValue = (email = USER.email) =>
  cy.get(emailInputField).should('have.value', email);

export const usernameInputFieldHasExpectedValue = (username = USER.username) =>
  cy.get(userNameInputField).should('have.value', username);

export const profileChangesSavedToasterIsDisplayed = () =>
  cy.get(profileChangesSavedToaster).should('be.visible');

export const newTotpCodeIssuedMessageIsDisplayed = () =>
  cy.get(newTotpCodeIssuedMessage).should('be.visible');

export const totpEnrollmentErrorIsDisplayed = () =>
  cy.get(totpEnrollmentErrorLabel).should('be.visible');

export const authenticatorAppSwitchIsEnabled = () =>
  cy.get(authenticatorAppSwitch).should('be.enabled');

export const totpEnabledToasterIsDisplayed = () =>
  cy.get(totpEnabledToaster).should('be.visible');

export const enableTotpOptionIsDisabled = () => {
  return cy
    .get(enableUserTotpOption)
    .invoke('attr', 'aria-disabled')
    .should('eq', 'true');
};

export const newIssuedTotpSecretIsDifferent = (originalTotpSecret) => {
  getTotpSecret().then((newTotpSecret) => {
    cy.wrap(newTotpSecret).should('not.equal', originalTotpSecret);
  });
};

export const plainUserFullNameIsDisplayed = () =>
  _expectedFullNameIsDisplayed(basePage.plainUser.fullname);

export const adminUserFullNameIsDisplayed = () =>
  _expectedFullNameIsDisplayed(basePage.adminUser.fullname);

const _expectedFullNameIsDisplayed = (fullname) =>
  cy.get(fullNameInputField).should('have.value', fullname);

export const plainUserEmailIsDisplayed = () =>
  emailInputFieldHasExpectedValue(basePage.plainUser.email);

export const adminUserEmailIsDisplayed = () =>
  emailInputFieldHasExpectedValue(basePage.adminUser.email);

export const plainUserUsernameIsDisplayed = () =>
  usernameInputFieldHasExpectedValue(basePage.plainUser.username);

export const adminUserUsernameIsDisplayed = () =>
  usernameInputFieldHasExpectedValue(basePage.adminUser.username);

export const adminUsernameIsListedInUsersTable = () =>
  cy.get(usersListAdminUser).should('be.visible');

export const plainUsernameIsListedInUsersTable = () =>
  cy.get(usersListPlainUser).should('be.visible');

export const createUserButtonIsNotDisplayed = () =>
  cy.get(createUserButton).should('not.exist');

export const selectDisabledStatus = () =>
  basePage.selectFromDropdown(statusDropdown, 'Disabled');

export const selectEnabledStatus = () =>
  basePage.selectFromDropdown(statusDropdown, 'Disabled');

export const adminUserPermissionsAreDisplayed = () =>
  cy
    .get(permissionsInputField)
    .should('have.text', basePage.adminUser.permissions);

// API
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

export const apiDisableUser = () =>
  apiGetProfileInfo().then(({ id }) => {
    apiPatchUser(id, { enabled: false });
  });

export const apiApplyAllUsersPermission = () =>
  apiGetProfileInfo().then(({ id }) => {
    apiPatchUser(id, {
      abilities: [{ id: 2, name: 'all', resource: 'users', label: 'test' }],
    });
  });

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

export const apiModifyUserFullName = () =>
  _getUserIdFromPath().then((id) => apiPatchUser(id, { fullname: 'new_name' }));

const _getUserIdFromPath = () =>
  cy.location().then(({ pathname }) => pathname.split('/')[2]);
