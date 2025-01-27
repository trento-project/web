import React from 'react';

import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { catalogCheckFactory } from '@lib/test-utils/factories';

import ChecksSelectionItem from './ChecksSelectionItem';

describe('ChecksSelectionItem component', () => {
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
});

describe('Checks Customizability', () => {
  it.each`
    customizable
    ${true}
    ${false}
  `('should show check customization call to action', ({ customizable }) => {
    const check = catalogCheckFactory.build({ customizable });

    render(
      <ChecksSelectionItem
        key={check.id}
        checkID={check.id}
        name={check.name}
        description={check.description}
        selected
        customizable={check.customizable}
      />
    );

    const customizationCallToAction =
      screen.queryByLabelText('customize-check');

    if (customizable) {
      expect(customizationCallToAction).toBeVisible();
    } else {
      expect(customizationCallToAction).toBeNull();
    }
  });

  it('should run the onCustomize function when the customize button is clicked', async () => {
    const user = userEvent.setup();
    const check = catalogCheckFactory.build({ customizable: true });
    const onCustomize = jest.fn();

    render(
      <ChecksSelectionItem
        key={check.id}
        checkID={check.id}
        name={check.name}
        description={check.description}
        selected
        customizable={check.customizable}
        onCustomize={onCustomize}
      />
    );

    await user.click(screen.getByLabelText('customize-check'));
    expect(onCustomize).toHaveBeenCalledWith(check.id);
  });
});
