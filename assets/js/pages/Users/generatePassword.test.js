import {
  hasValidPwdLength,
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

describe('Validation helper', () => {
  test('should check password length to be minimum of 8', () => {
    const validPwdLength = '12345678';
    const invalidPwdLength = '1234567';
    expect(hasValidPwdLength(validPwdLength)).toBe(true);
    expect(hasValidPwdLength(invalidPwdLength)).toBe(false);
  });

  test('should check for repetitive characters', () => {
    const validPwdWithoutRepetition = 'abcdef';
    const invalidPwdWithRepetition = 'aaabbb';
    expect(validateNoRepetitiveCharacters(validPwdWithoutRepetition)).toBe(
      true
    );
    expect(validateNoRepetitiveCharacters(invalidPwdWithRepetition)).toBe(
      false
    );
  });

  test('should check for sequential characters', () => {
    const validPwdWithoutSequentialCharacters = 'abd';
    const invalidPwdWithSequentialCharacters = 'abc';
    expect(
      validateNoSequentialCharacters(validPwdWithoutSequentialCharacters)
    ).toBe(true);
    expect(
      validateNoSequentialCharacters(invalidPwdWithSequentialCharacters)
    ).toBe(false);
  });
});
