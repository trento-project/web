import { generatePassword } from './generatePassword';

describe('generatePassword', () => {
  test('generates a password of default length 16', () => {
    const password = generatePassword();
    expect(password).toHaveLength(16);
  });

  test('generates a password of specific length', () => {
    const length = 20;
    const password = generatePassword(length);
    expect(password).toHaveLength(length);
  });

  test('generates passwords that vary', () => {
    const firstPassword = generatePassword();
    const secondPassword = generatePassword();
    expect(firstPassword).not.toBe(secondPassword);
  });
});
