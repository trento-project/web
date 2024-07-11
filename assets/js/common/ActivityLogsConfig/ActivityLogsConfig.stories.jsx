import { action } from '@storybook/addon-actions';
import ActivityLogsConfig from '.';

export default {
  title: 'Components/ActivityLogsConfig',
  component: ActivityLogsConfig,
  argTypes: {
    retentionTime: {
      description:
        'A structured `{value,unit}` object that defines a retention time interval. `unit` is one of `day`, `month`, `year`.',
      control: {
        type: 'object',
      },
    },
    onEditClick: {
      description: 'Callback when the edit button is clicked',
      control: { type: 'function' },
    },
    userAbilities: {
      description: 'Users abilities that allow editing activity logs settings',
      control: 'array',
    },
  },
};

export const Default = {
  args: {
    retentionTime: { value: 1, unit: 'month' },
    onEditClick: action('edit clicked'),
    userAbilities: [{ name: 'all', resource: 'all' }],
  },
};

export const WithPlurals = {
  args: {
    ...Default.args,
    retentionTime: { value: 2, unit: 'month' },
  },
};

export const WithInvalidValue = {
  args: {
    ...Default.args,
    retentionTime: { is: 'invalid' },
  },
};
export const EditUnauthorized = {
  args: {
    ...Default.args,
    userAbilities: [],
  },
};
