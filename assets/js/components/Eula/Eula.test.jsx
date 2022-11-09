import React from 'react';

import { render, screen } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { withState } from '@lib/test-utils';

import Eula from '.';

describe('Eula component', () => {
  it('should render community eula correctly', () => {
    const initialState = {
      settings: { eulaVisible: true, setIsPremium: false },
    };
    const [statefulEula, store] = withState(<Eula />, initialState);

    render(statefulEula);
    const acceptButton = screen.getByRole('button');
    expect(acceptButton).toHaveTextContent('Accept');
    expect(screen.getByText(/Trento Community/)).toBeTruthy();

    userEvent.click(acceptButton);

    const actions = store.getActions();
    const expectedPayload = { type: 'ACCEPT_EULA' };
    expect(actions).toEqual([expectedPayload]);
  });

  it('should render premium eula correctly', () => {
    const initialState = { settings: { eulaVisible: true, isPremium: true } };
    const [statefulEula, store] = withState(<Eula />, initialState);

    render(statefulEula);
    const acceptButton = screen.getByRole('button');
    expect(acceptButton).toHaveTextContent('Accept');
    expect(screen.getByText(/Trento Premium/)).toBeTruthy();

    userEvent.click(acceptButton);

    const actions = store.getActions();
    const expectedPayload = { type: 'ACCEPT_EULA' };
    expect(actions).toEqual([expectedPayload]);
  });
});
