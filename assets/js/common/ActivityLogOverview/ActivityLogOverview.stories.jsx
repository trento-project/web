import { activityLogEntryFactory } from '@lib/test-utils/factories/activityLog';
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
  },
};

export const Default = {
  args: {
    activityLog: activityLogEntryFactory.buildList(20),
  },
};

export const Empty = {
  args: {
    activityLog: [],
  },
};
