import { activityLogEntryFactory } from '@lib/test-utils/factories/activityLog';
import _ from 'lodash';
import ActivityLogOverview from './ActivityLogOverview';

export default {
  title: 'Components/ActivityLogOverview',
  component: ActivityLogOverview,
  argTypes: {
    activityLog: {
      description: 'List of the activity log entries',
      control: {
        type: 'array',
      },
    },
    loading: {
      description: 'Display loading state of the component',
      control: { type: 'boolean' },
    },
  },
};

export const Default = {
  args: {
    activityLog: activityLogEntryFactory.buildList(20),
  },
};

export const Loading = {
  args: {
    loading: true,
    activityLog: [],
  },
};

export const Empty = {
  args: {
    activityLog: [],
  },
};

export const UnknwonActivityType = {
  args: {
    ...Default.args,
    activityLog: [activityLogEntryFactory.build({ type: 'foo_bar' })],
  },
};

export const UnknwonLevel = {
  args: {
    ...Default.args,
    activityLog: [activityLogEntryFactory.build({ level: 'foo_bar' })],
  },
};

export const MissingLevel = {
  args: {
    ...Default.args,
    activityLog: [_.omit(activityLogEntryFactory.build(), 'level')],
  },
};
