import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { faker } from '@faker-js/faker';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@lib/test-utils';
import ChecksSelectionHints from './ChecksSelectionHints';

describe('ChecksSelectionHints', () => {
  const clusterId = faker.datatype.uuid();
  const selectedChecks = [];
  const usingNewChecksEngine = true;

  it('when usingNewChecksEngine is true, navigate link is redirecting to clusters_new path', () => {
    renderWithRouter(
      <ChecksSelectionHints
        clusterId={clusterId}
        selectedChecks={selectedChecks}
        usingNewChecksEngine={usingNewChecksEngine}
      />
    );

    const selectChecksButton = screen.getByText(/Select Checks now!/i);
    fireEvent.click(selectChecksButton);
    expect(window.location.pathname).toBe(
      `/clusters_new/${clusterId}/settings`
    );
  });

  it('when usingNewChecksEngine is false, navigate link is not redirecting to clusters path', () => {
    renderWithRouter(
      <ChecksSelectionHints
        clusterId={clusterId}
        selectedChecks={selectedChecks}
        usingNewChecksEngine={!usingNewChecksEngine}
      />
    );

    const selectChecksButton = screen.getByText(/Select Checks now!/i);
    fireEvent.click(selectChecksButton);
    expect(window.location.pathname).toBe(`/clusters/${clusterId}/settings`);
  });
});
