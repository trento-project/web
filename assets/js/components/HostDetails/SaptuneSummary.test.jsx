import React from 'react';
import { render, screen } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import { SUPPORTED_VERSION } from '@lib/saptune';
import { saptuneStatusFactory } from '@lib/test-utils/factories';

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
      new RegExp(tuningState, 'i')
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
});
