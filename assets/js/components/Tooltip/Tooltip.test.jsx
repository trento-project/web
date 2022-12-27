import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import Tooltip from '.';

describe('Tooltip', () => {
  it('should show a text when mouse is hovering', async () => {
    render(
      <div>
        <Tooltip tooltipText="This is my tooltip text">This is my text</Tooltip>
        <p>This is another paragraph</p>
      </div>
    );

    expect(screen.getByText('This is my tooltip text')).not.toBeVisible();

    fireEvent.mouseOver(screen.getByText('This is my text'));

    expect(screen.getByText('This is my tooltip text')).toBeVisible();

    fireEvent.mouseOut(screen.getByText('This is my text'));
    expect(screen.getByText('This is my tooltip text')).not.toBeVisible();
  });
});
