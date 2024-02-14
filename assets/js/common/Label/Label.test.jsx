import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';

import Label from '.';

describe('Label Component', () => {
  it('should render correctly', () => {
    const labelContent = faker.word.noun();
    render(<Label>{labelContent}</Label>);

    expect(screen.getByText(labelContent)).toBeInTheDocument();
  });

  it('should display an info tooltip if specified', async () => {
    const user = userEvent.setup();
    const labelContent = faker.word.noun();
    const labelInfoContent = faker.word.noun();

    render(<Label info={labelInfoContent}>{labelContent}</Label>);

    const icon = screen.getByTestId('eos-svg-component');
    await act(async () => user.hover(icon));

    expect(screen.getByText(labelInfoContent)).toBeVisible();
  });

  it('should display an asterisk for required fields', () => {
    const labelContent = faker.word.noun();

    render(<Label required>{labelContent}</Label>);

    expect(screen.getByText('*')).toBeVisible();
  });
});
