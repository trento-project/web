// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { ACTIVE, CONNECTING, CONNECTED, DISCONNECTED, EXPIRED } from '@lib/ai';

import {
  OK,
  CLEARED,
  RESTORED,
  canSendMessage,
  effectiveConnectionStatus,
  readOnlyReason,
  isChatReadOnly,
  isConfigurationAvailable,
  isConfigurationCleared,
  isConfigurationRestored,
} from './status';

describe('AIAssistant status', () => {
  describe('status predicates', () => {
    it.each`
      configurationStatus | cleared  | restored | available | readOnly
      ${OK}               | ${false} | ${false} | ${true}   | ${false}
      ${CLEARED}          | ${true}  | ${false} | ${false}  | ${true}
      ${RESTORED}         | ${false} | ${true}  | ${true}   | ${true}
      ${'unknown'}        | ${false} | ${false} | ${true}   | ${true}
    `(
      'describes the $configurationStatus configuration',
      ({ configurationStatus, cleared, restored, available, readOnly }) => {
        expect(isConfigurationCleared(configurationStatus)).toBe(cleared);
        expect(isConfigurationRestored(configurationStatus)).toBe(restored);
        expect(isConfigurationAvailable(configurationStatus)).toBe(available);
        expect(isChatReadOnly(configurationStatus)).toBe(readOnly);
      }
    );
  });

  describe('readOnlyReason', () => {
    it.each`
      configurationStatus | conversationStatus | reason
      ${OK}               | ${ACTIVE}          | ${null}
      ${OK}               | ${EXPIRED}         | ${EXPIRED}
      ${CLEARED}          | ${ACTIVE}          | ${CLEARED}
      ${CLEARED}          | ${EXPIRED}         | ${CLEARED}
      ${RESTORED}         | ${EXPIRED}         | ${RESTORED}
    `(
      'is $reason when the configuration is $configurationStatus and the conversation is $conversationStatus',
      ({ configurationStatus, conversationStatus, reason }) => {
        expect(readOnlyReason(configurationStatus, conversationStatus)).toBe(
          reason
        );
      }
    );
  });

  describe('canSendMessage', () => {
    it.each`
      connectionStatus | configurationStatus | conversationStatus | allowed
      ${CONNECTED}     | ${OK}               | ${ACTIVE}          | ${true}
      ${CONNECTED}     | ${RESTORED}         | ${ACTIVE}          | ${false}
      ${CONNECTED}     | ${CLEARED}          | ${ACTIVE}          | ${false}
      ${CONNECTED}     | ${OK}               | ${EXPIRED}         | ${false}
      ${CONNECTING}    | ${OK}               | ${ACTIVE}          | ${false}
      ${DISCONNECTED}  | ${OK}               | ${ACTIVE}          | ${false}
    `(
      'is $allowed when $connectionStatus, the configuration is $configurationStatus and the conversation is $conversationStatus',
      ({
        connectionStatus,
        configurationStatus,
        conversationStatus,
        allowed,
      }) => {
        expect(
          canSendMessage(
            connectionStatus,
            configurationStatus,
            conversationStatus
          )
        ).toBe(allowed);
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
