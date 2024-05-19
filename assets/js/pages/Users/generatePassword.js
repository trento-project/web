const DIGITS = '0123456789';
const UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const SPECIAL_CHARACTERS = '~!@#$%^&*()_+={}[]|:;<>,.?/-\'"`';

const PASSWORD_CHARACTERS =
  DIGITS + UPPERCASE_LETTERS + LOWERCASE_LETTERS + SPECIAL_CHARACTERS;

export const hasValidPwdLength = (password, pwdLength = 8) =>
  password.length >= pwdLength;

export const validateNoRepetitiveCharacters = (password) =>
  !/(.)\1{2,}/.test(password);

const isAlphanumeric = (char) => /[A-Za-z0-9]/.test(char);

export const validateNoSequentialCharacters = (password) => {
  if (password.length < 3) {
    return true;
  }

  for (let i = 2; i < password.length; i += 1) {
    const firstChar = password[i - 2];
    const secondChar = password[i - 1];
    const thirdChar = password[i];
    if (
      isAlphanumeric(firstChar) &&
      isAlphanumeric(secondChar) &&
      isAlphanumeric(thirdChar)
    ) {
      const firstCharCode = firstChar.charCodeAt(0);
      const secondCharCode = secondChar.charCodeAt(0);
      const thirdCharCode = thirdChar.charCodeAt(0);

      if (
        (secondCharCode === firstCharCode + 1 &&
          thirdCharCode === secondCharCode + 1) ||
        (secondCharCode === firstCharCode - 1 &&
          thirdCharCode === secondCharCode - 1)
      ) {
        return false;
      }
    }
  }
  return true;
};

const generatePassword = (length = 16, characters = PASSWORD_CHARACTERS) =>
  Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((char) => characters[char % characters.length])
    .join('');

export const generateValidPassword = (length = 16) => {
  const password = generatePassword(length);
  if (
    hasValidPwdLength(password) &&
    validateNoRepetitiveCharacters(password) &&
    validateNoSequentialCharacters(password)
  ) {
    return password;
  }
  return generateValidPassword(length);
};
