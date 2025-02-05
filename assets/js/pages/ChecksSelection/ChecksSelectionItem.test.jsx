import React from 'react';

import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { selectableCheckFactory } from '@lib/test-utils/factories';

import ChecksSelectionItem from './ChecksSelectionItem';

describe('ChecksSelectionItem component', () => {
  it('should show check with selected state', () => {
    const check = selectableCheckFactory.build();

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
    expect(screen.queryByText('MODIFIED')).toBeNull();
  });

  it('should show check with unselected state', () => {
    const check = selectableCheckFactory.build();

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

  it('should show a customized check', () => {
    const check = selectableCheckFactory.build();

    render(
      <ChecksSelectionItem
        key={check.id}
        checkID={check.id}
        name={check.name}
        description={check.description}
        selected
        customized
      />
    );

    expect(screen.getByText('MODIFIED')).toBeVisible();
  });

  it('should run the onChange function when the switch button is clicked', async () => {
    const user = userEvent.setup();
    const check = selectableCheckFactory.build();
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
  const fooBarAbility = { name: 'foo', resource: 'bar' };
  const allAbility = { name: 'all', resource: 'all' };
  const checkCustomizationAbility = {
    name: 'all',
    resource: 'check_customization',
  };

  it.each`
    customizable | abilities                                     | expectedCallToAction
    ${true}      | ${[]}                                         | ${false}
    ${true}      | ${[fooBarAbility]}                            | ${false}
    ${true}      | ${[allAbility, fooBarAbility]}                | ${true}
    ${true}      | ${[checkCustomizationAbility, fooBarAbility]} | ${true}
    ${false}     | ${[]}                                         | ${false}
    ${false}     | ${[allAbility]}                               | ${false}
    ${false}     | ${[checkCustomizationAbility]}                | ${false}
    ${false}     | ${[fooBarAbility]}                            | ${false}
  `(
    'should show check customization call to action',
    ({ customizable, abilities, expectedCallToAction }) => {
      const check = selectableCheckFactory.build({ customizable });

      render(
        <ChecksSelectionItem
          key={check.id}
          checkID={check.id}
          name={check.name}
          description={check.description}
          selected
          userAbilities={abilities}
          customizable={check.customizable}
        />
      );

      const customizationCallToAction =
        screen.queryByLabelText('customize-check');

      if (expectedCallToAction) {
        expect(customizationCallToAction).toBeVisible();
      } else {
        expect(customizationCallToAction).toBeNull();
      }
    }
  );

  it('should run the onCustomize function when the customize button is clicked', async () => {
    const user = userEvent.setup();
    const check = selectableCheckFactory.build({ customizable: true });
    const onCustomize = jest.fn();

    render(
      <ChecksSelectionItem
        key={check.id}
        checkID={check.id}
        name={check.name}
        description={check.description}
        selected
        userAbilities={[checkCustomizationAbility]}
        customizable={check.customizable}
        onCustomize={onCustomize}
      />
    );

    await user.click(screen.getByLabelText('customize-check'));
    expect(onCustomize).toHaveBeenCalledWith(check.id);
  });
});
