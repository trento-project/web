const DIGITS = '0123456789';
const UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const SPECIAL_CHARACTERS = '~!@#$%^&*()_+={}[]|:;<>,.?/-\'"`';

const PASSWORD_CHARACTERS =
  DIGITS + UPPERCASE_LETTERS + LOWERCASE_LETTERS + SPECIAL_CHARACTERS;

const MAX_SEQUENTIAL_CHARS = 3;
const SEQUENCES = [DIGITS, UPPERCASE_LETTERS, LOWERCASE_LETTERS];

const hasValidPwdLength = (password, pwdLength = 8) =>
  password.length >= pwdLength;

const hasNoRepetitiveCharacters = (password) => !/(.)\1{2,}/.test(password);

const hasNoSequentialCharacters = (password) =>
  !SEQUENCES.some((seq) => {
    const max = seq.length - MAX_SEQUENTIAL_CHARS;
    return Array.from(Array(max).keys()).some((i) => {
      const pattern = seq.slice(i, i + MAX_SEQUENTIAL_CHARS + 1);
      return password.includes(pattern);
    });
  });

const generatePassword = (length = 16, characters = PASSWORD_CHARACTERS) =>
  Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((char) => characters[char % characters.length])
    .join('');

export const isValidPassword = (password) => {
  if (
    hasValidPwdLength(password) &&
    hasNoRepetitiveCharacters(password) &&
    hasNoSequentialCharacters(password)
  ) {
    return true;
  }
  return false;
};

export const generateValidPassword = (length = 16) => {
  const password = generatePassword(length);
  return isValidPassword(password) ? password : generateValidPassword(length);
};
