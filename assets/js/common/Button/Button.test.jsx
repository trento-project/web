import React from 'react';
import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Button from '.';

const types = [
  'primary-white',
  'transparent',
  'secondary',
  'default-fit',
  'danger',
  'danger-bold',
  'link',
  'primary-white-fit',
];

const sizes = ['small', 'fit'];

describe('Button', () => {
  it('should display a default button with its text', () => {
    const content = faker.vehicle.vehicle();
    render(<Button>{content}</Button>);
    expect(screen.getByRole('button')).toHaveTextContent(content);
  });

  it('should display a default disabled button with its text', () => {
    const content = faker.vehicle.vehicle();
    render(<Button disabled>{content}</Button>);
    expect(screen.getByRole('button')).toHaveTextContent(content);
  });

  it.each(types)(
    'should display a button with type %s with its text',
    (buttonType) => {
      const content = faker.vehicle.vehicle();
      render(<Button type={buttonType}>{content}</Button>);
      expect(screen.getByRole('button')).toHaveTextContent(content);
    }
  );

  it.each(types)(
    'should display a disabled button with type %s with its text',
    (buttonType) => {
      const content = faker.vehicle.vehicle();
      render(
        <Button type={buttonType} disabled>
          {content}
        </Button>
      );
      expect(screen.getByRole('button')).toHaveTextContent(content);
    }
  );

  it.each(sizes)(
    'should display a button with size %s with its text',
    (buttonSize) => {
      const content = faker.vehicle.vehicle();
      render(
        <Button size={buttonSize} disabled>
          {content}
        </Button>
      );
      expect(screen.getByRole('button')).toHaveTextContent(content);
    }
  );
});
