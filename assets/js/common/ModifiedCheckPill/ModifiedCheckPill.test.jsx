import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ModifiedCheckPill from './ModifiedCheckPill';

describe('ModifiedCheckPill component', () => {
  it('should not render modified pill for a non customized check', () => {
    render(<ModifiedCheckPill customized={false} />);

    expect(screen.queryByText('MODIFIED')).toBeNull();
  });

  it('should render modified pill for a customized check', () => {
    render(<ModifiedCheckPill customized />);

    expect(screen.getByText('MODIFIED')).toBeVisible();
  });

  it('should render modified pill with custom content for a customized check', () => {
    render(<ModifiedCheckPill content="changed" customized />);

    expect(screen.getByText('changed')).toBeVisible();
  });
});
