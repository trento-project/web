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

export const TUNING_VALUES = {
  compliant: 'Compliant',
  'not compliant': 'Not compliant',
  'not tuned': 'No tuning',
};

describe('SaptuneDetails', () => {
  const customSaptuneService = {
    active: 'active',
    enabled: 'enabled',
    name: 'saptune',
  };

  const customSapconfService = {
    active: 'active',
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

  const { hostname, id: hostID } = hostFactory.build();

  it('should render saptune details correctly', () => {
    const {
      configured_version: configuredVersion,
      package_version: packageVersion,
      tuning_state: tuningState,
    } = saptuneStatusFactory.build();

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
      TUNING_VALUES[tuningState]
    );

    expect(screen.getByText('saptune.service').nextSibling).toHaveTextContent(
      `${customSaptuneService.enabled}/${customSaptuneService.active}`
    );

    expect(screen.getByText('sapconf.service').nextSibling).toHaveTextContent(
      `${customSapconfService.enabled}/${customSapconfService.active}`
    );
    expect(screen.getByText('tuned.service').nextSibling).toHaveTextContent(
      `-`
    );
    expect(screen.getByText('Enabled Solution').nextSibling).toHaveTextContent(
      `${solution.id} (${solution.notes.join(', ')})`
    );
    expect(screen.getByText('Applied Solution').nextSibling).toHaveTextContent(
      `${solution.id} (${solution.notes.join(', ')})`
    );
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

  it('should render all the icons properly', () => {
    const packageVersion = '3.0.0';
    const tuningState = 'not compliant';
    const { configured_version: configuredVersion } =
      saptuneStatusFactory.build();

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

    const serviceStatusIcons = screen.getAllByTestId('eos-svg-component');
    expect(serviceStatusIcons).toHaveLength(5);
    expect(serviceStatusIcons[0]).toHaveClass('fill-jungle-green-500');
    expect(serviceStatusIcons[1]).toHaveClass('fill-yellow-500');
    expect(serviceStatusIcons[2]).toHaveClass('fill-red-500');
    expect(serviceStatusIcons[3]).toHaveClass('fill-jungle-green-500');
    expect(serviceStatusIcons[4]).toHaveClass('fill-red-500');
  });
});
