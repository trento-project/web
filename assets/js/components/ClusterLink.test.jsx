import React from 'react';

import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithRouter } from '@lib/test-utils';

import { clusterFactory } from '@lib/test-utils/factories';

import ClusterLink from './ClusterLink';

describe('ClusterLink component', () => {
  it.each(['hana_scale_up', 'hana_scale_out', 'ascs_ers'])(
    'should render a link if the cluster type is %s',
    (type) => {
      const cluster = clusterFactory.build({ type });

      renderWithRouter(<ClusterLink cluster={cluster} />);

      const link = screen.getByRole('link');

      expect(link).toHaveTextContent(cluster.name);
      expect(link).toHaveAttribute('href', `/clusters/${cluster.id}`);
    }
  );

  it('should show a simple text if the cluster type is unknown', () => {
    const cluster = clusterFactory.build({ type: 'unknown' });

    renderWithRouter(<ClusterLink cluster={cluster} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(cluster.name)).toBeInTheDocument();
  });

  it('should show the cluster ID if the name is not available', () => {
    const cluster = clusterFactory.build({ name: '' });

    renderWithRouter(<ClusterLink cluster={cluster} />);

    expect(screen.getByText(cluster.id)).toBeInTheDocument();
  });
});
