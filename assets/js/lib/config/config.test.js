import { getFromConfig } from '.';

describe('getFromConfig', () => {
  it('should retrieve variable from the config', () => {
    // See jest.config.js for global config used in testing
    const fetchedConfigVariable = getFromConfig('aTestVariable');

    expect(fetchedConfigVariable).toEqual(123);
  });

  it('should return undefined when variable is not available the config', () => {
    const fetchedConfigVariable = getFromConfig('variableThatDoesntExist');

    expect(fetchedConfigVariable).toBeUndefined();
  });
});
