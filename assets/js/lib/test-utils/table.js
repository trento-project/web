import { screen } from '@testing-library/react';

export const filterTable = async (user, name, option) => {
  const filterContainer = screen.getByTestId(`filter-${name}`);

  await user.click(filterContainer);

  const optionContainer = Array.from(
    screen
      .getByTestId(`filter-${name}-options`)
      .querySelectorAll('li > div > span')
  ).find((f) => f.textContent === option);

  await user.click(optionContainer);
  await user.click(screen.getByTestId(`filter-${name}`));
};

export const clearFilter = async (user, name) => {
  const filterContainer = screen.getByTestId(`filter-${name}-clear`);

  await user.click(filterContainer);
};
