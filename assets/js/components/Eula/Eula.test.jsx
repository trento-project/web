import React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { withState } from '@lib/test-utils';
import { setEulaVisible } from '@state/settings';

import Eula from '.';

describe('Eula component', () => {
  it('should render correctly', () => {
    const [statefulEula, store] = withState(<Eula />);

    store.dispatch(setEulaVisible());

    render(statefulEula);
    expect(screen.getByRole('button')).toHaveTextContent('Accept');
  });
});
