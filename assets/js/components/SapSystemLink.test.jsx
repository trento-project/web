import React from 'react';
import { act, screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { renderWithRouter } from '@lib/test-utils';
import { sapSystemFactory } from '@lib/test-utils/factories';
import SapSystemLink from '@components/SapSystemLink';

describe('SapSystemLink', () => {
  it('renders Link when sapSystemId and systemType are provided', () => {
    const { id, sid } = sapSystemFactory.build();

    renderWithRouter(
      <SapSystemLink systemType="databases" sapSystemId={id}>
        {sid}
      </SapSystemLink>
    );

    const sapSystemLinkElement = screen.getByRole('link', { sid });

    expect(sapSystemLinkElement).toBeInTheDocument();
    expect(sapSystemLinkElement).toHaveAttribute('href', `/databases/${id}`);
  });

  it('renders tooltip when sapSystemId or systemType are not provided', async () => {
    const user = userEvent.setup();
    const { sid } = sapSystemFactory.build();

    render(<SapSystemLink>{sid}</SapSystemLink>);

    const sidElement = screen.getByText(sid);

    await act(async () => user.hover(sidElement));

    expect(
      screen.getByText('System currently not registered.')
    ).toBeInTheDocument();
  });
});
