// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import {
  CONNECTING,
  CONNECTED,
  DISCONNECTED,
  isOnline,
} from './connectionStatus';

describe('isOnline', () => {
  it.each([
    { connectionStatus: CONNECTED, online: true },
    { connectionStatus: CONNECTING, online: false },
    { connectionStatus: DISCONNECTED, online: false },
    { connectionStatus: 'unknown', online: false },
    { connectionStatus: undefined, online: false },
  ])('is $online when $connectionStatus', ({ connectionStatus, online }) => {
    expect(isOnline(connectionStatus)).toBe(online);
  });
});
