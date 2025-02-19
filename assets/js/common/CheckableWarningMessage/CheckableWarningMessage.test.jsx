import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CheckableWarningMessage from './CheckableWarningMessage';

const warningMessage = 'A default warning test';

describe('CheckableWarningMessage', () => {
  it('should render a clickable checkbox, svg warning icon, warning text.', async () => {
    const user = userEvent.setup();
    const mockSetChecked = jest.fn();

    render(
      <CheckableWarningMessage
        warningText={warningMessage}
        checked={false}
        onChecked={mockSetChecked}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(screen.getByText(warningMessage)).toBeInTheDocument();

    const icon = screen.getByTestId('eos-svg-component');
    expect(icon).toBeInTheDocument();

    await user.click(checkbox);
    expect(mockSetChecked).toHaveBeenCalled();
  });

  it('should not render checkbox if hideCheckbox is true', () => {
    render(
      <CheckableWarningMessage
        hideCheckbox
        warningText={warningMessage}
        checked={false}
      />
    );

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
