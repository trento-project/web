import { hostFactory } from '@lib/test-utils/factories';
import { canDisableUnit, canEnableUnit } from './hosts';

describe('hosts', () => {
  describe('enabling units', () => {
    it('should be able to enable a unit', () => {
      const host = hostFactory.build({
        systemd_units: [{ name: 'foo.service', unit_file_state: 'disabled' }],
      });
      expect(canEnableUnit(host, 'foo.service')).toBe(true);
    });

    it('should not be able to enable a unit', () => {
      const host = hostFactory.build({
        systemd_units: [
          { name: 'foo.service', unit_file_state: 'enabled' },
          { name: 'bar.service', unit_file_state: 'unknown' },
          { name: 'baz.service', unit_file_state: 'unrecognized' },
        ],
      });
      expect(canEnableUnit(host, 'foo.service')).toBe(false);
      expect(canEnableUnit(host, 'bar.service')).toBe(false);
      expect(canEnableUnit(host, 'baz.service')).toBe(false);
    });
  });

  describe('disabling units', () => {
    it('should be able to disable a unit', () => {
      const host = hostFactory.build({
        systemd_units: [{ name: 'foo.service', unit_file_state: 'enabled' }],
      });
      expect(canDisableUnit(host, 'foo.service')).toBe(true);
    });

    it('should not be able to disable a unit', () => {
      const host = hostFactory.build({
        systemd_units: [
          { name: 'foo.service', unit_file_state: 'disabled' },
          { name: 'bar.service', unit_file_state: 'unknown' },
          { name: 'baz.service', unit_file_state: 'unrecognized' },
        ],
      });
      expect(canDisableUnit(host, 'foo.service')).toBe(false);
      expect(canDisableUnit(host, 'bar.service')).toBe(false);
      expect(canDisableUnit(host, 'baz.service')).toBe(false);
    });
  });
});
