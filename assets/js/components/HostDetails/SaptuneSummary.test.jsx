import React from 'react';
import { render, screen } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { SUPPORTED_VERSION } from '@lib/saptune';
import { saptuneStatusFactory } from '@lib/test-utils/factories';
import { TUNING_VALUES } from '@components/SaptuneDetails/SaptuneDetails.test';

import SaptuneSummary from './SaptuneSummary';

describe('SaptuneSummary component', () => {
  it('should show the summary of saptune', () => {
    const saptuneStatus = saptuneStatusFactory.build();
    const {
      package_version: packageVersion,
      configured_version: configuredVersion,
      tuning_state: tuningState,
    } = saptuneStatus;

    render(
      <SaptuneSummary
        saptuneVersion={packageVersion}
        saptuneConfiguredVersion={configuredVersion}
        saptuneTuning={tuningState}
      />
    );

    expect(screen.getByText('Package').nextSibling).toHaveTextContent(
      packageVersion
    );

    expect(
      screen.getByText('Configured Version').nextSibling
    ).toHaveTextContent(configuredVersion);

    expect(screen.getByText('Tuning').nextSibling).toHaveTextContent(
      TUNING_VALUES[tuningState]
    );
  });

  it('should enable saptune details button', () => {
    render(<SaptuneSummary saptuneVersion={SUPPORTED_VERSION} />);

    expect(
      screen.getByRole('button', {
        name: 'View Details',
      })
    ).toBeEnabled();
  });

  it('should disable saptune details button', () => {
    render(<SaptuneSummary saptuneVersion="3.0.0" />);

    expect(
      screen.getByRole('button', {
        name: 'View Details',
      })
    ).toBeDisabled();
  });

  it('should run the onViewDetails function when button is clicked', async () => {
    const user = userEvent.setup();
    const mockedOnViewDetails = jest.fn();

    render(
      <SaptuneSummary
        saptuneVersion={SUPPORTED_VERSION}
        onViewDetails={mockedOnViewDetails}
      />
    );

    await user.click(screen.getByRole('button', { name: 'View Details' }));
    expect(mockedOnViewDetails).toHaveBeenCalled();
  });
});
