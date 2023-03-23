import React from 'react';
import EmptyTable from './EmptyTable';

export default {
  title: 'EmptyTable',
  component: EmptyTable,
};

export function Default(args) {
  return <EmptyTable {...args} />;
}
