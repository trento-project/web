// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';

import CollapsibleTableRow from './CollapsibleTableRow';

export default {
  title: 'Components/CollapsibleTableRow',
  component: CollapsibleTableRow,
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
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
    collapsedRowClassName: {
      description: 'CSS classes for the collapsed row',
      control: { type: 'text' },
    },
    selectable: {
      description: 'Whether to render a selection checkbox cell',
      control: { type: 'boolean' },
    },
    selected: {
      description: 'Whether the row is currently selected',
      control: { type: 'boolean' },
    },
    onSelect: {
      description: 'Function called when the row checkbox is toggled',
      action: 'onSelect',
    },
  },
};

const defaultRenderCells = (columns, item) =>
  columns.map((column) => (
    <td key={column.key} className="border-b border-gray-200 px-4 py-2">
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
    className: 'bg-white',
    collapsedRowClassName: 'bg-gray-50',
  },
};

export const Selectable = {
  args: {
    ...Default.args,
    selectable: true,
    selected: false,
  },
};

export const Selected = {
  args: {
    ...Selectable.args,
    selected: true,
  },
};
