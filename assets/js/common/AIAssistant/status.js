// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { CONNECTION_STATUS, isOnline } from '@lib/ai';

// Lifecycle of the assistant relative to the user's AI configuration:
//   ok       - configured and usable
//   cleared  - configuration was removed; chat is read-only, launcher disabled
//   restored - configuration came back while a cleared chat was still open;
//              the user must start a new chat to resume
export const OK = 'ok';
export const CLEARED = 'cleared';
export const RESTORED = 'restored';

export const CONFIGURATION_STATUS = {
  OK,
  CLEARED,
  RESTORED,
};

export const isConfigurationCleared = (configurationStatus) =>
  configurationStatus === CONFIGURATION_STATUS.CLEARED;

export const isConfigurationRestored = (configurationStatus) =>
  configurationStatus === CONFIGURATION_STATUS.RESTORED;

export const isConfigurationAvailable = (configurationStatus) =>
  !isConfigurationCleared(configurationStatus);

// The conversation can only be written to while the configuration is intact.
// - a cleared configuration has nothing to answer with
// - a restored one belongs to a fresh chat, so the current thread stays read-only
export const isChatReadOnly = (configurationStatus) =>
  configurationStatus !== CONFIGURATION_STATUS.OK;

// --- Folding the two axes into one ------------------------------------------
// Connection and configuration are orthogonal, but a cleared configuration
// makes the live socket irrelevant: there is nothing to talk to.
export const effectiveConnectionStatus = (
  connectionStatus,
  configurationStatus
) =>
  isConfigurationCleared(configurationStatus)
    ? CONNECTION_STATUS.DISCONNECTED
    : connectionStatus;

// Sending is the one capability the fold cannot express: a restored
// configuration passes through it as online (a new chat *is* startable) while
// this thread stays read-only, so the configuration axis is still needed here.
// A cleared configuration is already read-only, so folding the connection first
// would change nothing - which also makes this safe to call with either the raw
// or the effective connection status.
export const canSendMessage = (connectionStatus, configurationStatus) =>
  isOnline(connectionStatus) && !isChatReadOnly(configurationStatus);
