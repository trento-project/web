import { agentVersionWarning } from '.';

describe('agent', () => {
  it.each([
    {
      version: '1.0.0',
      expected:
        'The Agent version is outdated, some features might not work properly. It is advised to keep the Agents up to date with the Server.',
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
