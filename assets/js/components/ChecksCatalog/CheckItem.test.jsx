import React from 'react';

import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { renderWithRouter } from '@lib/test-utils';
import { catalogCheckFactory } from '@lib/test-utils/factories';

import CheckItem from './CheckItem';

describe('ChecksCatalog CheckItem component', () => {
  it('should show check information', () => {
    const check = catalogCheckFactory.build();

    renderWithRouter(
      <CheckItem
        key={check.id}
        checkID={check.id}
        description={check.description}
        remediation={check.remediation}
      />
    );

    expect(screen.getByText(check.id)).toBeVisible();
    expect(screen.getByText(check.description)).toBeVisible();
  });

  it('should show premium badge if the check is premium', () => {
    const check = catalogCheckFactory.build();

    renderWithRouter(
      <CheckItem
        key={check.id}
        checkID={check.id}
        premium
        description={check.description}
        remediation={check.remediation}
      />
    );

    expect(screen.getByText('Premium')).toBeVisible();
  });

  it('should show check remediation when the row is clicked', async () => {
    const check = catalogCheckFactory.build();
    const user = userEvent.setup();

    renderWithRouter(
      <CheckItem
        key={check.id}
        checkID={check.id}
        description={check.description}
        remediation={check.remediation}
      />
    );

    const checkDiv = screen.getByText(check.id);

    expect(screen.queryByText(check.remediation)).not.toBeInTheDocument();
    await user.click(checkDiv);
    expect(screen.getByText(check.remediation)).toBeVisible();
    await user.click(checkDiv);
    expect(screen.queryByText(check.remediation)).not.toBeInTheDocument();
  });
});
