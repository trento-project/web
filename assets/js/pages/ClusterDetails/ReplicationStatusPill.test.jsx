import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ReplicationStatusPill from './ReplicationStatusPill';

describe('ReplicationStatusPill', () => {
  const scenarios = [
    {
      status: 'Unknown',
      pillClass: 'bg-gray-100 text-gray-800',
    },
    {
      status: 'Primary',
      pillClass: 'bg-green-100 text-green-800',
    },
    {
      status: 'Secondary',
      pillClass: 'bg-green-100 text-green-800',
    },
    {
      status: 'Failed',
      pillClass: 'bg-red-100 text-red-800',
    },
  ];

  it.each(scenarios)(
    'should display the correct pill',
    ({ status, pillClass }) => {
      render(<ReplicationStatusPill status={status} />);
      expect(screen.getByText(status)).toBeTruthy();
      expect(screen.getByText(status)).toHaveClass(pillClass);
    }
  );
});
