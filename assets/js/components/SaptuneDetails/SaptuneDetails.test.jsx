import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';
import { hostFactory, saptuneStatusFactory } from '@lib/test-utils/factories';

import SaptuneDetails from './SaptuneDetails';

describe('SaptuneDetails', () => {
  it('should render the details correctly', () => {
    const {
      applied_notes: appliedNotes,
      applied_solution: appliedSolution,
      configured_version: configuredVersion,
      enabled_solution: enabledSolution,
      enabled_notes: enabledNotes,
      package_version: packageVersion,
      services,
      staging,
      tuning_state: tuningState,
    } = saptuneStatusFactory.build();

    const { hostname, id: hostID } = hostFactory.build();

    renderWithRouter(
      <SaptuneDetails
        appliedNotes={appliedNotes}
        appliedSolution={appliedSolution}
        configuredVersion={configuredVersion}
        enabledNotes={enabledNotes}
        enabledSolution={enabledSolution}
        hostname={hostname}
        hostID={hostID}
        packageVersion={packageVersion}
        services={services}
        staging={staging}
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
