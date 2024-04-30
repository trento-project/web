import { hasError, getError } from './validationErrors';

describe('hasError', () => {
  it('should tell that a list contains an error about a specific field', () => {
    const errors = [
      {
        detail: "can't be blank",
        source: { pointer: '/url' },
        title: 'Invalid value',
      },
      {
        detail: "can't be blank",
        source: { pointer: '/ca_cert' },
        title: 'Invalid value',
      },
    ];

    expect(hasError('url', errors)).toBe(true);
  });

  it('should spot nothing in an empty list', () => {
    expect(hasError('url', [])).toBe(false);
  });

  it('should spot nothing when the keyword is not in the list', () => {
    const errors = [
      {
        detail: "can't be blank",
        source: { pointer: '/username' },
        title: 'Invalid value',
      },
      {
        detail: "can't be blank",
        source: { pointer: '/ca_cert' },
        title: 'Invalid value',
      },
    ];

    expect(hasError('url', errors)).toBe(false);
  });
});

describe('getError', () => {
  it('should spot nothing in an empty list', () => {
    expect(getError('url', [])).toBe(undefined);
  });

  it('should get nothing when the keyword is not in the list', () => {
    const errors = [
      {
        detail: "can't be blank",
        source: { pointer: '/username' },
        title: 'Invalid value',
      },
      {
        detail: "can't be blank",
        source: { pointer: '/ca_cert' },
        title: 'Invalid value',
      },
    ];

    expect(getError('username', errors)).toBe("can't be blank");
  });

  it('should get nothing when the keyword is not in the list', () => {
    const errors = [
      {
        detail: "can't be blank",
        source: { pointer: '/username' },
        title: 'Invalid value',
      },
      {
        detail: "can't be blank",
        source: { pointer: '/ca_cert' },
        title: 'Invalid value',
      },
    ];

    expect(getError('url', errors)).toBe(undefined);
  });
});
