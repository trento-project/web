import React from 'react';

import {
  act, render, screen, waitFor,
} from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { withState } from '@lib/test-utils';

import Eula from '.';

describe('Eula component', () => {
  it('should render community eula correctly', async () => {
    const user = userEvent.setup();

    const initialState = {
      settings: { eulaVisible: true, setIsPremium: false },
    };
    const [statefulEula, store] = withState(<Eula />, initialState);

    render(statefulEula);
    const acceptButton = screen.getByRole('button');
    expect(acceptButton).toHaveTextContent('Accept');
    expect(screen.getByText(/Trento Community/)).toBeTruthy();

    await user.click(acceptButton);

    const actions = store.getActions();
    const expectedPayload = { type: 'ACCEPT_EULA' };
    expect(actions).toEqual([expectedPayload]);
  });

  it('should render premium eula correctly', async () => {
    const user = userEvent.setup();
    const initialState = { settings: { eulaVisible: true, isPremium: true } };
    const [statefulEula, store] = withState(<Eula />, initialState);

    render(statefulEula);
    const acceptButton = screen.getByRole('button');
    expect(acceptButton).toHaveTextContent('Accept');
    expect(screen.getByText(/Trento Premium/)).toBeTruthy();

    await user.click(acceptButton);

    const actions = store.getActions();
    const expectedPayload = { type: 'ACCEPT_EULA' };
    expect(actions).toEqual([expectedPayload]);
  });
});
