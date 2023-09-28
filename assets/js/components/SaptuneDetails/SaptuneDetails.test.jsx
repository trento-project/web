import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';
import {
  hostFactory,
  saptuneNoteFactory,
  saptuneSolutionFactory,
  saptuneStagingFactory,
  saptuneStatusFactory,
} from '@lib/test-utils/factories';

import SaptuneDetails from './SaptuneDetails';

describe('SaptuneDetails', () => {
  it('should render the details correctly', () => {
    const customSaptuneService = {
      active: 'active',
      enabled: 'enabled',
      name: 'saptune',
    };

    const customSapconfService = {
      active: 'inactive',
      enabled: 'disabled',
      name: 'sapconf',
    };

    const customTunedService = {
      active: null,
      enabled: null,
      name: 'tuned',
    };

    const services = [
      customSaptuneService,
      customSapconfService,
      customTunedService,
    ];
    const solution = saptuneSolutionFactory.build({ partial: false });
    const { notes } = solution;
    const allNotes = notes.map((id) => saptuneNoteFactory.build({ id }));

    const staging = saptuneStagingFactory.build({ enabled: true });

    const {
      configured_version: configuredVersion,
      package_version: packageVersion,
      tuning_state: tuningState,
    } = saptuneStatusFactory.build();
    const { hostname, id: hostID } = hostFactory.build();

    renderWithRouter(
      <SaptuneDetails
        appliedNotes={allNotes}
        appliedSolution={solution}
        enabledNotes={allNotes}
        enabledSolution={solution}
        configuredVersion={configuredVersion}
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

    expect(screen.getByText('Saptune Services Status')).toBeInTheDocument();
    expect(screen.getByText('saptune.service').nextSibling).toHaveTextContent(
      `${customSaptuneService.enabled}/${customSaptuneService.active}`
    );
    expect(screen.getByText('sapconf.service').nextSibling).toHaveTextContent(
      `${customSapconfService.enabled}/${customSapconfService.active}`
    );
    expect(screen.getByText('tuned.service').nextSibling).toHaveTextContent(
      `-`
    );
    expect(screen.getByText('Saptune Tuning Solutions')).toBeInTheDocument();
    expect(screen.getByText('Enabled Solution').nextSibling).toHaveTextContent(
      `${solution.id} (${solution.notes.join(', ')})`
    );
    expect(screen.getByText('Applied Solution').nextSibling).toHaveTextContent(
      `${solution.id} (${solution.notes.join(', ')})`
    );
    expect(screen.getByText('Saptune Staging Status')).toBeInTheDocument();
    expect(screen.getByText('Staging').nextSibling).toHaveTextContent(
      `Enabled`
    );
    expect(screen.getByText('Staged Notes').nextSibling).toHaveTextContent(
      `${staging.notes.join(', ')}`
    );
    expect(screen.getByText('Staged Solutions').nextSibling).toHaveTextContent(
      staging.solutions_ids
    );
  });
});
