// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { initSocketConnection } from '@lib/network/socket';
import { SocketProvider, useSocket } from './SocketProvider';

jest.mock('@lib/network/socket', () => ({
  initSocketConnection: jest.fn(),
}));

const mockStore = configureStore([]);

function SocketProbe() {
  const socket = useSocket();
  return <div data-testid="socket">{socket ? 'present' : 'absent'}</div>;
}

const renderWithStore = (store) =>
  render(
    <Provider store={store}>
      <SocketProvider>
        <SocketProbe />
      </SocketProvider>
    </Provider>
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SocketProvider', () => {
  it('exposes null when no user is logged in', () => {
    renderWithStore(mockStore({ user: {} }));
    expect(screen.getByTestId('socket')).toHaveTextContent('absent');
    expect(initSocketConnection).not.toHaveBeenCalled();
  });

  it('initialises and exposes the socket once a user id is present', () => {
    const fakeSocket = { connect: jest.fn() };
    initSocketConnection.mockReturnValue(fakeSocket);

    renderWithStore(mockStore({ user: { id: 7 } }));

    expect(initSocketConnection).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('socket')).toHaveTextContent('present');
  });
});
