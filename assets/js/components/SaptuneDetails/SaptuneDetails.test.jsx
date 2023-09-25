import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';
import { hostFactory, saptuneStatusFactory } from '@lib/test-utils/factories';

import SaptuneDetails from './SaptuneDetails';

describe('SaptuneDetails', () => {
  it('should render the details correctly', () => {
    const {
      configured_version: configuredVersion,
      package_version: packageVersion,
      tuning_state: tuningState,
    } = saptuneStatusFactory.build();

    const { hostname, id: hostID } = hostFactory.build();

    renderWithRouter(
      <SaptuneDetails
        packageVersion={packageVersion}
        hostname={hostname}
        hostID={hostID}
        configuredVersion={configuredVersion}
        tuningState={tuningState}
      />
    );

    expect(screen.getByText(hostname)).toBeTruthy();

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
});
