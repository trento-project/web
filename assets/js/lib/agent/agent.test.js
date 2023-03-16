import { agentVersionWarning } from '.';

describe('agent', () => {
  it.each([
    {
      version: '1.0.0',
      expected:
        'Agent version 2.0.0 or greater is required for the new checks engine.',
    },
    {
      version: '2.0.0',
      expected: null,
    },
  ])(
    'should return the correct warning message on $version agent version',
    ({ version, expected }) => {
      const warning = agentVersionWarning(version);
      expect(warning).toBe(expected);
    }
  );
});
