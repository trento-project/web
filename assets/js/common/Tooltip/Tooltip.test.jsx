import React from 'react';

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Tooltip from '.';

describe('Tooltip', () => {
  it('should show a text when mouse is hovering', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Tooltip content="This is my tooltip text">This is my anchor</Tooltip>
      </div>
    );

    expect(screen.queryByText('This is my tooltip text')).toBeNull();

    await act(async () => user.hover(screen.queryByText('This is my anchor')));

    await waitFor(() =>
      expect(screen.queryByText('This is my tooltip text')).toBeVisible()
    );
  });

  it('should show a text when mouse is hovering and wrap is false', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Tooltip content="This is my tooltip text" wrap={false}>
          <div>This is my anchor</div>
        </Tooltip>
      </div>
    );

    expect(screen.queryByText('This is my tooltip text')).toBeNull();

    await act(async () => user.hover(screen.queryByText('This is my anchor')));

    await waitFor(() =>
      expect(screen.queryByText('This is my tooltip text')).toBeVisible()
    );
  });

  it('should show a text regardless of the mouse event when visible is set to true', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Tooltip content="This is my tooltip text" wrap={false} visible>
          <div>This is my anchor</div>
        </Tooltip>
      </div>
    );

    expect(screen.queryByText('This is my tooltip text')).toBeVisible();

    await act(async () => user.hover(screen.queryByText('This is my anchor')));

    await waitFor(() =>
      expect(screen.queryByText('This is my tooltip text')).toBeVisible()
    );
  });

  it('should not show a text regardless of the mouse event when visible is set to false', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Tooltip content="This is my tooltip text" wrap={false} visible={false}>
          <div>This is my anchor</div>
        </Tooltip>
      </div>
    );

    expect(screen.queryByText('This is my tooltip text')).toBeNull();

    await act(async () => user.hover(screen.queryByText('This is my anchor')));

    await waitFor(() =>
      expect(screen.queryByText('This is my tooltip text')).toBeNull()
    );
  });

  it('should hide the text when the mouse go away', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Tooltip content="This is my tooltip text">This is my anchor</Tooltip>
      </div>
    );

    expect(screen.queryByText('This is my tooltip text')).toBeNull();

    await act(async () => user.hover(screen.queryByText('This is my anchor')));
    await act(async () =>
      user.unhover(screen.queryByText('This is my anchor'))
    );

    await waitFor(() =>
      expect(screen.queryByText('This is my tooltip text')).not.toBeVisible()
    );
  });
});
