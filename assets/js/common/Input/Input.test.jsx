import React, { useState } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Input from './Input';

describe('Input Component', () => {
  it.each([
    {
      props: {
        initialValue: 'Initial Value',
      },
      expectedDisplayValue: 'Initial Value',
    },
    {
      props: {
        value: 'Preset Value',
      },
      expectedDisplayValue: 'Preset Value',
    },
  ])('renders with correct value', ({ props, expectedDisplayValue }) => {
    render(<Input {...props} />);
    expect(screen.getByDisplayValue(expectedDisplayValue)).toBeInTheDocument();
  });

  it.each([
    {
      props: {
        prefix: 'a prefix',
      },
      expectedAdditionContent: 'a prefix',
    },
    {
      props: {
        suffix: 'a suffix',
      },
      expectedAdditionContent: 'a suffix',
    },
  ])('supports prefix and suffix', ({ props, expectedAdditionContent }) => {
    render(<Input {...props} />);
    expect(screen.getByText(expectedAdditionContent)).toBeVisible();
  });

  it('supports disabled inputs', () => {
    render(<Input value="some value" disabled />);
    expect(screen.getByDisplayValue('some value')).toBeDisabled();
  });

  it('should trigger onChange when an initial value is provided', () => {
    const onChange = jest.fn();

    const { container } = render(
      <Input initialValue="Initial Value" onChange={onChange} />
    );

    const inputElement = container.querySelector('input');
    expect(inputElement.value).toBe('Initial Value');

    fireEvent.change(inputElement, { target: { value: 'new value' } });
    expect(onChange).toHaveBeenCalled();
    expect(inputElement.value).toBe('new value');
  });

  it('should support controlled value', () => {
    function ControlledComponent() {
      const [value, setValue] = useState('Value');
      return <Input value={value} onChange={(e) => setValue(e.target.value)} />;
    }

    const { container } = render(<ControlledComponent />);

    const inputElement = container.querySelector('input');
    expect(inputElement.value).toBe('Value');

    fireEvent.change(inputElement, { target: { value: 'new value' } });
    expect(inputElement.value).toBe('new value');
  });
});
