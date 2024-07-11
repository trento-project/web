import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';

import ClusterTypeLabel from './ClusterTypeLabel';

describe('ClusterTypeLabel component', () => {
  it.each([
    { clusterType: 'hana_scale_up', label: 'HANA Scale Up' },
    { clusterType: 'hana_scale_out', label: 'HANA Scale Out' },
    { clusterType: 'ascs_ers', label: 'ASCS/ERS' },
  ])(
    'should display the correct $clusterType cluster type label',
    ({ clusterType, label }) => {
      render(
        <ClusterTypeLabel
          clusterType={clusterType}
          architectureType="classic"
        />
      );
      expect(screen.getByText(label)).toBeVisible();
    }
  );

  it('should display a green star icon when the cluster uses angi architecture', async () => {
    const user = userEvent.setup();

    render(
      <ClusterTypeLabel clusterType="hana_scale_up" architectureType="angi" />
    );
    expect(screen.getByText('HANA Scale Up')).toBeTruthy();

    const icon = screen.getByTestId('eos-svg-component');
    expect(icon.classList.toString()).toContain('fill-jungle-green-500');

    await user.hover(icon);
    expect(screen.getByText('Angi architecture')).toBeInTheDocument();
  });

  it('should display an info icon when the cluster uses classic architecture', async () => {
    const user = userEvent.setup();

    renderWithRouter(
      <ClusterTypeLabel
        clusterType="hana_scale_up"
        architectureType="classic"
      />
    );
    expect(screen.getByText('HANA Scale Up')).toBeTruthy();

    const icon = screen.getByTestId('eos-svg-component');

    await user.hover(icon);
    expect(
      screen.getByText('Classic architecture', { exact: false })
    ).toBeInTheDocument();
  });
});
