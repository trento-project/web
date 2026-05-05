import { activityLogEntryFactory } from '@lib/test-utils/factories/activityLog';
// import _ from 'lodash';
import ActivityLogOverview from './ActivityLogOverview';

export default {
  title: 'Components/ActivityLogOverview',
  component: ActivityLogOverview,
  argTypes: {
    activityLog: {
      description: 'List of the activity log entries',
      control: { type: 'object' },
    },
    loading: {
      description: 'Display loading state of the component',
      control: { type: 'boolean' },
    },
    timezone: {
      type: 'string',
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
      defaultValue: 'Etc/UTC',
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

export const UnknownActivityType = {
  args: {
    ...Default.args,
    activityLog: [activityLogEntryFactory.build({ type: 'foo_bar' })],
  },
};

// export const UnknownLevel = {
//   args: {
//     ...Default.args,
//     activityLog: [activityLogEntryFactory.build({ level: 'foo_bar' })],
//   },
// };

// export const MissingLevel = {
//   args: {
//     ...Default.args,
//     activityLog: [_.omit(activityLogEntryFactory.build(), 'level')],
//   },
// };
