import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckableWarningMessage from './CheckableWarningMessage';

const warningMessage = 'A default warning test';
describe('CheckableWarningMessage', () => {
  it('should render a clickable checkbox, svg warning icon, warning text.', () => {
    const mockSetChecked = jest.fn();
    render(
      <CheckableWarningMessage
        warningText={warningMessage}
        checked={false}
        setChecked={mockSetChecked}
      />
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(screen.getByText(warningMessage)).toBeInTheDocument();
    const icon = screen.getByTestId('eos-svg-component');
    expect(icon).toBeInTheDocument();
    fireEvent.click(checkbox);
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
