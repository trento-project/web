import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { capitalize, concat } from 'lodash';

import { renderWithRouter } from '@lib/test-utils';
import { clusterResourceFactory, hostFactory } from '@lib/test-utils/factories';

import Resources from './Resources';

describe('Resources', () => {
  it('should display standalone resources', () => {
    const resources = clusterResourceFactory.buildList(5, { parent: null });

    render(<Resources resources={resources} hosts={[]} />);

    const rows = screen.getByRole('table').querySelectorAll('tbody > tr');

    expect(rows).toHaveLength(5);

    rows.forEach((row, index) => {
      expect(row.querySelector('td:nth-child(2)')).toHaveTextContent(
        resources[index].fail_count
      );
      expect(row.querySelector('td:nth-child(3)')).toHaveTextContent(
        resources[index].id
      );
      expect(row.querySelector('td:nth-child(5)')).toHaveTextContent(
        resources[index].role
      );
      expect(row.querySelector('td:nth-child(6)')).toHaveTextContent(
        resources[index].status
      );
      expect(row.querySelector('td:nth-child(7)')).toHaveTextContent(
        capitalize(resources[index].managed)
      );
      expect(row.querySelector('td:nth-child(8)')).toHaveTextContent(
        resources[index].type
      );
    });
  });

  it('should display grouped resources', () => {
    const resources = concat(
      clusterResourceFactory.buildList(2, { parent: { id: 'group1' } }),
      clusterResourceFactory.buildList(2, { parent: { id: 'group2' } })
    );

    render(<Resources resources={resources} hosts={[]} />);

    const rows = screen.getByRole('table').querySelectorAll('tbody > tr');

    expect(rows).toHaveLength(6);

    [rows[0], rows[3]].forEach((row, index) => {
      const parentIndex = index * 2;
      expect(row.querySelector('td:nth-child(3)')).toHaveTextContent(
        resources[parentIndex].parent.id
      );
      expect(row.querySelector('td:nth-child(7)')).toHaveTextContent(
        capitalize(resources[parentIndex].parent.managed)
      );
      expect(row.querySelector('td:nth-child(8)')).toHaveTextContent(
        resources[parentIndex].type
      );
    });

    [rows[1], rows[2], rows[4], rows[5]].forEach((row, index) => {
      expect(row.querySelector('td:nth-child(3)')).toHaveTextContent(
        resources[index].id
      );
    });
  });

  it('should attach the correct host', () => {
    const hosts = hostFactory.buildList(2);
    const nodename = hosts[0].hostname;
    const resources = clusterResourceFactory.buildList(1, {
      node: nodename,
      parent: null,
    });

    renderWithRouter(<Resources resources={resources} hosts={hosts} />);

    const locationCell = screen
      .getByRole('table')
      .querySelector('tbody > tr > td:nth-child(4)');

    expect(locationCell).toHaveTextContent(nodename);
    expect(locationCell.querySelector('a')).toHaveAttribute(
      'href',
      `/hosts/${hosts[0].id}`
    );
  });

  it('should identify generic Group type', () => {
    const resources = clusterResourceFactory.buildList(1, {
      parent: { multi_state: null },
    });

    render(<Resources resources={resources} hosts={[]} />);

    const typeCell = screen
      .getByRole('table')
      .querySelector('tbody > tr > td:nth-child(8)');

    expect(typeCell).toHaveTextContent('Group');
  });
});
