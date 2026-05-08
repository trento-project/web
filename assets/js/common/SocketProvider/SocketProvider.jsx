// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { initSocketConnection } from '@lib/network/socket';
import { getUserProfile } from '@state/selectors/user';

// Exported so test/story scaffolding can short-circuit SocketProvider and
// inject a fake socket directly via SocketContext.Provider.
export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const user = useSelector(getUserProfile);
  const userId = user?.id;
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!userId) {
      setSocket(null);
      return;
    }
    setSocket(initSocketConnection());
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
