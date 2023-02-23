/* eslint-disable import/no-extraneous-dependencies */

import { screen, fireEvent, act } from '@testing-library/react';

export const filterTable = (name, option) => {
  const filterContainer = screen.getByTestId(`filter-${name}`);

  act(() => {
    fireEvent.click(filterContainer);
  });

  const optionContainer = Array.from(
    screen
      .getByTestId(`filter-${name}-options`)
      .querySelectorAll('li > div > span')
  ).find((f) => f.textContent === option);

  act(() => {
    fireEvent.click(optionContainer);
    fireEvent.click(screen.getByTestId(`filter-${name}`));
  });
};

export const clearFilter = (name) => {
  const filterContainer = screen.getByTestId(`filter-${name}-clear`);

  act(() => {
    fireEvent.click(filterContainer);
  });
};
