import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import HealthIcon from './';

describe('HealthIcon', () => {
  it('should display a green svg when the health is passing', () => {
    const { container } = render(<HealthIcon health={'passing'} />);
    const svgEl = container.querySelector("[data-testid='eos-svg-component']");
    expect(svgEl.classList.toString()).toContain('fill-jungle-green-500');
  });
  it('should display a yellow svg when the health is warning', () => {
    const { container } = render(<HealthIcon health={'warning'} />);
    const svgEl = container.querySelector("[data-testid='eos-svg-component']");
    expect(svgEl.classList.toString()).toContain('fill-yellow-500');
  });
  it('should display a red svg when the health is critical', () => {
    const { container } = render(<HealthIcon health={'critical'} />);
    const svgEl = container.querySelector("[data-testid='eos-svg-component']");
    expect(svgEl.classList.toString()).toContain('fill-red-500');
  });
  it('should display a grey circle when the health is unknown', () => {
    const { container } = render(<HealthIcon health={''} />);
    const svgEl = container.querySelector("[data-testid='eos-svg-component']");
    expect(svgEl.classList.toString()).toContain('fill-gray-500');
  });
});
