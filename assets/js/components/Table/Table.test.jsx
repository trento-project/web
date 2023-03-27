import React from 'react';

import { screen, fireEvent, render, waitFor } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import Table from './Table';

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

describe('Table component', () => {
  const tableConfig = {
    pagination: true,
    columns: [
      {
        title: 'Column1',
        key: 'column1',
        filter: true,
        filterFromParams: true,
      },
      {
        title: 'Column2',
        key: 'column2',
        filter: (filter, key) => (element) =>
          element[key].some((item) => filter.includes(item)),
        filterFromParams: true,
      },
      {
        title: 'Column3',
        key: 'column3',
        filter: true,
        filterFromParams: true,
      },
    ],
  };

  const tableDataFactory = Factory.define(() => ({
    column1: faker.name.firstName(),
    column2: [faker.address.city()],
    column3: faker.animal.dog(),
  }));

  describe('filtering', () => {
    it('should filter by the chosen filter option with default filter', async () => {
      const data = tableDataFactory.buildList(10);
      const { column1: value1 } = data[0];

      render(
        <Table config={tableConfig} data={data} setSearchParams={() => {}} />
      );

      filterTable('Column1', value1);

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table.querySelectorAll('tbody > tr')).toHaveLength(1);
      });
    });

    it('should filter by the chosen filter option with custom filter', async () => {
      const data = [].concat(
        tableDataFactory.buildList(5),
        tableDataFactory.buildList(1, { column2: ['value1'] }),
        tableDataFactory.buildList(1, { column2: ['value2'] }),
        tableDataFactory.buildList(1, { column2: ['value1', 'value2'] })
      );

      render(
        <Table config={tableConfig} data={data} setSearchParams={() => {}} />
      );

      filterTable('Column2', 'value1');
      filterTable('Column2', 'value2');

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table.querySelectorAll('tbody > tr')).toHaveLength(3);
      });
    });

    it('should reset the pagination and go the 1st page when a filter is selected', async () => {
      const data = [].concat(
        tableDataFactory.buildList(15),
        tableDataFactory.buildList(1, { column3: 'value3' })
      );

      const { container } = render(
        <Table config={tableConfig} data={data} setSearchParams={() => {}} />
      );

      fireEvent.click(container.querySelector('.tn-page-item:nth-child(2)'));

      filterTable('Column3', 'value3');

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table.querySelectorAll('tbody > tr')).toHaveLength(1);
      });
    });

    it('should return empty state message when data is empty', async () => {
      const data = [];
      const emptyStateText = faker.random.words(5);
      render(
        <Table
          config={tableConfig}
          data={data}
          setSearchParams={() => {}}
          emptyStateText={emptyStateText}
        />
      );
      const emptyStateElement = screen.getByText(emptyStateText);
      expect(emptyStateElement).toBeInTheDocument();
      const tableRows = screen.getAllByRole('row');
      expect(tableRows.length).toBe(2);
      const tableCell = screen.getByRole('cell');
      expect(tableCell).toHaveTextContent(emptyStateText);
    });
  });
});
