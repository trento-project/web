import React from 'react';

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Tags from '.';

describe('Tags', () => {
  it('should disable creation and deletion when the proper user abilities are not present', async () => {
    render(
      <Tags
        tags={['thetag']}
        userAbilities={[{ name: 'all', resource: 'resource' }]}
        tagAdditionPermittedFor={['all:host_tags']}
        tagDeletionPermittedFor={['all:host_tags']}
      />
    );

    expect(screen.queryByText('Add Tag')).toHaveClass('opacity-50');
    // grab the X
    expect(
      screen.queryByText('thetag').children.item(0).children.item(0)
    ).toHaveClass('opacity-50');
  });

  it('should show validation tooltip when inserting an unsupported character in a tag', async () => {
    const user = userEvent.setup();
    const msg = 'invalid character';

    render(
      <Tags
        tags={[]}
        validationMessage={msg}
        userAbilities={[{ name: 'all', resource: 'all' }]}
      />
    );

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

  it('should not show validation message when focusing back on the same tag', async () => {
    const user = userEvent.setup();
    const msg = 'invalid character';

    render(
      <>
        <div>sibling</div>
        <Tags
          tags={[]}
          validationMessage={msg}
          userAbilities={[{ name: 'all', resource: 'all' }]}
        />
      </>
    );

    expect(screen.queryByText(msg)).toBeNull();

    await act(async () => user.click(screen.queryByText('Add Tag')));

    await act(async () => userEvent.keyboard('>'));

    await waitFor(() => expect(screen.queryByText(msg)).toBeVisible());

    await act(async () => user.click(screen.queryByText('sibling')));

    await waitFor(() => expect(screen.queryByText(msg)).toBeNull());

    await act(async () => user.click(screen.queryByText('Add Tag')));

    await waitFor(() => expect(screen.queryByText(msg)).toBeNull());
  });
});
