import { isValidEnsaVersion, getEnsaVersionLabel } from './sapSystems';

describe('sap systems', () => {
  it('should check if an ensa version is valid', () => {
    ['ensa1', 'ensa2'].forEach((ensaVersion) => {
      expect(isValidEnsaVersion(ensaVersion)).toBe(true);
    });

    expect(isValidEnsaVersion('other')).toBe(false);
  });

  it('should provide a label for an ensa version', () => {
    [
      { key: 'ensa1', label: 'ENSA1' },
      { key: 'ensa2', label: 'ENSA2' },
      { key: 'no_ensa', label: '-' },
    ].forEach(({ key, label }) => {
      expect(getEnsaVersionLabel(key)).toBe(label);
    });
  });
});
