import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import AdvisoryIcon from '.';

describe('AdvisoryIcon', () => {
  it('renders the correct SVG for an advisory type', () => {
    const expectedComponents = new Map([
      ['security_advisory', 'EOS_SHIELD_OUTLINED'],
      ['bugfix', 'EOS_CRITICAL_BUG_OUTLINED'],
      ['enhancement', 'EOS_ADD_BOX_OUTLINED'],
    ]);

    expectedComponents.forEach((componentName, type) => {
      const { container } = render(<AdvisoryIcon type={type} />);

      const iconEl = container.querySelector('svg');

      const fiberKey = Object.keys(iconEl).filter((key) =>
        key.startsWith('__reactFiber$')
      )[0];
      expect(fiberKey).toBeDefined();

      const svgRCInstance = iconEl[fiberKey].return;

      const svgRCName = svgRCInstance.elementType.name;
      expect(svgRCName).toBe(componentName);
    });
  });

  it('renders a fallback for an unknown advisory type', () => {
    const componentName = 'EOS_QUESTION_MARK_FILLED';

    const { container } = render(<AdvisoryIcon type={undefined} />);

    const iconEl = container.querySelector('svg');

    const fiberKey = Object.keys(iconEl).filter((key) =>
      key.startsWith('__reactFiber$')
    )[0];
    expect(fiberKey).toBeDefined();

    const svgRCInstance = iconEl[fiberKey].return;

    const svgRCName = svgRCInstance.elementType.name;
    expect(svgRCName).toBe(componentName);
  });
});
