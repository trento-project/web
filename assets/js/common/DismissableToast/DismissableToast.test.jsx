import React from 'react';
import { toast } from 'react-hot-toast';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import DismissableToast from '.';

describe('DismissableToast component', () => {
  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });

  it('renders the text and forward the onclick event with the provided prop id', async () => {
    const spy = jest.spyOn(toast, 'dismiss');
    const toastID = 'toast-1';
    const user = userEvent.setup();

    render(<DismissableToast text="test" id={toastID} />);

    expect(screen.getByText('test')).toBeVisible();
    await user.click(screen.getByText('Close'));

    expect(spy).toHaveBeenCalled();
  });
});
