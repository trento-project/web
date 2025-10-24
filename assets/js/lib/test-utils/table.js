import { screen, fireEvent } from '@testing-library/react';

export const filterTable = (name, option) => {
  const filterContainer = screen.getByTestId(`filter-${name}`);

  fireEvent.click(filterContainer);

  const optionContainer = Array.from(
    screen
      .getByTestId(`filter-${name}-options`)
      .querySelectorAll('li > div > span')
  ).find((f) => f.textContent === option);

  fireEvent.click(optionContainer);
  fireEvent.click(screen.getByTestId(`filter-${name}`));
};

export const clearFilter = (name) => {
  const filterContainer = screen.getByTestId(`filter-${name}-clear`);

  fireEvent.click(filterContainer);
};
