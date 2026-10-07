// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { CONNECTING, CONNECTED, DISCONNECTED } from '@lib/ai';

import {
  OK,
  CLEARED,
  RESTORED,
  EXPIRED,
  canSendMessage,
  effectiveConnectionStatus,
  isChatReadOnly,
  isConfigurationAvailable,
  isConfigurationCleared,
  isConfigurationRestored,
  isConversationExpired,
} from './status';

describe('AIAssistant configuration status', () => {
  describe('status predicates', () => {
    it.each`
      configurationStatus | cleared  | restored | expired  | available | readOnly
      ${OK}               | ${false} | ${false} | ${false} | ${true}   | ${false}
      ${CLEARED}          | ${true}  | ${false} | ${false} | ${false}  | ${true}
      ${RESTORED}         | ${false} | ${true}  | ${false} | ${true}   | ${true}
      ${EXPIRED}          | ${false} | ${false} | ${true}  | ${true}   | ${true}
    `(
      'describes the $configurationStatus configuration',
      ({
        configurationStatus,
        cleared,
        restored,
        expired,
        available,
        readOnly,
      }) => {
        expect(isConfigurationCleared(configurationStatus)).toBe(cleared);
        expect(isConfigurationRestored(configurationStatus)).toBe(restored);
        expect(isConversationExpired(configurationStatus)).toBe(expired);
        expect(isConfigurationAvailable(configurationStatus)).toBe(available);
        expect(isChatReadOnly(configurationStatus)).toBe(readOnly);
      }
    );
  });

  describe('canSendMessage', () => {
    it.each`
      connectionStatus | configurationStatus | allowed
      ${CONNECTED}     | ${OK}               | ${true}
      ${CONNECTED}     | ${RESTORED}         | ${false}
      ${CONNECTED}     | ${EXPIRED}          | ${false}
      ${CONNECTED}     | ${CLEARED}          | ${false}
      ${CONNECTING}    | ${OK}               | ${false}
      ${DISCONNECTED}  | ${OK}               | ${false}
    `(
      'is $allowed when $connectionStatus and the configuration is $configurationStatus',
      ({ connectionStatus, configurationStatus, allowed }) => {
        expect(canSendMessage(connectionStatus, configurationStatus)).toBe(
          allowed
        );
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
  });
});
