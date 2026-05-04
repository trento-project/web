import Component from './HealthSummary';

export default {
  title: 'Components/HealthSummary',
  component: Component,
  argTypes: {
    passing: {
      description: 'The passing prop',
      control: { type: 'text' },
    },
    critical: {
      description: 'The critical prop',
      control: { type: 'text' },
    },
    warning: {
      description: 'The warning prop',
      control: { type: 'text' },
    },
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
    onFilterChange: {
      description: 'Callback function invoked when filter change',
      action: 'onFilterChange',
    },
    activeFilters: {
      description: 'The activeFilters prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    passing: '',
    critical: '',
    warning: '',
    className: '',
    activeFilters: '',
  },
};
