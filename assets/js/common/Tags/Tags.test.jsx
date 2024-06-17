import React from 'react';

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Tags from '.';

describe('Tags', () => {
  it('should show validation tooltip when inserting an unsuported character in a tag', async () => {
    const user = userEvent.setup();
    const msg = 'invalid character';

    render(<Tags tags={[]} validationMessage={msg} />);

    expect(screen.queryByText(msg)).toBeNull();

    await act(async () => user.click(screen.queryByText('Add Tag')));

    await act(async () => userEvent.keyboard('A'));

    await waitFor(() => expect(screen.queryByText(msg)).toBeNull());

    await act(async () => userEvent.keyboard('>'));

    await waitFor(() => expect(screen.queryByText(msg)).toBeVisible());

    await act(async () => userEvent.keyboard('Z'));

    // FIXME: The visibility is due to a css class.
    // Being the css is not loaded, it cannot be detected by js-dom
    // await waitFor(() => expect(screen.queryByText(msg)).not.toBeVisible());
  });
});
