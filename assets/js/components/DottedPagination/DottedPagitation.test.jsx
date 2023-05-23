import React from 'react';

import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import DottedPagination from '.';

describe('DottedPagination component', () => {
  it('shows the correct number of pages', () => {
    const pages = Array(3);

    render(
      <DottedPagination
        pages={pages}
        initialSelectedIndex={0}
        onChange={() => {}}
      />
    );

    const icons = screen.getAllByTestId('eos-svg-component');
    expect(icons.length).toBe(5);
    expect(icons[1].classList.toString()).toContain('fill-jungle-green-500');
    expect(icons[2].classList.toString()).toContain('fill-gray-300');
    expect(icons[3].classList.toString()).toContain('fill-gray-300');
  });

  it('paginates correctly', () => {
    const user = userEvent.setup();
    const pages = ['page1', 'page2', 'page3'];
    const onChange = jest.fn();

    render(
      <DottedPagination
        pages={pages}
        initialSelectedIndex={0}
        onChange={onChange}
      />
    );
    [
      [0, 1, 'page1'],
      [4, 2, 'page2'],
      [4, 3, 'page3'],
      [4, 3, 'page3'],
      [0, 2, 'page2'],
    ].forEach(async (direction, iconNumber, page) => {
      await user.click(screen.getAllByTestId('eos-svg-component')[direction]);
      expect(
        screen
          .getAllByTestId('eos-svg-component')
          [iconNumber].classList.toString()
      ).toContain('fill-jungle-green-500');
      expect(onChange).toHaveBeenCalledWith(page);
    });
  });

  it('updates the page in case of pages overflow', () => {
    const pages = ['page1', 'page2'];
    const onChange = jest.fn();

    render(
      <DottedPagination
        pages={pages}
        initialSelectedIndex={2} // overflowed index
        onChange={onChange}
      />
    );

    const icons = screen.getAllByTestId('eos-svg-component');
    expect(icons.length).toBe(4);
    expect(icons[1].classList.toString()).toContain('fill-gray-300');
    expect(icons[2].classList.toString()).toContain('fill-jungle-green-500');
    expect(onChange).toHaveBeenCalledWith('page2');
  });
});
