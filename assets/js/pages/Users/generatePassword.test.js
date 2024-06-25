import { isValidPassword, generateValidPassword } from './generatePassword';

describe('generateValidPassword', () => {
  it('should generate a password with a default length of 16', () => {
    const password = generateValidPassword();
    expect(password).toHaveLength(16);
  });

  it('should generate a password of specific length', () => {
    const length = 20;
    const password = generateValidPassword(length);
    expect(password).toHaveLength(length);
  });

  it('should generate passwords that vary', () => {
    const firstPassword = generateValidPassword();
    const secondPassword = generateValidPassword();
    expect(firstPassword).not.toBe(secondPassword);
  });
});

describe('isValidPassword', () => {
  const passwordList = [
    {
      expectedResult: false,
      password: 'short',
    },
    {
      expectedResult: false,
      password: 'passwordaaa',
    },
    {
      expectedResult: false,
      password: 'passwordBBB',
    },
    {
      expectedResult: false,
      password: 'password555',
    },
    {
      expectedResult: false,
      password: 'password1234',
    },
    {
      expectedResult: false,
      password: 'passwordefgh',
    },
    {
      expectedResult: false,
      password: 'passwordKLMNO',
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
  it('should return true if the password is valid', () => {
    const password = generateValidPassword();
    expect(isValidPassword(password)).toBe(true);
  });
});
