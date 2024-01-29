import React, { useState } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Textarea from './Textarea';

describe('Textarea Component', () => {
  it('supports disabled textarea', () => {
    render(<Textarea value="some value" disabled />);
    expect(screen.getByDisplayValue('some value')).toBeDisabled();
  });

  it('supports default value', () => {
    render(<Textarea initialValue="some value" />);
    expect(screen.getByDisplayValue('some value')).toBeInTheDocument();
  });

  it('supports controlled value', () => {
    function ControlledComponent() {
      const [value, setValue] = useState('Value');
      return (
        <Textarea value={value} onChange={(e) => setValue(e.target.value)} />
      );
    }

    const { container } = render(<ControlledComponent />);

    const textArea = container.querySelector('textarea');
    expect(textArea.value).toBe('Value');

    fireEvent.change(textArea, { target: { value: 'new value' } });
    expect(textArea.value).toBe('new value');
  });

  it('should change value', () => {
    const { container } = render(<Textarea initialValue="Initial Value" />);

    const textArea = container.querySelector('textarea');
    expect(textArea.value).toBe('Initial Value');

    fireEvent.change(textArea, { target: { value: 'new value' } });
    expect(textArea.value).toBe('new value');
  });
});
