// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { ACTIVE, EXPIRED, isConversationExpired } from './conversationStatus';

describe('isConversationExpired', () => {
  it.each([
    { conversationStatus: ACTIVE, expired: false },
    { conversationStatus: EXPIRED, expired: true },
    { conversationStatus: 'unknown', expired: false },
    { conversationStatus: undefined, expired: false },
  ])(
    'is $expired when $conversationStatus',
    ({ conversationStatus, expired }) => {
      expect(isConversationExpired(conversationStatus)).toBe(expired);
    }
  );
});
