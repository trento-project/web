import React from 'react';

import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { renderWithRouter } from '@lib/test-utils';
import { catalogCheckFactory } from '@lib/test-utils/factories';

import ChecksSelectionItem from './ChecksSelectionItem';

describe('ClusterDetails ChecksSelectionItem component', () => {
  it('should show check with selected state', () => {
    const check = catalogCheckFactory.build();

    renderWithRouter(
      <ChecksSelectionItem
        key={check.id}
        checkID={check.id}
        name={check.name}
        description={check.description}
        selected
      />
    );

    expect(screen.getByText(check.id)).toBeVisible();
    expect(screen.getByText(check.name)).toBeVisible();
    expect(screen.getByText(check.description)).toBeVisible();
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('should show check with unselected state', () => {
    const check = catalogCheckFactory.build();

    renderWithRouter(
      <ChecksSelectionItem
        key={check.id}
        checkID={check.id}
        name={check.name}
        description={check.description}
        selected={false}
      />
    );

    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('should run the onChange function when the switch button is clicked', () => {
    const check = catalogCheckFactory.build();
    const onChangeMock = jest.fn();

    renderWithRouter(
      <ChecksSelectionItem
        key={check.id}
        checkID={check.id}
        name={check.name}
        description={check.description}
        selected
        onChange={onChangeMock}
      />
    );

    userEvent.click(screen.getByRole('switch'));
    expect(onChangeMock).toBeCalled();
  });
});
