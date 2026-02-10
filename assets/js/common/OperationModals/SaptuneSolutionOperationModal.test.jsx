import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { waiveOperationDisclaimer } from '@lib/operations';
import {
  SAPTUNE_SOLUTION_APPLY,
  SAPTUNE_SOLUTION_CHANGE,
} from '@lib/operations';
import SaptuneSolutionOperationModal from './SaptuneSolutionOperationModal';

describe('SaptuneSolutionOperationModal', () => {
  beforeAll(() => waiveOperationDisclaimer());

  it.each`
    operation                  | title
    ${SAPTUNE_SOLUTION_APPLY}  | ${'Apply Saptune solution'}
    ${SAPTUNE_SOLUTION_CHANGE} | ${'Change Saptune solution'}
  `(
    'should show correct title and description',
    async ({ operation, title }) => {
      render(<SaptuneSolutionOperationModal operation={operation} isOpen />);

      expect(screen.getByText(title)).toBeInTheDocument();
      expect(
        screen.getByText('Select Saptune tuning solution')
      ).toBeInTheDocument();
    }
  );

  it('should forbid applying a solution until one is actually selected', async () => {
    const user = userEvent.setup();

    render(
      <SaptuneSolutionOperationModal
        operation={SAPTUNE_SOLUTION_APPLY}
        isOpen
        isAppRunning
      />
    );

    expect(screen.getByText('Request')).toBeDisabled();

    await user.click(screen.getByText('Select a saptune solution'));
    await user.click(screen.getByText('NETWEAVER'));

    expect(screen.getByText('Request')).toBeEnabled();
  });

  it('should reset internal state when closing the modal', async () => {
    const user = userEvent.setup();

    const { rerender } = await act(async () =>
      render(
        <SaptuneSolutionOperationModal
          operation={SAPTUNE_SOLUTION_APPLY}
          isOpen
          isAppRunning
        />
      )
    );

    await user.click(screen.getByText('Select a saptune solution'));
    await user.click(screen.getByText('NETWEAVER'));

    await user.click(screen.getByText('Cancel'));

    await act(async () =>
      rerender(
        <SaptuneSolutionOperationModal
          operation={SAPTUNE_SOLUTION_APPLY}
          isOpen
          isAppRunning
        />
      )
    );

    await waitFor(() => {
      expect(screen.getByText('Request')).toBeDisabled();
      expect(screen.getByText('Select a saptune solution')).toBeEnabled();
    });
  });

  it('should call onCancel callback', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    await act(async () =>
      render(
        <SaptuneSolutionOperationModal
          operation={SAPTUNE_SOLUTION_APPLY}
          isOpen
          isAppRunning
          onCancel={onCancel}
        />
      )
    );

    await user.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalled();
  });

  it('should render HANA solutions', async () => {
    const user = userEvent.setup();
    const mockOnRequest = jest.fn();

    render(
      <SaptuneSolutionOperationModal
        operation={SAPTUNE_SOLUTION_APPLY}
        isOpen
        isHanaRunning
        onRequest={mockOnRequest}
      />
    );

    expect(screen.getByText('Request')).toBeDisabled();

    await user.click(screen.getByText('Select a saptune solution'));

    expect(screen.getByText('HANA')).toBeInTheDocument();
    expect(screen.getByText('S4HANA-DBSERVER')).toBeInTheDocument();

    await user.click(screen.getByText('HANA'));
    await user.click(screen.getByText('Request'));

    expect(mockOnRequest).toHaveBeenCalledWith('HANA');
  });

  it('should render Application solutions', async () => {
    const user = userEvent.setup();

    render(
      <SaptuneSolutionOperationModal
        operation={SAPTUNE_SOLUTION_APPLY}
        isOpen
        isAppRunning
      />
    );

    await user.click(screen.getByText('Select a saptune solution'));

    expect(screen.getByText('NETWEAVER')).toBeInTheDocument();
    expect(screen.getByText('S4HANA-APPSERVER')).toBeInTheDocument();
  });

  it('should render HANA and Application solutions', async () => {
    const user = userEvent.setup();

    render(
      <SaptuneSolutionOperationModal
        operation={SAPTUNE_SOLUTION_APPLY}
        isOpen
        isHanaRunning
        isAppRunning
      />
    );

    await waitFor(async () => {
      await user.click(screen.getByText('Select a saptune solution'));

      expect(screen.getByText('S4HANA-APP+DB')).toBeInTheDocument();
      expect(screen.getByText('NETWEAVER+HANA')).toBeInTheDocument();
    });
  });

  it('should render proper options when a solution is currently applied', async () => {
    const user = userEvent.setup();

    render(
      <SaptuneSolutionOperationModal
        operation={SAPTUNE_SOLUTION_CHANGE}
        isOpen
        isHanaRunning
        currentlyApplied="HANA"
      />
    );

    expect(screen.getByRole('button', { name: 'HANA' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'HANA' }));

    expect(
      screen.queryByText('Select a saptune solution')
    ).not.toBeInTheDocument();
  });

  it('currently applied solution should be disabled', async () => {
    const user = userEvent.setup();

    render(
      <SaptuneSolutionOperationModal
        operation={SAPTUNE_SOLUTION_CHANGE}
        isOpen
        isHanaRunning
        currentlyApplied="HANA"
      />
    );

    await user.click(screen.getByRole('button', { name: 'HANA' }));

    expect(screen.getByRole('option', { name: 'HANA' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});
