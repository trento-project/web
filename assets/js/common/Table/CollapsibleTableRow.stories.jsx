import React from 'react';
import { action } from 'storybook/actions';
import Component from './CollapsibleTableRow';

export default {
  title: 'Components/CollapsibleTableRow',
  component: Component,
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
    collapsibleDetailRenderer: action('collapsibleDetailRenderer'),
    wrapCollapsedRowInCell: true,
    renderCells: action('renderCells'),
    colSpan: '3',
    className: '',
    collapsedRowClassName: 'bg-gray-50',
  },
};
