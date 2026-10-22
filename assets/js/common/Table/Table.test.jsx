// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';

import { noop } from 'lodash';
import { screen, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { filterTable, clearFilter } from '@lib/test-utils/table';

import Table from './Table';

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

  it('should allow dynamic row classes based on row content', () => {
    const activeClass = 'bg-green-50';
    const inactiveClass = 'bg-gray-50';
    const data = tableDataFactory.buildList(10).map((item, index) => ({
      ...item,
      isActive: index % 2 === 0,
    }));

    render(
      <Table
        config={{
          rowClassName: (item) => (item.isActive ? activeClass : inactiveClass),
          ...tableConfig,
        }}
        data={data}
        setSearchParams={() => {}}
      />
    );

    const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
    tableRows.forEach((tableRow, index) => {
      if (data[index].isActive) {
        expect(tableRow).toHaveClass(activeClass);
      } else {
        expect(tableRow).toHaveClass(inactiveClass);
      }
    });
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

  it('should have the same horizontal padding for table header and rows', () => {
    const data = tableDataFactory.buildList(10);

    render(<Table config={tableConfig} data={data} />);

    let pxClass;
    screen
      .getByRole('table')
      .querySelector('th')
      .classList.forEach((className) => {
        className.match('px-') && (pxClass = className);
      });

    screen
      .getByRole('table')
      .querySelectorAll('tbody > tr > td')
      .forEach((tableRow) => expect(tableRow).toHaveClass(pxClass));
  });

  it('should have wrapper div classes with rounded and overflow hidden', () => {
    const data = tableDataFactory.buildList(10);

    render(<Table config={tableConfig} data={data} />);

    const wrapperDiv = screen.getByRole('table').closest('div');

    expect(wrapperDiv).toHaveClass(/rounded/, 'overflow-hidden');
  });

  describe('filtering', () => {
    it('should filter by the chosen filter option with default filter', async () => {
      const user = userEvent.setup();

      const data = tableDataFactory.buildList(10);
      const { column1: value1 } = data[0];

      render(
        <Table config={tableConfig} data={data} setSearchParams={() => {}} />
      );

      await filterTable(user, 'Column1', value1);

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table.querySelectorAll('tbody > tr')).toHaveLength(1);
      });
    });

    it('should filter by the chosen filter option with custom filter', async () => {
      const user = userEvent.setup();

      const data = [].concat(
        tableDataFactory.buildList(5),
        tableDataFactory.buildList(1, { column2: ['value1'] }),
        tableDataFactory.buildList(1, { column2: ['value2'] }),
        tableDataFactory.buildList(1, { column2: ['value1', 'value2'] })
      );

      render(
        <Table config={tableConfig} data={data} setSearchParams={() => {}} />
      );

      await filterTable(user, 'Column2', 'value1');
      await filterTable(user, 'Column2', 'value2');

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table.querySelectorAll('tbody > tr')).toHaveLength(3);
      });
    });

    it('should reset the pagination and go the 1st page when a filter is selected', async () => {
      const user = userEvent.setup();
      const data = [].concat(
        tableDataFactory.buildList(15),
        tableDataFactory.buildList(1, { column3: 'value3' })
      );

      render(
        <Table config={tableConfig} data={data} setSearchParams={() => {}} />
      );

      const pages = screen.getByTestId('pagination');
      const page2Button = within(pages).getByLabelText('next-page');
      await user.click(page2Button);

      await filterTable(user, 'Column3', 'value3');

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table.querySelectorAll('tbody > tr')).toHaveLength(1);
      });
    });

    it('should display the correct items per page', async () => {
      const user = userEvent.setup();
      const data = tableDataFactory.buildList(11);

      render(
        <Table config={tableConfig} data={data} setSearchParams={() => {}} />
      );

      const page1 = screen.getByRole('table');
      expect(page1.querySelectorAll('tbody > tr')).toHaveLength(10);

      const pages = screen.getByTestId('pagination');
      const page2Button = within(pages).getByLabelText('next-page');
      await user.click(page2Button);

      const page2 = screen.getByRole('table');
      expect(page2.querySelectorAll('tbody > tr')).toHaveLength(1);
    });

    it('should be able to change the items per page', async () => {
      const user = userEvent.setup();
      const data = tableDataFactory.buildList(11);

      render(
        <Table config={tableConfig} data={data} setSearchParams={() => {}} />
      );

      const pageOriginal = screen.getByRole('table');
      expect(pageOriginal.querySelectorAll('tbody > tr')).toHaveLength(10);

      await user.click(screen.getByRole('combobox', { name: 'per-page' }));
      await user.click(screen.getByRole('option', { name: '20' }));

      const pageMoreItems = screen.getByRole('table');
      expect(pageMoreItems.querySelectorAll('tbody > tr')).toHaveLength(11);

      const pages = screen.getByTestId('pagination');
      expect(within(pages).queryByText('2')).toBeNull();
    });

    describe('filters bound to the search params', () => {
      it('should take the filters from the search params', () => {
        const data = [].concat(
          tableDataFactory.buildList(5),
          tableDataFactory.buildList(1, { column3: 'value3' })
        );

        render(
          <Table
            config={tableConfig}
            data={data}
            searchParams={new URLSearchParams('column3=value3')}
            setSearchParams={noop}
          />
        );

        expect(
          screen.getByRole('table').querySelectorAll('tbody > tr')
        ).toHaveLength(1);
      });

      it('should apply the filters of a search params change made elsewhere', () => {
        const data = [].concat(
          tableDataFactory.buildList(5),
          tableDataFactory.buildList(1, { column3: 'fromTheUrl' })
        );

        const { rerender } = render(
          <Table
            config={tableConfig}
            data={data}
            searchParams={new URLSearchParams()}
            setSearchParams={noop}
          />
        );

        expect(
          screen.getByRole('table').querySelectorAll('tbody > tr')
        ).toHaveLength(6);

        // the view is handed the params of a navigation it did not trigger
        rerender(
          <Table
            config={tableConfig}
            data={data}
            searchParams={new URLSearchParams('column3=fromTheUrl')}
            setSearchParams={noop}
          />
        );

        expect(
          screen.getByRole('table').querySelectorAll('tbody > tr')
        ).toHaveLength(1);
      });

      it('should drop a cleared filter from the search params', async () => {
        const user = userEvent.setup();
        const setSearchParams = jest.fn();
        const data = [].concat(
          tableDataFactory.buildList(5),
          tableDataFactory.buildList(1, { column3: 'value3' })
        );

        render(
          <Table
            config={tableConfig}
            data={data}
            searchParams={new URLSearchParams('column3=value3')}
            setSearchParams={setSearchParams}
          />
        );

        await clearFilter(user, 'Column3');

        const [updateParams] = setSearchParams.mock.lastCall;
        expect(
          updateParams(new URLSearchParams('column3=value3')).toString()
        ).toBe('');
      });

      it('should not write the search params before a filter is used', () => {
        const setSearchParams = jest.fn();
        const data = tableDataFactory.buildList(5);

        render(
          <Table
            config={tableConfig}
            data={data}
            searchParams={new URLSearchParams()}
            setSearchParams={setSearchParams}
          />
        );

        expect(setSearchParams).not.toHaveBeenCalled();
      });
    });

    describe('items per page bound to the search params', () => {
      it('should take the items per page from the search params', () => {
        const data = tableDataFactory.buildList(11);

        render(
          <Table
            config={tableConfig}
            data={data}
            searchParams={new URLSearchParams('itemsPerPage=20')}
            setSearchParams={noop}
          />
        );

        expect(
          screen.getByRole('table').querySelectorAll('tbody > tr')
        ).toHaveLength(11);
      });

      it('should fall back to the default items per page on an unknown value', () => {
        const data = tableDataFactory.buildList(11);

        render(
          <Table
            config={tableConfig}
            data={data}
            searchParams={new URLSearchParams('itemsPerPage=13')}
            setSearchParams={noop}
          />
        );

        expect(
          screen.getByRole('table').querySelectorAll('tbody > tr')
        ).toHaveLength(10);
      });

      it('should write the items per page selection to the search params', async () => {
        const user = userEvent.setup();
        const setSearchParams = jest.fn();
        const data = tableDataFactory.buildList(11);

        render(
          <Table
            config={tableConfig}
            data={data}
            searchParams={new URLSearchParams()}
            setSearchParams={setSearchParams}
          />
        );

        await user.click(screen.getByRole('combobox', { name: 'per-page' }));
        await user.click(screen.getByRole('option', { name: '20' }));

        const [updateParams] = setSearchParams.mock.lastCall;
        expect(updateParams(new URLSearchParams()).toString()).toBe(
          'itemsPerPage=20'
        );
      });

      it('should keep the filters in the search params when the items per page changes', async () => {
        const user = userEvent.setup();
        const setSearchParams = jest.fn();
        const data = [].concat(
          tableDataFactory.buildList(15),
          tableDataFactory.buildList(1, { column3: 'value3' })
        );

        render(
          <Table
            config={tableConfig}
            data={data}
            searchParams={new URLSearchParams('column3=value3')}
            setSearchParams={setSearchParams}
          />
        );

        await user.click(screen.getByRole('combobox', { name: 'per-page' }));
        await user.click(screen.getByRole('option', { name: '20' }));

        const [updateParams] = setSearchParams.mock.lastCall;
        const params = updateParams(new URLSearchParams('column3=value3'));

        expect(params.get('itemsPerPage')).toBe('20');
        expect(params.get('column3')).toBe('value3');
      });
    });

    it('should sort filter options with filterOptionsSorter when provided', async () => {
      const user = userEvent.setup();
      const data = [
        { column1: 'zeta', column2: [], column3: 'c' },
        { column1: 'alpha', column2: [], column3: 'c' },
        { column1: 'mike', column2: [], column3: 'c' },
      ];

      const sortedConfig = {
        ...tableConfig,
        columns: tableConfig.columns.map((c) =>
          c.key === 'column1'
            ? { ...c, filterOptionsSorter: (a, b) => a.localeCompare(b) }
            : c
        ),
      };

      render(
        <Table config={sortedConfig} data={data} setSearchParams={() => {}} />
      );

      await user.click(screen.getByTestId('filter-Column1'));

      const labels = Array.from(
        screen
          .getByTestId('filter-Column1-options')
          .querySelectorAll('li > div > span')
      ).map((span) => span.textContent);

      expect(labels).toEqual(['alpha', 'mike', 'zeta']);
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

  describe('collapsible row', () => {
    it('should display the collapsed row when chevron is clicked', async () => {
      const user = userEvent.setup();
      const data = tableDataFactory.buildList(1);
      const content = 'This is a collapsible row data';

      render(
        <Table
          config={{
            ...tableConfig,
            collapsibleDetailRenderer: () => <p>{content}</p>,
          }}
          data={data}
        />
      );

      const table = screen.getByRole('table');
      const collapsibleCell = table.querySelector(
        'tbody > tr:nth-child(1) > td:nth-child(1)'
      );
      expect(screen.queryByText(content)).not.toBeVisible();

      await user.click(collapsibleCell);
      expect(screen.queryByText(content)).toBeVisible();
    });

    it('should wrap the collapsed row in cell', () => {
      const data = tableDataFactory.buildList(1);
      const content = 'This is a collapsible row data';

      render(
        <Table
          config={{
            ...tableConfig,
            wrapCollapsedRowInCell: true,
            collapsibleDetailRenderer: () => <p>{content}</p>,
          }}
          data={data}
        />
      );

      const table = screen.getByRole('table');
      const collapsedCell = table.querySelector(
        'tbody > tr:nth-child(2) > td:nth-child(1) > p'
      );
      expect(collapsedCell).toHaveTextContent(content);
    });

    it('should not wrap the collapsed row in cell', () => {
      const data = tableDataFactory.buildList(1);
      const content = 'This is a collapsible row data';

      render(
        <Table
          config={{
            ...tableConfig,
            wrapCollapsedRowInCell: false,
            collapsibleDetailRenderer: () => (
              <tr>
                <td>{content}</td>
              </tr>
            ),
          }}
          data={data}
        />
      );

      const table = screen.getByRole('table');
      const collapsedCell = table.querySelector('tbody > tr:nth-child(2) > td');
      expect(collapsedCell).toHaveTextContent(content);
    });
  });

  describe('selection', () => {
    const selectableConfig = { ...tableConfig, selectable: true };
    const rowKey = ({ column1 }) => column1;

    describe('rendering', () => {
      it('should not render checkboxes when the table is not selectable', () => {
        const data = tableDataFactory.buildList(5);

        render(<Table config={tableConfig} data={data} rowKey={rowKey} />);

        expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
      });

      it('should render a checkbox for the header and each row when selectable', () => {
        const data = tableDataFactory.buildList(5);

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        expect(
          screen.getByRole('checkbox', { name: 'Select all rows' })
        ).not.toBeChecked();
        const rowCheckboxes = screen.getAllByRole('checkbox', {
          name: 'Select row',
        });
        expect(rowCheckboxes).toHaveLength(5);
        rowCheckboxes.forEach((checkbox) => expect(checkbox).not.toBeChecked());
      });

      it('should not render the selection area when nothing is selected', () => {
        const data = tableDataFactory.buildList(5);

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        expect(screen.queryByText(/selected$/)).not.toBeInTheDocument();
      });

      it('should account for the selection column in the collapsed row', () => {
        const data = tableDataFactory.buildList(1);

        render(
          <Table
            config={{
              ...selectableConfig,
              collapsibleDetailRenderer: () => <p>detail</p>,
            }}
            data={data}
            rowKey={rowKey}
          />
        );

        expect(screen.getByText('detail').closest('td')).toHaveAttribute(
          'colspan',
          '5'
        );
      });
    });

    describe('row selection', () => {
      it('should update the selected count when rows are selected', async () => {
        const user = userEvent.setup();
        const data = tableDataFactory.buildList(12);

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        const checkboxes = screen.getAllByRole('checkbox', {
          name: 'Select row',
        });
        await user.click(checkboxes[0]);
        await user.click(checkboxes[1]);
        await user.click(checkboxes[2]);

        expect(screen.getByText('3 of 12 selected')).toBeInTheDocument();
      });

      it('should hide the selection area when the last selected row is unchecked', async () => {
        const user = userEvent.setup();
        const data = tableDataFactory.buildList(12);

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        const [firstCheckbox] = screen.getAllByRole('checkbox', {
          name: 'Select row',
        });
        await user.click(firstCheckbox);
        await user.click(firstCheckbox);

        expect(firstCheckbox).not.toBeChecked();
        expect(screen.queryByText(/selected$/)).not.toBeInTheDocument();
      });

      it('should highlight the selected rows only', async () => {
        const user = userEvent.setup();
        const data = tableDataFactory.buildList(3);

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        const [firstCheckbox, secondCheckbox] = screen.getAllByRole(
          'checkbox',
          { name: 'Select row' }
        );
        await user.click(firstCheckbox);

        expect(firstCheckbox.closest('tr')).toHaveClass('!bg-jungle-green-100');
        expect(secondCheckbox.closest('tr')).not.toHaveClass(
          '!bg-jungle-green-100'
        );
      });
    });

    describe('selection area', () => {
      it('should not render the selection actions when nothing is selected', () => {
        const data = tableDataFactory.buildList(3);
        const renderSelectionActions = jest.fn(() => <button>Operate</button>);

        render(
          <Table
            config={selectableConfig}
            data={data}
            rowKey={rowKey}
            renderSelectionActions={renderSelectionActions}
          />
        );

        expect(renderSelectionActions).not.toHaveBeenCalled();
        expect(
          screen.queryByRole('button', { name: 'Operate' })
        ).not.toBeInTheDocument();
      });

      it('should render the selection actions with the selected items', async () => {
        const user = userEvent.setup();
        const data = tableDataFactory.buildList(3);
        const renderSelectionActions = jest.fn(() => <button>Operate</button>);

        render(
          <Table
            config={selectableConfig}
            data={data}
            rowKey={rowKey}
            renderSelectionActions={renderSelectionActions}
          />
        );

        const checkboxes = screen.getAllByRole('checkbox', {
          name: 'Select row',
        });
        await user.click(checkboxes[0]);
        await user.click(checkboxes[2]);

        expect(
          screen.getByRole('button', { name: 'Operate' })
        ).toBeInTheDocument();
        expect(renderSelectionActions).toHaveBeenLastCalledWith([
          data[0],
          data[2],
        ]);
      });
    });

    describe('header checkbox', () => {
      const goToNextPage = (user) =>
        user.click(
          within(screen.getByTestId('pagination')).getByLabelText('next-page')
        );

      it('should select all the rows of the current page', async () => {
        const user = userEvent.setup();
        const data = tableDataFactory.buildList(12);

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        await user.click(
          screen.getByRole('checkbox', { name: 'Select all rows' })
        );

        expect(
          screen.getByRole('checkbox', { name: 'Select all rows' })
        ).toBeChecked();
        screen
          .getAllByRole('checkbox', { name: 'Select row' })
          .forEach((checkbox) => expect(checkbox).toBeChecked());
        expect(screen.getByText('10 of 12 selected')).toBeInTheDocument();
      });

      it('should deselect all the rows of the current page', async () => {
        const user = userEvent.setup();
        const data = tableDataFactory.buildList(12);

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        const headerCheckbox = screen.getByRole('checkbox', {
          name: 'Select all rows',
        });
        await user.click(headerCheckbox);
        await user.click(headerCheckbox);

        expect(headerCheckbox).not.toBeChecked();
        screen
          .getAllByRole('checkbox', { name: 'Select row' })
          .forEach((checkbox) => expect(checkbox).not.toBeChecked());
        expect(screen.queryByText(/selected$/)).not.toBeInTheDocument();
      });

      it('should be indeterminate when only some rows of the page are selected', async () => {
        const user = userEvent.setup();
        const data = tableDataFactory.buildList(12);

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        await user.click(
          screen.getAllByRole('checkbox', { name: 'Select row' })[0]
        );

        const headerCheckbox = screen.getByRole('checkbox', {
          name: 'Select all rows',
        });
        expect(headerCheckbox).not.toBeChecked();
        expect(headerCheckbox.indeterminate).toBe(true);
      });

      it('should not change the selection of the other pages', async () => {
        const user = userEvent.setup();
        const data = tableDataFactory.buildList(12);

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        const headerCheckbox = screen.getByRole('checkbox', {
          name: 'Select all rows',
        });
        await user.click(headerCheckbox);
        await goToNextPage(user);

        expect(headerCheckbox).not.toBeChecked();
        expect(headerCheckbox.indeterminate).toBe(false);

        await user.click(headerCheckbox);
        expect(screen.getByText('12 of 12 selected')).toBeInTheDocument();

        await user.click(headerCheckbox);
        expect(screen.getByText('10 of 12 selected')).toBeInTheDocument();
      });

      it('should be disabled when there are no rows', () => {
        render(<Table config={selectableConfig} data={[]} rowKey={rowKey} />);

        expect(
          screen.getByRole('checkbox', { name: 'Select all rows' })
        ).toBeDisabled();
      });
    });

    describe('persistence', () => {
      it('should keep the selection when changing page', async () => {
        const user = userEvent.setup();
        const data = tableDataFactory.buildList(12);

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        await user.click(
          screen.getAllByRole('checkbox', { name: 'Select row' })[0]
        );
        const pagination = within(screen.getByTestId('pagination'));
        await user.click(pagination.getByLabelText('next-page'));

        expect(screen.getByText('1 of 12 selected')).toBeInTheDocument();

        await user.click(pagination.getByLabelText('prev-page'));

        expect(
          screen.getAllByRole('checkbox', { name: 'Select row' })[0]
        ).toBeChecked();
      });

      it('should keep the selection when applying and clearing a filter', async () => {
        const user = userEvent.setup();
        const data = tableDataFactory.buildList(12);

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        const checkboxes = screen.getAllByRole('checkbox', {
          name: 'Select row',
        });
        await user.click(checkboxes[0]);
        await user.click(checkboxes[1]);

        await filterTable(user, 'Column1', data[0].column1);

        const [filteredCheckbox] = screen.getAllByRole('checkbox', {
          name: 'Select row',
        });
        expect(filteredCheckbox).toBeChecked();
        expect(screen.getByText('2 of 12 selected')).toBeInTheDocument();

        await clearFilter(user, 'Column1');

        const restoredCheckboxes = screen.getAllByRole('checkbox', {
          name: 'Select row',
        });
        expect(restoredCheckboxes[0]).toBeChecked();
        expect(restoredCheckboxes[1]).toBeChecked();
      });

      it('should keep the selection when changing the items per page', async () => {
        const user = userEvent.setup();
        const data = tableDataFactory.buildList(12);

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        await user.click(
          screen.getAllByRole('checkbox', { name: 'Select row' })[0]
        );
        await user.click(screen.getByRole('combobox', { name: 'per-page' }));
        await user.click(screen.getByRole('option', { name: '20' }));

        expect(
          screen.getAllByRole('checkbox', { name: 'Select row' })[0]
        ).toBeChecked();
        expect(screen.getByText('1 of 12 selected')).toBeInTheDocument();
      });

      it('should keep the rows hidden by a filter selected', async () => {
        const user = userEvent.setup();
        const data = tableDataFactory.buildList(12);
        const renderSelectionActions = jest.fn(() => <button>Operate</button>);

        render(
          <Table
            config={selectableConfig}
            data={data}
            rowKey={rowKey}
            renderSelectionActions={renderSelectionActions}
          />
        );

        await user.click(
          screen.getAllByRole('checkbox', { name: 'Select row' })[0]
        );
        await filterTable(user, 'Column1', data[1].column1);

        const [filteredCheckbox] = screen.getAllByRole('checkbox', {
          name: 'Select row',
        });
        expect(filteredCheckbox).not.toBeChecked();
        expect(screen.getByText('1 of 12 selected')).toBeInTheDocument();
        expect(renderSelectionActions).toHaveBeenLastCalledWith([data[0]]);
      });
    });

    describe('select all and clear', () => {
      const filterKey = 'column3';
      const filterTitle = 'Column3';
      const filterValue = 'groupA';

      const buildFilterableData = () => [
        ...tableDataFactory.buildList(3, { [filterKey]: filterValue }),
        ...tableDataFactory.buildList(9),
      ];

      it('should select all the rows of all the pages', async () => {
        const user = userEvent.setup();
        const data = buildFilterableData();

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        await user.click(
          screen.getAllByRole('checkbox', { name: 'Select row' })[0]
        );
        await user.click(
          screen.getByRole('button', { name: 'Select all 12 items' })
        );

        expect(screen.getByText('12 of 12 selected')).toBeInTheDocument();
        screen
          .getAllByRole('checkbox', { name: 'Select row' })
          .forEach((checkbox) => expect(checkbox).toBeChecked());

        await user.click(
          within(screen.getByTestId('pagination')).getByLabelText('next-page')
        );

        screen
          .getAllByRole('checkbox', { name: 'Select row' })
          .forEach((checkbox) => expect(checkbox).toBeChecked());

        expect(
          screen.queryByRole('button', { name: /Select all/ })
        ).not.toBeInTheDocument();
      });

      it('should clear the selection of all the rows', async () => {
        const user = userEvent.setup();
        const data = buildFilterableData();

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        await user.click(
          screen.getAllByRole('checkbox', { name: 'Select row' })[0]
        );
        await user.click(
          screen.getByRole('button', { name: 'Select all 12 items' })
        );
        await user.click(screen.getByRole('button', { name: 'Clear' }));

        expect(screen.queryByText(/selected$/)).not.toBeInTheDocument();
        screen
          .getAllByRole('checkbox', { name: 'Select row' })
          .forEach((checkbox) => expect(checkbox).not.toBeChecked());
      });

      it('should select only the rows that match the filters', async () => {
        const user = userEvent.setup();
        const data = buildFilterableData();

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        await filterTable(user, filterTitle, filterValue);
        await user.click(
          screen.getAllByRole('checkbox', { name: 'Select row' })[0]
        );
        await user.click(
          screen.getByRole('button', { name: 'Select all 3 items' })
        );

        expect(screen.getByText('3 of 12 selected')).toBeInTheDocument();

        await clearFilter(user, filterTitle);

        const checkboxes = screen.getAllByRole('checkbox', {
          name: 'Select row',
        });
        expect(checkboxes[2]).toBeChecked();
        expect(checkboxes[3]).not.toBeChecked();
      });

      it('should keep the rows hidden by the filters when selecting all', async () => {
        const user = userEvent.setup();
        const data = buildFilterableData();

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        await user.click(
          screen.getAllByRole('checkbox', { name: 'Select row' })[5]
        );
        await filterTable(user, filterTitle, filterValue);
        await user.click(
          screen.getAllByRole('checkbox', { name: 'Select row' })[0]
        );
        await user.click(
          screen.getByRole('button', { name: 'Select all 3 items' })
        );

        expect(screen.getByText('4 of 12 selected')).toBeInTheDocument();
      });

      it('should clear only the rows that match the filters', async () => {
        const user = userEvent.setup();
        const data = buildFilterableData();

        render(<Table config={selectableConfig} data={data} rowKey={rowKey} />);

        await user.click(
          screen.getAllByRole('checkbox', { name: 'Select row' })[5]
        );
        await filterTable(user, filterTitle, filterValue);
        await user.click(
          screen.getAllByRole('checkbox', { name: 'Select row' })[0]
        );
        await user.click(
          screen.getByRole('button', { name: 'Select all 3 items' })
        );
        await user.click(screen.getByRole('button', { name: 'Clear' }));

        expect(screen.getByText('1 of 12 selected')).toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: 'Clear' })
        ).not.toBeInTheDocument();
      });
    });
  });
});
