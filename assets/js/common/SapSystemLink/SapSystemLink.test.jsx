import React from 'react';
import { act, screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { renderWithRouter } from '@lib/test-utils';
import { sapSystemFactory } from '@lib/test-utils/factories';
import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';
import SapSystemLink from './SapSystemLink';

describe('SapSystemLink', () => {
  it('renders database link when sapSystemId and systemType are provided', () => {
    const { id, sid } = sapSystemFactory.build();

    renderWithRouter(
      <SapSystemLink systemType={DATABASE_TYPE} sapSystemId={id}>
        {sid}
      </SapSystemLink>
    );

    const sapSystemLinkElement = screen.getByRole('link', { sid });

    expect(sapSystemLinkElement).toBeInTheDocument();
    expect(sapSystemLinkElement).toHaveAttribute('href', `/databases/${id}`);
  });

  it('renders SAP system link when sapSystemId and systemType are provided', () => {
    const { id, sid } = sapSystemFactory.build();

    renderWithRouter(
      <SapSystemLink systemType={APPLICATION_TYPE} sapSystemId={id}>
        {sid}
      </SapSystemLink>
    );

    const sapSystemLinkElement = screen.getByRole('link', { sid });

    expect(sapSystemLinkElement).toBeInTheDocument();
    expect(sapSystemLinkElement).toHaveAttribute('href', `/sap_systems/${id}`);
  });

  it.each([
    {
      systemType: APPLICATION_TYPE,
      expectedTooltip: 'SAP system currently not registered',
    },
    {
      systemType: DATABASE_TYPE,
      expectedTooltip: 'HANA database currently not registered',
    },
    {
      systemType: 'unknown',
      expectedTooltip: 'System currently not registered',
    },
    {
      systemType: undefined,
      expectedTooltip: 'System currently not registered',
    },
  ])(
    `renders $systemType tooltip when sapSystemId or systemType are not provided`,
    async ({ systemType, expectedTooltip }) => {
      const user = userEvent.setup();
      const { sid } = sapSystemFactory.build();

      render(<SapSystemLink systemType={systemType}>{sid}</SapSystemLink>);

      const sidElement = screen.getByText(sid);

      await act(async () => user.hover(sidElement));

      expect(screen.getByText(expectedTooltip)).toBeInTheDocument();
    }
  );
});
