// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

// Lifecycle of the assistant relative to the user's AI configuration:
//   ok       - configured and usable
//   cleared  - configuration was removed; chat is read-only, launcher disabled
//   restored - configuration came back while a cleared chat was still open;
//              the user must start a new chat to resume
export const STATUS = {
  OK: 'ok',
  CLEARED: 'cleared',
  RESTORED: 'restored',
};
