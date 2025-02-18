import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';

import ResetCheckCustomizationModal from '.';

describe('ResetCheckCustomizationModal component', () => {
  it('should render the reset check customization confirmation modal correctly', async () => {
    const checkId = faker.string.uuid();

    await act(async () => {
      render(<ResetCheckCustomizationModal checkId={checkId} open />);
    });

    expect(screen.getByText(`Reset check: ${checkId}`)).toBeVisible();
    expect(
      screen.getByText(
        'You are about to reset custom checks values. Would you like to continue?'
      )
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it.each`
    scenario                                          | button      | callbackName
    ${'should confirm resetting check customization'} | ${'Reset'}  | ${'onReset'}
    ${'should cancel reset confirmation'}             | ${'Cancel'} | ${'onCancel'}
  `('$scenario', async ({ button, callbackName }) => {
    const callback = jest.fn();

    await act(async () => {
      render(
        <ResetCheckCustomizationModal
          checkId={faker.string.uuid()}
          open
          {...{ [callbackName]: callback }}
        />
      );
    });

    await userEvent.click(screen.getByText(button));
    expect(callback).toHaveBeenCalled();
  });
});
