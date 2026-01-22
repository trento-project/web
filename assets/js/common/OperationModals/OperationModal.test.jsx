import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { faker } from '@faker-js/faker';
import { resetOperationDisclaimer } from '@lib/operations';
import OperationModal from './OperationModal';

describe('OperationModal', () => {
  beforeEach(() => resetOperationDisclaimer());

  it('should show disclaimer', async () => {
    const operationTitle = faker.lorem.sentence();
    const operationDescription = faker.lorem.paragraph();
    const operationText = faker.lorem.word();
    render(
      <OperationModal
        title={operationTitle}
        description={operationDescription}
        operationText={operationText}
        isOpen
      />
    );

    const pattern = `By proceeding I confirm to be aware of the impact that executing operation "${operationText}" will have in my environment`;

    expect(screen.getByText('Disclaimer')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(pattern))).toBeInTheDocument();
    expect(screen.getByText("Don't show this again")).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.getByText('Proceed')).toBeEnabled();
    expect(screen.getByText('Cancel')).toBeEnabled();

    expect(screen.queryByText(operationTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(operationDescription)).not.toBeInTheDocument();
  });

  it('should allow requesting operation after disclaimer step', async () => {
    const user = userEvent.setup();

    const operationTitle = faker.lorem.sentence();
    const operationDescription = faker.lorem.paragraph();
    const operationText = faker.lorem.word();
    const specificOperationModalContent = faker.person.fullName();
    const mockOnRequest = jest.fn();

    render(
      <OperationModal
        title={operationTitle}
        description={operationDescription}
        operationText={operationText}
        isOpen
        onRequest={mockOnRequest}
      >
        {specificOperationModalContent}
      </OperationModal>
    );

    await user.click(screen.getByText('Proceed'));
    expect(mockOnRequest).not.toHaveBeenCalled();

    const pattern = `By proceeding I confirm to be aware of the impact that executing operation "${operationText}" will have in my environment`;

    expect(screen.queryByText('Disclaimer')).not.toBeInTheDocument();
    expect(screen.queryByText(new RegExp(pattern))).not.toBeInTheDocument();
    expect(screen.queryByText("Don't show this again")).not.toBeInTheDocument();
    expect(screen.queryByText('Proceed')).not.toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeEnabled();

    expect(screen.getByText(operationTitle)).toBeInTheDocument();
    expect(screen.getByText(operationDescription)).toBeInTheDocument();
    expect(screen.getByText(specificOperationModalContent)).toBeInTheDocument();

    expect(screen.getByText('Request')).toBeEnabled();
    await user.click(screen.getByText('Request'));

    expect(mockOnRequest).toHaveBeenCalled();
  });

  it(`should not waive disclaimer by just clicking the "Don't show this again" checkbox`, async () => {
    const user = userEvent.setup();

    const { rerender } = render(<OperationModal isOpen />);

    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).toBeChecked();

    rerender(<OperationModal isOpen />);

    expect(screen.getByText('Disclaimer')).toBeInTheDocument();
  });

  it(`should waive disclaimer by clicking the "Don't show this again" checkbox and proceeding to operation`, async () => {
    const user = userEvent.setup();

    const operationTitle = faker.lorem.sentence();
    const operationDescription = faker.lorem.paragraph();
    const operationText = faker.lorem.word();
    const specificOperationModalContent = faker.person.fullName();

    const { rerender } = render(
      <OperationModal
        title={operationTitle}
        description={operationDescription}
        operationText={operationText}
        isOpen
      >
        {specificOperationModalContent}
      </OperationModal>
    );

    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).toBeChecked();
    await user.click(screen.getByText('Proceed'));

    rerender(
      <OperationModal
        title={operationTitle}
        description={operationDescription}
        operationText={operationText}
        isOpen
      >
        {specificOperationModalContent}
      </OperationModal>
    );

    expect(screen.queryByText('Disclaimer')).not.toBeInTheDocument();
    expect(screen.getByText(operationTitle)).toBeInTheDocument();
    expect(screen.getByText(operationDescription)).toBeInTheDocument();
    expect(screen.getByText(specificOperationModalContent)).toBeInTheDocument();
  });

  it('should be possible to disable requesting operation after disclaimer step', async () => {
    const user = userEvent.setup();

    render(<OperationModal isOpen requestDisabled />);

    await user.click(screen.getByText('Proceed'));

    expect(screen.getByText('Request')).toBeDisabled();
  });
});
