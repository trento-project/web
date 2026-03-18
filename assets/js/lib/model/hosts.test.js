import { hostFactory } from '@lib/test-utils/factories';
import {
  canDisableUnit,
  canEnableUnit,
  isHeartbeatPassing,
  isSomeHostHeartbeatPassing,
} from './hosts';

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
          { name: 'qux.service', unit_file_state: '' },
          { name: 'quux.service', unit_file_state: null },
          { name: 'corge.service' },
        ],
      });
      expect(canEnableUnit(host, 'foo.service')).toBe(false);
      expect(canEnableUnit(host, 'bar.service')).toBe(false);
      expect(canEnableUnit(host, 'baz.service')).toBe(false);
      expect(canEnableUnit(host, 'qux.service')).toBe(false);
      expect(canEnableUnit(host, 'quux.service')).toBe(false);
      expect(canEnableUnit(host, 'corge.service')).toBe(false);
      expect(canEnableUnit(host, 'unknown.service')).toBe(false);
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
          { name: 'qux.service', unit_file_state: '' },
          { name: 'quux.service', unit_file_state: null },
          { name: 'corge.service' },
        ],
      });
      expect(canDisableUnit(host, 'foo.service')).toBe(false);
      expect(canDisableUnit(host, 'bar.service')).toBe(false);
      expect(canDisableUnit(host, 'baz.service')).toBe(false);
      expect(canDisableUnit(host, 'qux.service')).toBe(false);
      expect(canDisableUnit(host, 'quux.service')).toBe(false);
      expect(canDisableUnit(host, 'corge.service')).toBe(false);
      expect(canDisableUnit(host, 'unknown.service')).toBe(false);
    });
  });

  describe('heartbeat', () => {
    it('should check if a host heartbeat is passing', () => {
      const hostPassing = hostFactory.build({ heartbeat: 'passing' });
      expect(isHeartbeatPassing(hostPassing)).toBeTruthy();

      const hostCritical = hostFactory.build({ heartbeat: 'critical' });
      expect(isHeartbeatPassing(hostCritical)).toBeFalsy();
    });

    it('should check if at least one host heartbeat is passing', () => {
      const hostsPassing = [
        hostFactory.build({ heartbeat: 'passing' }),
        hostFactory.build({ heartbeat: 'critical' }),
      ];
      expect(isSomeHostHeartbeatPassing(hostsPassing)).toBeTruthy();

      const hostsCritical = hostFactory.buildList(2, { heartbeat: 'critical' });
      expect(isSomeHostHeartbeatPassing(hostsCritical)).toBeFalsy();
    });
  });
});
