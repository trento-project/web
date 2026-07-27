// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { CONNECTION_STATUS, isOnline } from '@lib/ai';

import {
  CONFIGURATION_STATUS,
  canSendMessage,
  effectiveConnectionStatus,
  isChatReadOnly,
  isConfigurationAvailable,
  isConfigurationCleared,
  isConfigurationRestored,
} from './status';

const { CONNECTED, CONNECTING, DISCONNECTED } = CONNECTION_STATUS;
const { OK, CLEARED, RESTORED } = CONFIGURATION_STATUS;

describe('AIAssistant configuration status', () => {
  describe('isChatReadOnly', () => {
    it.each([
      { configurationStatus: CONFIGURATION_STATUS.OK, readOnly: false },
      { configurationStatus: CONFIGURATION_STATUS.CLEARED, readOnly: true },
      { configurationStatus: CONFIGURATION_STATUS.RESTORED, readOnly: true },
    ])(
      'is $readOnly when the configuration is $configurationStatus',
      ({ configurationStatus, readOnly }) => {
        expect(isChatReadOnly(configurationStatus)).toBe(readOnly);
      }
    );
  });

  describe('canSendMessage', () => {
    it.each([
      { connectionStatus: CONNECTED, configurationStatus: OK, allowed: true },
      {
        connectionStatus: CONNECTED,
        configurationStatus: RESTORED,
        allowed: false,
      },
      {
        connectionStatus: CONNECTED,
        configurationStatus: CLEARED,
        allowed: false,
      },
      {
        connectionStatus: CONNECTING,
        configurationStatus: OK,
        allowed: false,
      },
      {
        connectionStatus: DISCONNECTED,
        configurationStatus: OK,
        allowed: false,
      },
    ])(
      'is $allowed when $connectionStatus and the configuration is $configurationStatus',
      ({ connectionStatus, configurationStatus, allowed }) => {
        expect(canSendMessage(connectionStatus, configurationStatus)).toBe(
          allowed
        );
      }
    );
  });

  describe('isConfigurationCleared', () => {
    it.each([
      { configurationStatus: CONFIGURATION_STATUS.OK, cleared: false },
      { configurationStatus: CONFIGURATION_STATUS.RESTORED, cleared: false },
      { configurationStatus: CONFIGURATION_STATUS.CLEARED, cleared: true },
    ])(
      'is $cleared when the configuration is $configurationStatus',
      ({ configurationStatus, cleared }) => {
        expect(isConfigurationCleared(configurationStatus)).toBe(cleared);
      }
    );
  });

  describe('isConfigurationRestored', () => {
    it.each([
      { configurationStatus: CONFIGURATION_STATUS.OK, restored: false },
      { configurationStatus: CONFIGURATION_STATUS.CLEARED, restored: false },
      { configurationStatus: CONFIGURATION_STATUS.RESTORED, restored: true },
    ])(
      'is $restored when the configuration is $configurationStatus',
      ({ configurationStatus, restored }) => {
        expect(isConfigurationRestored(configurationStatus)).toBe(restored);
      }
    );
  });

  describe('isConfigurationAvailable', () => {
    it.each([
      { configurationStatus: CONFIGURATION_STATUS.OK, available: true },
      { configurationStatus: CONFIGURATION_STATUS.RESTORED, available: true },
      { configurationStatus: CONFIGURATION_STATUS.CLEARED, available: false },
    ])(
      'is $available when the configuration is $configurationStatus',
      ({ configurationStatus, available }) => {
        expect(isConfigurationAvailable(configurationStatus)).toBe(available);
      }
    );
  });

  describe('effectiveConnectionStatus', () => {
    it.each([CONNECTED, CONNECTING, DISCONNECTED])(
      'passes the %s connection status through when the configuration is ok or restored',
      (connectionStatus) => {
        expect(effectiveConnectionStatus(connectionStatus, OK)).toBe(
          connectionStatus
        );
        expect(effectiveConnectionStatus(connectionStatus, RESTORED)).toBe(
          connectionStatus
        );
      }
    );

    it('forces disconnected when the configuration was cleared, even while connected', () => {
      expect(effectiveConnectionStatus(CONNECTED, CLEARED)).toBe(DISCONNECTED);
    });

    it.each([
      {
        connectionStatus: CONNECTED,
        configurationStatus: OK,
        allowed: true,
      },
      {
        connectionStatus: CONNECTED,
        configurationStatus: RESTORED,
        allowed: true,
      },
      {
        connectionStatus: CONNECTED,
        configurationStatus: CLEARED,
        allowed: false,
      },
      {
        connectionStatus: CONNECTING,
        configurationStatus: OK,
        allowed: false,
      },
      {
        connectionStatus: DISCONNECTED,
        configurationStatus: OK,
        allowed: false,
      },
    ])(
      'is online $allowed when $connectionStatus and the configuration is $configurationStatus',
      ({ connectionStatus, configurationStatus, allowed }) => {
        const effectiveStatus = effectiveConnectionStatus(
          connectionStatus,
          configurationStatus
        );
        expect(isOnline(effectiveStatus)).toBe(allowed);
      }
    );
  });
});
