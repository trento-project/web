const DIGITS = '0123456789';
const UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const SPECIAL_CHARACTERS = '~!@#$%^&*()_+={}[]|:;<>,.?/-\'"`';

const PASSWORD_CHARACTERS =
  DIGITS + UPPERCASE_LETTERS + LOWERCASE_LETTERS + SPECIAL_CHARACTERS;

export const generatePassword = (
  length = 16,
  characters = PASSWORD_CHARACTERS
) =>
  Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((char) => characters[char % characters.length])
    .join('');
