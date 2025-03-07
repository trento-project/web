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
    customizable | customized | abilities                                     | expectedCustomizationCTA | expectedResetCustomizationCTA
    ${true}      | ${true}    | ${[]}                                         | ${false}                 | ${false}
    ${true}      | ${true}    | ${[fooBarAbility]}                            | ${false}                 | ${false}
    ${true}      | ${true}    | ${[allAbility, fooBarAbility]}                | ${true}                  | ${true}
    ${true}      | ${true}    | ${[checkCustomizationAbility, fooBarAbility]} | ${true}                  | ${true}
    ${false}     | ${false}   | ${[]}                                         | ${false}                 | ${false}
    ${false}     | ${false}   | ${[allAbility]}                               | ${false}                 | ${false}
    ${false}     | ${false}   | ${[checkCustomizationAbility]}                | ${false}                 | ${false}
    ${false}     | ${false}   | ${[fooBarAbility]}                            | ${false}                 | ${false}
    ${true}      | ${false}   | ${[checkCustomizationAbility]}                | ${true}                  | ${false}
  `(
    'should show check customization call to action',
    ({
      customizable,
      customized,
      abilities,
      expectedCustomizationCTA,
      expectedResetCustomizationCTA,
    }) => {
      const check = selectableCheckFactory.build({ customizable, customized });

      render(
        <ChecksSelectionItem
          key={check.id}
          checkID={check.id}
          name={check.name}
          description={check.description}
          selected
          userAbilities={abilities}
          customizable={check.customizable}
          customized={check.customized}
        />
      );

      const customizationCallToAction =
        screen.queryByLabelText('customize-check');

      if (expectedCustomizationCTA) {
        expect(customizationCallToAction).toBeVisible();
      } else {
        expect(customizationCallToAction).toBeNull();
      }

      const resetCustomizationCallToAction = screen.queryByLabelText(
        'reset-check-customization'
      );

      if (expectedResetCustomizationCTA) {
        expect(resetCustomizationCallToAction).toBeVisible();
      } else {
        expect(resetCustomizationCallToAction).toBeNull();
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
    expect(onCustomize).toHaveBeenCalled();
  });

  it('should run the onResetCustomization function when the reset button is clicked', async () => {
    const user = userEvent.setup();
    const check = selectableCheckFactory.build({
      customizable: true,
      customized: true,
    });
    const onResetCustomization = jest.fn();

    render(
      <ChecksSelectionItem
        checkID={check.id}
        name={check.name}
        description={check.description}
        userAbilities={[checkCustomizationAbility]}
        customizable={check.customizable}
        customized={check.customized}
        onResetCustomization={onResetCustomization}
      />
    );

    await user.click(screen.getByLabelText('reset-check-customization'));
    expect(onResetCustomization).toHaveBeenCalled();
  });
});
