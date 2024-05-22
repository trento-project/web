import { isValidPassword, generateValidPassword } from './generatePassword';

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
describe('isValidPassword', () => {
  const passwordList = [
    {
      expectedResult: false,
      password: '1234567',
    },
    {
      expectedResult: false,
      password: 'aaabbbcccdddeee',
    },
    {
      expectedResult: false,
      password: 'ABCDabcd1234',
    },
    {
      expectedResult: true,
      password: 'H^a*~wvFSv88*NRG',
    },
  ];
  it.each(passwordList)(
    'should return false if the password is invalid',
    ({ expectedResult, password }) => {
      expect(isValidPassword(password)).toBe(expectedResult);
    }
  );
  test('should return true if the password is valid', () => {
    const password = generateValidPassword();
    expect(isValidPassword(password)).toBe(true);
  });
});
