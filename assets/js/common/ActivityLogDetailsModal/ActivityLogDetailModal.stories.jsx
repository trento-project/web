import { action } from '@storybook/addon-actions';
import {
  activityLogEntryFactory,
  taggingMetadataFactory,
} from '@lib/test-utils/factories/activityLog';
import { RESOURCE_TAGGING } from '@lib/model/activityLog';
import { toRenderedEntry } from '@common/ActivityLogOverview/ActivityLogOverview';
import ActivityLogDetailModal from '.';

export default {
  title: 'Components/ActivityLogDetailModal',
  component: ActivityLogDetailModal,
  argTypes: {
    open: {
      description: 'Whether the dialog is open or not',
      control: {
        type: 'boolean',
      },
    },
    entry: {
      description: 'An Avtivity Log entry.',
      control: {
        type: 'object',
      },
    },
    onClose: {
      description: 'Callback when the Cancel button is clicked',
      control: { type: 'function' },
    },
  },
};

export const Default = {
  args: {
    open: false,
    entry: toRenderedEntry(activityLogEntryFactory.build()),
    onClose: action('cancel clicked'),
  },
};

export const UnknwonActivityType = {
  args: {
    ...Default.args,
    entry: toRenderedEntry(activityLogEntryFactory.build({ type: 'foo_bar' })),
  },
};

export const UnknwonResourceType = {
  args: {
    ...Default.args,
    entry: toRenderedEntry(
      activityLogEntryFactory.build({
        type: RESOURCE_TAGGING,
        metadata: taggingMetadataFactory.build({ resource_type: 'foo_bar' }),
      })
    ),
  },
};
