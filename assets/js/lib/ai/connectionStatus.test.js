// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { CONNECTION_STATUS, isOnline } from './connectionStatus';

const { CONNECTED, CONNECTING, DISCONNECTED } = CONNECTION_STATUS;

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
