import {
  hasError,
  getError,
  getGlobalError,
  defaultGlobalError,
} from './validationErrors';

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

  it('should match subfields', () => {
    const errors = [
      {
        detail: "can't be blank",
        source: { pointer: '/date/year' },
        title: 'Invalid value',
      },
    ];

    expect(hasError('date/year', errors)).toBe(true);
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

describe('getGlobalError', () => {
  it('should return the first global error', () => {
    const errors = [
      {
        detail: 'a detail',
        title: 'a title',
      },
      {
        detail: 'another detail',
        source: { pointer: '/some_field' },
        title: 'another title',
      },
      {
        detail: 'do not return this detail',
        title: 'do not return this title',
      },
    ];

    expect(getGlobalError(errors)).toBe('a detail');
  });

  it('should return undefined when there is no global error', () => {
    const errors = [
      {
        detail: "can't be blank",
        source: { pointer: '/some_value' },
        title: 'Invalid value',
      },
    ];

    expect(getGlobalError(errors)).not.toBeDefined();
  });

  it('should return undefined when no error', () => {
    const errors = [];

    expect(getGlobalError(errors)).not.toBeDefined();
  });

  it.each`
    input
    ${{ malformed: true }}
    ${undefined}
    ${null}
    ${'string'}
    ${1234 /* number */}
    ${[12, 34] /* array */}
  `(
    'should return the default error if the received error is malformed',
    ({ input }) => {
      expect(getGlobalError([input])).toBe(defaultGlobalError.detail);
    }
  );
});
