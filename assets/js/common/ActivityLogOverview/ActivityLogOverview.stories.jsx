import { action } from '@storybook/addon-actions';
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
    activityLogDetailModalOpen: {
      description: 'Whether the activity log entry details modal is open',
      control: { type: 'boolean' },
    },
    loading: {
      description: 'Display loading state of the component',
      control: { type: 'boolean' },
    },
    onActivityLogEntryClick: {
      description: 'Function to execute when an activity log entry is clicked',
      control: { type: 'function' },
    },
    onCloseActivityLogEntryDetails: {
      description:
        'Function to execute when the activity log entry details modal is closed',
      control: { type: 'function' },
    },
    currentPaginationData: {
      description: 'Current pagination data retrieved from the api response',
      control: { type: 'object' },
    },
    loadActivityLog: {
      description: 'Function to execute when a new pagination is applied',
      control: { type: 'function' },
    },
  },
};

export const FirstPage = {
  args: {
    activityLog: activityLogEntryFactory.buildList(20),
    currentPaginationData: {
      first: 10,
      last: null,
      start_cursor: 'start_cursor',
      end_cursor: 'end_cursor',
      has_next_page: true,
      has_previous_page: false,
    },
    loadActivityLog: action('loadActivityLog'),
  },
};

export const IntermediatePage = {
  args: {
    ...FirstPage.args,
    currentPaginationData: {
      ...FirstPage.args.currentPaginationData,
      has_next_page: true,
      has_previous_page: true,
    },
  },
};
export const LastPage = {
  args: {
    activityLog: activityLogEntryFactory.buildList(20),
    currentPaginationData: {
      ...FirstPage.args.currentPaginationData,
      has_next_page: false,
      has_previous_page: true,
    },
    loadActivityLog: action('loadActivityLog'),
  },
};
export const OnlyOnePage = {
  args: {
    ...FirstPage.args,
    currentPaginationData: {
      ...FirstPage.args.currentPaginationData,
      has_next_page: false,
      has_previous_page: false,
    },
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
    ...FirstPage.args,
    activityLog: [activityLogEntryFactory.build({ type: 'foo_bar' })],
  },
};

export const UnknwonLevel = {
  args: {
    ...FirstPage.args,
    activityLog: [activityLogEntryFactory.build({ level: 'foo_bar' })],
  },
};

export const MissingLevel = {
  args: {
    ...FirstPage.args,
    activityLog: [_.omit(activityLogEntryFactory.build(), 'level')],
  },
};
