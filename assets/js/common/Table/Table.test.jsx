import React from 'react';

import { noop } from 'lodash';
import {
  screen,
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react';
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

  const tableDataFactory = Factory.define(({ sequence }) => ({
    column1: `${faker.person.firstName()}${sequence}`,
    column2: [`${faker.location.city()}${sequence}`],
    column3: `${faker.animal.dog()}${sequence}`,
  }));

  it('should allow custom classes for table rows', () => {
    const data = tableDataFactory.buildList(10);
    const customRowClassName = 'custom-row-classname';

    render(
      <Table
        config={{ rowClassName: customRowClassName, ...tableConfig }}
        data={data}
        setSearchParams={() => {}}
      />
    );

    screen
      .getByRole('table')
      .querySelectorAll('tbody > tr')
      .forEach((tableRow) => expect(tableRow).toHaveClass(customRowClassName));
  });

  it('should display the header', () => {
    const data = tableDataFactory.buildList(10);
    const headerText = faker.person.firstName();

    render(
      <Table
        config={tableConfig}
        data={data}
        setSearchParams={() => {}}
        header={<p>{headerText}</p>}
      />
    );

    expect(screen.queryByText(headerText)).toBeInTheDocument();
  });

  it('should fire the onPageChange callback', () => {
    const data = tableDataFactory.buildList(20);
    const onPageChange = jest.fn();

    const expectedPayload = data.slice(0, 10);

    render(
      <Table
        config={{ ...tableConfig, onPageChange }}
        data={data}
        setSearchParams={() => {}}
      />
    );

    expect(onPageChange).toHaveBeenCalledWith(expectedPayload);
  });

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

      render(
        <Table config={tableConfig} data={data} setSearchParams={() => {}} />
      );

      const pages = screen.getByTestId('pagination');
      const page2Button = within(pages).getByText('2');
      fireEvent.click(page2Button);

      filterTable('Column3', 'value3');

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table.querySelectorAll('tbody > tr')).toHaveLength(1);
      });
    });

    it('should display the correct items per page', () => {
      const data = tableDataFactory.buildList(11);

      render(
        <Table config={tableConfig} data={data} setSearchParams={() => {}} />
      );

      const page1 = screen.getByRole('table');
      expect(page1.querySelectorAll('tbody > tr')).toHaveLength(10);

      const pages = screen.getByTestId('pagination');
      const page2Button = within(pages).getByText('2');
      fireEvent.click(page2Button);

      const page2 = screen.getByRole('table');
      expect(page2.querySelectorAll('tbody > tr')).toHaveLength(1);
    });

    it('should be able to change the items per page', () => {
      const data = tableDataFactory.buildList(11);

      render(
        <Table config={tableConfig} data={data} setSearchParams={() => {}} />
      );

      const pageOriginal = screen.getByRole('table');
      expect(pageOriginal.querySelectorAll('tbody > tr')).toHaveLength(10);

      fireEvent.click(screen.getByRole('button', { name: '10' }));
      fireEvent.click(screen.getByRole('option', { name: '20' }));

      const pageMoreItems = screen.getByRole('table');
      expect(pageMoreItems.querySelectorAll('tbody > tr')).toHaveLength(11);

      const pages = screen.getByTestId('pagination');
      expect(within(pages).queryByText('2')).toBeNull();
    });

    it('should return empty state message when data is empty', () => {
      const data = [];
      const emptyStateText = faker.lorem.words(5);
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

  describe('rowKey function', () => {
    it('is used to determine keys for rows', async () => {
      const rowKey = jest.fn((_item, index) => index);
      const data = tableDataFactory.buildList(5);

      render(
        <Table
          config={tableConfig}
          data={data}
          setSearchParams={() => {}}
          rowKey={rowKey}
        />
      );

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table.querySelectorAll('tbody > tr')).toHaveLength(5);
      });

      expect(rowKey).toHaveBeenCalledTimes(5);
      expect(rowKey).toHaveBeenCalledWith(data[0], 0);
      expect(rowKey).toHaveBeenCalledWith(data[1], 1);
      expect(rowKey).toHaveBeenCalledWith(data[2], 2);
    });
  });

  describe('sorting', () => {
    it('should sort by the chosen column', async () => {
      const data = tableDataFactory.buildList(10);

      const columnsConfigForSorted = tableConfig.columns.map((c) => {
        if (c.key === 'column1') {
          return {
            ...c,
            sortable: true,
            sortDirection: 'asc',
            handleClick: noop,
          };
        }

        return c;
      });

      const orderByColumn1 = (a, b) => {
        const column1A = a.column1.toUpperCase();
        const column1B = b.column1.toUpperCase();

        if (column1A < column1B) {
          return -1;
        }

        if (column1A > column1B) {
          return 1;
        }

        return 0;
      };

      const { container } = render(
        <Table
          config={{ ...tableConfig, columns: columnsConfigForSorted }}
          sortBy={orderByColumn1}
          data={data}
        />
      );

      const tableRows = container.querySelectorAll('tbody > tr');

      expect(tableRows.length).toBe(10);

      const sortedData = [...data].sort(orderByColumn1);

      sortedData.forEach((expectedText, i) => {
        expect(tableRows[i]).toHaveTextContent(expectedText.column1);
      });
    });
  });
});
