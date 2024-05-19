import {
  hasValidLength,
  validateNoRepetitiveCharacters,
  validateNoSequentialCharacters,
  generateValidPassword,
} from './generatePassword';

describe('generatePassword', () => {
  test('generates a password of default length 16', () => {
    const password = generateValidPassword();
    expect(password).toHaveLength(16);
  });

  test('generates a password of specific length', () => {
    const length = 20;
    const password = generateValidPassword(length);
    expect(password).toHaveLength(length);
  });

  test('generates passwords that vary', () => {
    const firstPassword = generateValidPassword();
    const secondPassword = generateValidPassword();
    expect(firstPassword).not.toBe(secondPassword);
  });
});

describe('Validation helpers', () => {
  test('validates password length to be minimum of 8', () => {
    const validPwdLength = '12345678';
    const invalidPWDLength = '1234567';
    expect(hasValidLength(validPwdLength)).toBe(true);
    expect(hasValidLength(invalidPWDLength)).toBe(false);
  });

  test('checks for repetitive characters', () => {
    const validPwdWithoutRepetition = 'abcdef';
    const invalidPwdWithRepetition = 'aaabbb';
    expect(validateNoRepetitiveCharacters(validPwdWithoutRepetition)).toBe(
      true
    );
    expect(validateNoRepetitiveCharacters(invalidPwdWithRepetition)).toBe(
      false
    );
  });

  test('checks for sequential characters', () => {
    const validPwdWithoutSequentialCharacters = 'abc';
    const invalidPwdWithSequentialCharacters = 'abd';
    expect(
      validateNoSequentialCharacters(validPwdWithoutSequentialCharacters)
    ).toBe(false);
    expect(
      validateNoSequentialCharacters(invalidPwdWithSequentialCharacters)
    ).toBe(true);
  });
});
