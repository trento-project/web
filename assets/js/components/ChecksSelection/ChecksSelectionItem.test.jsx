import React from 'react';

import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { catalogCheckFactory } from '@lib/test-utils/factories';

import ChecksSelectionItem from './ChecksSelectionItem';

describe('ClusterDetails ChecksSelectionItem component', () => {
  it('should show check with selected state', () => {
    const check = catalogCheckFactory.build();

    render(
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

    render(
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

  it('should run the onChange function when the switch button is clicked', async () => {
    const user = userEvent.setup();
    const check = catalogCheckFactory.build();
    const onChangeMock = jest.fn();

    render(
      <ChecksSelectionItem
        key={check.id}
        checkID={check.id}
        name={check.name}
        description={check.description}
        selected
        onChange={onChangeMock}
      />
    );

    await user.click(screen.getByRole('switch'));
    expect(onChangeMock).toBeCalled();
  });

  it('should show premium badge if the check is premium', () => {
    const check = catalogCheckFactory.build();

    render(
      <ChecksSelectionItem
        key={check.id}
        checkID={check.id}
        name={check.name}
        description={check.description}
        premium
        selected
      />
    );

    expect(screen.getByText('Premium')).toBeVisible();
  });
});
