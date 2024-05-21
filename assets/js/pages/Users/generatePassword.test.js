import {
  hasValidPwdLength,
  validateNoRepetitiveCharacters,
  validateNoSequentialCharacters,
  generateValidPassword,
} from './generatePassword';

describe('Validation helper', () => {
  test('should check password length to be minimum of 8', () => {
    const validPwd = '12345678';
    const invalidPwd = '1234567';
    expect(hasValidPwdLength(validPwd)).toBe(true);
    expect(hasValidPwdLength(invalidPwd)).toBe(false);
  });

  test('should check for repetitive characters', () => {
    const validPwd = 'abcdef';
    const invalidPwd = 'aaabbb';
    expect(validateNoRepetitiveCharacters(validPwd)).toBe(true);
    expect(validateNoRepetitiveCharacters(invalidPwd)).toBe(false);
  });

  test('should check for sequential characters', () => {
    const validPwd = 'abd';
    const invalidPwd = 'abc';
    expect(validateNoSequentialCharacters(validPwd)).toBe(true);
    expect(validateNoSequentialCharacters(invalidPwd)).toBe(false);
  });
});

describe('generateValidPassword', () => {
  test('should generate a password with a default length of 16', () => {
    const password = generateValidPassword();
    expect(password).toHaveLength(16);
  });

  test('should generate a password of specific length', () => {
    const length = 20;
    const password = generateValidPassword(length);
    expect(password).toHaveLength(length);
  });

  test('should generate passwords that vary', () => {
    const firstPassword = generateValidPassword();
    const secondPassword = generateValidPassword();
    expect(firstPassword).not.toBe(secondPassword);
  });
});
