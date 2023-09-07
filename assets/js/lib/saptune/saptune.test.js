import { isVersionSupported } from '.';

describe('saptune', () => {
  it.each([
    {
      version: '3.0.0',
      expected: false,
    },
    {
      version: '3.1.0',
      expected: true,
    },
  ])(
    'should return if the saptune version is supported',
    ({ version, expected }) => {
      const warning = isVersionSupported(version);
      expect(warning).toBe(expected);
    }
  );
});
