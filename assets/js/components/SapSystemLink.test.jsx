import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithRouter } from '@lib/test-utils';
import SapSystemLink from '@components/SapSystemLink';
import { sapSystemFactory } from '@lib/test-utils/factories';

describe('SapSystemLink', () => {
  it('renders Link when sapSystemId and systemType is provided', () => {
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

  it('renders warning span when sapSystemId or systemType are not provided', () => {
    const { sid } = sapSystemFactory.build();

    render(<SapSystemLink>{sid}</SapSystemLink>);

    const sidElement = screen.getByText(sid);
    fireEvent.mouseOver(sidElement);
    expect(
      screen.getByText('SAP System currently not registered.')
    ).toBeInTheDocument();
  });
});
