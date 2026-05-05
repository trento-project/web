import React from 'react';
import Table from '.';

export default {
  title: 'Components/CollapsibleTableRow',
  component: Table,
  argTypes: {
    columns: {
      description: 'Array of column definitions',
      control: { type: 'object' },
    },
    item: {
      description: 'Data item for the row',
      control: { type: 'object' },
    },
    collapsibleDetailRenderer: {
      description: 'Function to render collapsible detail content',
      action: 'collapsibleDetailRenderer',
    },
    wrapCollapsedRowInCell: {
      description: 'Whether to wrap collapsed row content in a cell',
      control: { type: 'boolean' },
    },
    renderCells: {
      description: 'Function to render cells for the row',
      action: 'renderCells',
    },
    colSpan: {
      description: 'Number of columns to span',
      control: { type: 'text' },
    },
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
    collapsedRowClassName: {
      description: 'CSS classes for the collapsed row',
      control: { type: 'text' },
    },
  },
};

const defaultRenderCells = (columns, item) =>
  columns.map((column) => (
    <td
      key={column.key}
      className="border-b border-gray-200 bg-white px-4 py-2"
    >
      {item[column.key]}
    </td>
  ));

const defaultCollapsibleDetailRenderer = (item) => (
  <div className="p-4">
    <p>Details for {item.name}</p>
  </div>
);

export const Default = {
  args: {
    columns: [
      { title: 'Name', key: 'name' },
      { title: 'Status', key: 'status' },
      { title: 'Value', key: 'value' },
    ],
    item: {
      name: 'Sample Item',
      status: 'Active',
      value: '100',
    },
    collapsibleDetailRenderer: defaultCollapsibleDetailRenderer,
    wrapCollapsedRowInCell: true,
    renderCells: defaultRenderCells,
    colSpan: 3,
    className: '',
    collapsedRowClassName: 'bg-gray-50',
  },
};
