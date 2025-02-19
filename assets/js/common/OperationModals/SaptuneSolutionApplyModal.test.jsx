import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import SaptuneSolutionApplyModal from './SaptuneSolutionApplyModal';

describe('SaptuneSolutionApplyModal', () => {
  it('should show correct title and description', async () => {
    await act(async () => {
      render(<SaptuneSolutionApplyModal isOpen onCancel={noop} />);
    });

    expect(screen.getByText('Apply Saptune Solution')).toBeInTheDocument();
    expect(
      screen.getByText('Select Saptune tuning solution')
    ).toBeInTheDocument();
  });

  it('should forbid choosing and applying solution until accepting the checkbox', async () => {
    await act(async () => {
      render(<SaptuneSolutionApplyModal isOpen onCancel={noop} />);
    });

    expect(screen.getByText('Apply')).toBeDisabled();
    expect(screen.getByText('Select a saptune solution')).toBeDisabled();
  });

  it('should render HANA solutions', async () => {
    const user = userEvent.setup();
    const mockOnRequest = jest.fn();

    await act(async () => {
      render(
        <SaptuneSolutionApplyModal
          isOpen
          isHanaRunning
          onCancel={noop}
          onRequest={mockOnRequest}
        />
      );
    });

    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByText('Apply')).toBeDisabled();

    await user.click(screen.getByText('Select a saptune solution'));

    expect(screen.getByText('HANA')).toBeInTheDocument();
    expect(screen.getByText('S4HANA-DBSERVER')).toBeInTheDocument();

    await user.click(screen.getByText('HANA'));
    await user.click(screen.getByText('Apply'));

    expect(mockOnRequest).toBeCalledWith('HANA');
  });

  it('should render Application solutions', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <SaptuneSolutionApplyModal
          isOpen
          isAppRunning
          onCancel={noop}
          onRequest={noop}
        />
      );
    });

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByText('Select a saptune solution'));

    expect(screen.getByText('NETWEAVER')).toBeInTheDocument();
    expect(screen.getByText('S4HANA-APPSERVER')).toBeInTheDocument();
  });

  it('should render HANA and Application solutions', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <SaptuneSolutionApplyModal
          isOpen
          isHanaRunning
          isAppRunning
          onCancel={noop}
          onRequest={noop}
        />
      );
    });

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByText('Select a saptune solution'));

    expect(screen.getByText('S4HANA-APP+DB')).toBeInTheDocument();
    expect(screen.getByText('NETWEAVER+HANA')).toBeInTheDocument();
  });
});
