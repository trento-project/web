import React from 'react';

import { render, screen } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import { withState } from '@lib/test-utils';
import { setEulaVisible, setIsPremium } from '@state/settings';

import Eula from '.';

describe('Eula component', () => {
  it('should render community eula correctly', () => {
    const [statefulEula, store] = withState(<Eula />);

    store.dispatch(setEulaVisible());

    render(statefulEula);
    expect(screen.getByRole('button')).toHaveTextContent('Accept');
    expect(screen.getByText(/Trento Community/)).toBeTruthy();
  });

  it('should render premium eula correctly', () => {
    const [statefulEula, store] = withState(<Eula />);

    store.dispatch(setEulaVisible());
    store.dispatch(setIsPremium());

    render(statefulEula);
    expect(screen.getByRole('button')).toHaveTextContent('Accept');
    expect(screen.getByText(/Trento Premium/)).toBeTruthy();
  });
});
