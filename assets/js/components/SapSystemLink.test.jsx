import React from 'react';
import { screen, render, fireEvent as userEvent } from '@testing-library/react';
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

  it('renders tooltip when sapSystemId or systemType are not provided', () => {
    const { sid } = sapSystemFactory.build();

    render(<SapSystemLink>{sid}</SapSystemLink>);

    const sidElement = screen.getByText(sid);
    userEvent.mouseOver(sidElement);
    expect(
      screen.getByText('SAP System currently not registered.')
    ).toBeInTheDocument();
  });
});
